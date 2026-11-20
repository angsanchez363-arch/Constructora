#!/usr/bin/env bash
# Crea/actualiza los roles (01-roles.sql) y sus permisos (02-permisos.sql). Es idempotente.
# Uso:  bash scripts/aplicar-roles.sh            # base local (contenedor db)
#       NUBE_URL=... bash scripts/aplicar-roles.sh nube   # base gestionada (Neon/Supabase)
# Úsalo: al reconstruir un servidor (antes de restaurar), después de restaurar, tras migrar a
# la nube y para aplicar una contraseña nueva de .env.
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
COMPOSE="docker compose -f deploy/compose.prod.yaml --env-file .env"
ENTORNO=(-e OWNER_PASSWORD -e APP_PASSWORD -e RESPALDO_PASSWORD)

if [ "${1:-local}" = "nube" ]; then
  : "${NUBE_URL:?Define NUBE_URL en la terminal (read -s NUBE_URL; export NUBE_URL)}"
  $COMPOSE exec -T "${ENTORNO[@]}" db psql "$NUBE_URL" -v ON_ERROR_STOP=1 -f /sql/01-roles.sql -f /sql/02-permisos.sql
else
  $COMPOSE exec -T "${ENTORNO[@]}" db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 \
    -f /sql/01-roles.sql -f /sql/02-permisos.sql
fi
echo "Roles y permisos aplicados."
