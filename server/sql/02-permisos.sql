-- Paso 2 de 2: permisos sobre la base. Idempotente; se puede ejecutar antes de las migraciones
-- (primer arranque), después de restaurar un respaldo o después de migrar a la nube.
-- Ejecutar con un administrador:  bash scripts/aplicar-roles.sh
\set ON_ERROR_STOP on

-- Nadie entra a la base "por defecto": solo los roles nombrados.
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database()) \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO constructora_owner, constructora_app, constructora_respaldo',
              current_database()) \gexec

-- El dueño necesita poder cederse objetos a sí mismo (en la nube el administrador no es superusuario).
GRANT constructora_owner TO CURRENT_USER;

-- El esquema y las tablas que existan (p. ej. tras restaurar en la nube) pasan al dueño.
ALTER SCHEMA public OWNER TO constructora_owner;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I OWNER TO constructora_owner', r.tablename);
  END LOOP;
  FOR r IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER SEQUENCE public.%I OWNER TO constructora_owner', r.sequencename);
  END LOOP;
END $$;

-- La app usa el esquema y manipula filas, sin CREATE, DROP, ALTER ni TRUNCATE.
GRANT USAGE ON SCHEMA public TO constructora_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO constructora_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO constructora_app;

-- Tablas y secuencias que el dueño cree en el futuro (nuevas migraciones) heredan los permisos.
ALTER DEFAULT PRIVILEGES FOR ROLE constructora_owner IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO constructora_app;
ALTER DEFAULT PRIVILEGES FOR ROLE constructora_owner IN SCHEMA public
    GRANT USAGE ON SEQUENCES TO constructora_app;

-- El control de migraciones es solo del dueño.
DO $$ BEGIN
  IF to_regclass('public.schema_migrations') IS NOT NULL THEN
    REVOKE ALL ON public.schema_migrations FROM constructora_app;
  END IF;
END $$;
