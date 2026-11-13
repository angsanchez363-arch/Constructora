import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  ssl: config.dbSsl ? { rejectUnauthorized: true } : false,
  max: 5,
  connectionTimeoutMillis: 2000,
});
// Sin este manejador, una caída de la base mientras la conexión está inactiva emite un
// evento 'error' sin atender y el proceso muere. Con él, la API sigue viva y /api/health responde 503.
pool.on('error', (e) => console.error('conexión inactiva con la base perdida:', e.message)); 
pool.on('error', (e) => console.error('conexion inactiva con la base perdida:', e.message));
