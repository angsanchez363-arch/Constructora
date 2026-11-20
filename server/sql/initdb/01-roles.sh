#!/bin/sh
# Se ejecuta UNA vez, al crear el volumen de PostgreSQL por primera vez (initdb).
# Las contraseñas llegan por variables de entorno del contenedor; no están en el repositorio.
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /sql/01-roles.sql -f /sql/02-permisos.sql
