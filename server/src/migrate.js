// Migraciones simples y versionadas. La tabla schema_migrations viaja con los datos
// en la migración a la nube: así la app no intenta crear tablas que ya existen.
import { readFileSync } from 'node:fs';
import { config } from './config.js';

const { pool } = await import('./db.js');
const seed = JSON.parse(readFileSync(new URL('../sql/seed.json', import.meta.url), 'utf8'));

const MIGRACIONES = [
  {
    version: '001_esquema',
    sql: `
      CREATE TABLE materiales (
        id TEXT PRIMARY KEY, nombre TEXT NOT NULL, categoria TEXT NOT NULL, unidad TEXT NOT NULL,
        precio NUMERIC(14,2) NOT NULL CHECK (precio >= 0), stock INTEGER NOT NULL CHECK (stock >= 0),
        stock_minimo INTEGER NOT NULL CHECK (stock_minimo >= 0), emoji TEXT, descripcion TEXT
      );
      CREATE TABLE obras (
        id TEXT PRIMARY KEY, nombre TEXT NOT NULL, cliente TEXT NOT NULL, ubicacion TEXT NOT NULL,
        estado TEXT NOT NULL CHECK (estado IN ('planeacion','en_curso','finalizada')),
        avance INTEGER NOT NULL CHECK (avance BETWEEN 0 AND 100),
        presupuesto NUMERIC(16,2) NOT NULL, fecha_inicio DATE NOT NULL, descripcion TEXT
      );
      CREATE TABLE obra_materiales (
        obra_id TEXT REFERENCES obras(id), material_id TEXT REFERENCES materiales(id),
        PRIMARY KEY (obra_id, material_id)
      );`,
  },
  {
    version: '002_datos_iniciales',
    run: async (c) => {
      for (const m of seed.materiales)
        await c.query('INSERT INTO materiales VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [m.id, m.name, m.category, m.unit, m.price, m.stock, m.minStock, m.emoji, m.description]);
      for (const o of seed.obras) {
        await c.query('INSERT INTO obras VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [o.id, o.nombre, o.cliente, o.ubicacion, o.estado, o.avance, o.presupuesto, o.fechaInicio, o.descripcion]);
        for (const mid of o.materialIds)
          await c.query('INSERT INTO obra_materiales VALUES ($1,$2)', [o.id, mid]);
      }
    },
  },
];

const c = await pool.connect();
try {
  await c.query('CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, aplicada_en TIMESTAMPTZ DEFAULT now())');
  const { rows } = await c.query('SELECT version FROM schema_migrations');
  const hechas = new Set(rows.map((r) => r.version));
  for (const m of MIGRACIONES) {
    if (hechas.has(m.version)) continue;
    await c.query('BEGIN');
    try {
      if (m.sql) await c.query(m.sql);
      if (m.run) await m.run(c);
      await c.query('INSERT INTO schema_migrations (version) VALUES ($1)', [m.version]);
      await c.query('COMMIT');
      console.log(`migración aplicada: ${m.version}`);
    } catch (e) {
      await c.query('ROLLBACK');
      throw e;
    }
  }
  console.log('migraciones al día');
} catch (e) {
  console.error('ERROR en la migración:', e.message);
  process.exitCode = 1;
} finally {
  c.release();
  await pool.end();
}
