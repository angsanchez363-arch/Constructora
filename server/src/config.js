// Configuración solo por variables de entorno. Si falta algo obligatorio, el proceso
// termina con código 1 y un mensaje claro (fallar rápido), en vez de fallar después.
const OBLIGATORIAS = {
  DATABASE_URL: 'cadena de conexión a PostgreSQL, p. ej. postgresql://usuario:clave@host:5432/base',
};

const faltantes = Object.keys(OBLIGATORIAS).filter((k) => !process.env[k]?.trim());
if (faltantes.length > 0) {
  const detalle = faltantes.map((k) => `  - ${k}: ${OBLIGATORIAS[k]}`).join('\n');
  console.error(
    `ERROR DE CONFIGURACIÓN: faltan variables de entorno obligatorias:\n${detalle}\n` +
      'Cópialas desde .env.example a .env (o defínelas en el panel de tu proveedor) y vuelve a iniciar.'
  );
  process.exit(1);
}

const port = Number(process.env.PORT ?? 8000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`ERROR DE CONFIGURACIÓN: PORT="${process.env.PORT}" no es un puerto válido (1-65535).`);
  process.exit(1);
}

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  port,
  version: process.env.APP_VERSION ?? 'dev',
  // Las bases gestionadas (Neon, Supabase) exigen SSL: se activa con DB_SSL=true
  dbSsl: process.env.DB_SSL === 'true',
};
