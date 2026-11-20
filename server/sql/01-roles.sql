-- Paso 1 de 2: roles de mínimo privilegio. Sin contraseñas: salen del entorno (OWNER_PASSWORD,
-- APP_PASSWORD, RESPALDO_PASSWORD). Es idempotente: crea los roles que faltan y SIEMPRE fija la
-- contraseña vigente, así que también sirve para rotarla. Los roles son del servidor, no de la
-- base: pg_dump NO los respalda; este archivo se ejecuta al reconstruir, ANTES de restaurar.
-- Uso:  bash scripts/aplicar-roles.sh   (o, en el primer arranque, lo ejecuta initdb/01-roles.sh)
\set ON_ERROR_STOP on
\getenv owner_pass OWNER_PASSWORD
\getenv app_pass APP_PASSWORD
\getenv respaldo_pass RESPALDO_PASSWORD

\if :{?owner_pass}
  \if :{?app_pass}
    \if :{?respaldo_pass}
      \set claves_definidas true
    \endif
  \endif
\endif
\if :{?claves_definidas}
\else
  DO $$ BEGIN RAISE EXCEPTION 'Faltan OWNER_PASSWORD, APP_PASSWORD o RESPALDO_PASSWORD en el entorno'; END $$;
\endif
SELECT (:'owner_pass' = '' OR :'app_pass' = '' OR :'respaldo_pass' = '') AS hay_vacias \gset
\if :hay_vacias
  DO $$ BEGIN RAISE EXCEPTION 'OWNER_PASSWORD, APP_PASSWORD y RESPALDO_PASSWORD no pueden estar vacías'; END $$;
\endif

-- 1. Dueño: crea y modifica tablas (migraciones). No es superusuario ni crea roles.
-- 2. App: solo lee y escribe filas. No crea, no borra, no altera tablas.
-- 3. Respaldo: solo lectura de todo, para pg_dump.
SELECT format('CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE', r.rol)
FROM (VALUES ('constructora_owner'), ('constructora_app'), ('constructora_respaldo')) AS r(rol)
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r.rol)
\gexec

ALTER ROLE constructora_owner    PASSWORD :'owner_pass';
ALTER ROLE constructora_app      PASSWORD :'app_pass';
ALTER ROLE constructora_respaldo PASSWORD :'respaldo_pass';

GRANT pg_read_all_data TO constructora_respaldo;
