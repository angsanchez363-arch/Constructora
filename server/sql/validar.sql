-- Huella de la base: filas y checksum por tabla. Se ejecuta en origen y en destino;
-- las salidas deben ser idénticas.
SELECT 'materiales' AS tabla, count(*) AS filas, md5(coalesce(string_agg(t::text, ',' ORDER BY id), '')) AS checksum FROM materiales t
UNION ALL
SELECT 'obras', count(*), md5(coalesce(string_agg(t::text, ',' ORDER BY id), '')) FROM obras t
UNION ALL
SELECT 'obra_materiales', count(*), md5(coalesce(string_agg(t::text, ',' ORDER BY obra_id, material_id), '')) FROM obra_materiales t
UNION ALL
SELECT 'schema_migrations', count(*), md5(coalesce(string_agg(version, ',' ORDER BY version), '')) FROM schema_migrations
ORDER BY 1;
