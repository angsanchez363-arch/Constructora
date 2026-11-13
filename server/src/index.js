import http from 'node:http';
import { config } from './config.js'; // valida la configuración ANTES de cargar nada más

const { pool } = await import('./db.js');
const CATEGORIAS = ['Cemento y concreto', 'Acero', 'Mampostería', 'Acabados', 'Eléctrico', 'Hidráulico'];

const json = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

const leerCuerpo = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (d) => { data += d; if (data.length > 1e5) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { reject(new Error('json')); } });
  });

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://x');
  try {
    // Readiness: 200 solo si alcanza la base. Sin efectos secundarios y sin datos sensibles.
    if (req.method === 'GET' && pathname === '/api/health') {
      try {
        await pool.query('SELECT 1');
        return json(res, 200, { status: 'ok', db: 'ok', version: config.version });
      } catch {
        return json(res, 503, { status: 'degradado', db: 'no disponible' });
      }
    }
    if (req.method === 'GET' && pathname === '/api/version') return json(res, 200, { version: config.version });
    if (req.method === 'GET' && pathname === '/api/materiales') {
      const { rows } = await pool.query('SELECT * FROM materiales ORDER BY id');
      return json(res, 200, rows);
    }
    if (req.method === 'GET' && pathname === '/api/obras') {
      const { rows } = await pool.query('SELECT * FROM obras ORDER BY id');
      return json(res, 200, rows);
    }
    if (req.method === 'POST' && pathname === '/api/materiales') {
      const m = await leerCuerpo(req);
      const valido = m.id && m.nombre && CATEGORIAS.includes(m.categoria) && m.unidad &&
        Number(m.precio) >= 0 && Number.isInteger(m.stock) && m.stock >= 0 &&
        Number.isInteger(m.stock_minimo) && m.stock_minimo >= 0;
      if (!valido) return json(res, 422, { error: 'datos inválidos' });
      try {
        await pool.query(
          'INSERT INTO materiales (id,nombre,categoria,unidad,precio,stock,stock_minimo,emoji,descripcion) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
          [m.id, m.nombre, m.categoria, m.unidad, m.precio, m.stock, m.stock_minimo, m.emoji ?? null, m.descripcion ?? null]);
        return json(res, 201, { id: m.id });
      } catch (e) {
        if (e.code === '23505') return json(res, 409, { error: 'ya existe un material con ese id' });
        throw e;
      }
    }
    if (req.method === 'DELETE' && pathname.startsWith('/api/materiales/')) {
      const r = await pool.query('DELETE FROM materiales WHERE id = $1', [decodeURIComponent(pathname.split('/').pop())]);
      return json(res, r.rowCount ? 200 : 404, r.rowCount ? { eliminado: true } : { error: 'no encontrado' });
    }
    return json(res, 404, { error: 'ruta no encontrada' });
  } catch (e) {
    console.error('error:', e.message);
    return json(res, 500, { error: 'error interno' });
  }
});

server.listen(config.port, '0.0.0.0', () => console.log(`constructora-api ${config.version} escuchando en :${config.port}`));
process.on('SIGTERM', () => server.close(() => pool.end().then(() => process.exit(0))));
