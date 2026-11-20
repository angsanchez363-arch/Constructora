import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.dbSsl ? { rejectUnauthorized: true } : false,
  max: 5,
  connectionTimeoutMillis: 2000,
});

// Sin este manejador, un error en una conexión inactiva (por ejemplo, la base se detuvo)
// lanza una excepción no capturada y el proceso muere. Con él, la API sigue viva y
// /api/health responde 503 hasta que la base vuelva (caso F-06).
pool.on('error', (e) => console.error('aviso: conexión inactiva con error:', e.message));
