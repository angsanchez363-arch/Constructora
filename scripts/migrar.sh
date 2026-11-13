#!/usr/bin/env bash
# Migración a una base gestionada con ventana de mantenimiento.
# Uso:  read -s NUBE_URL; export NUBE_URL     # pega la cadena; no queda en el historial ni en archivos
#       bash scripts/migrar.sh
# Requiere el stack de deploy/compose.prod.yaml levantado (contenedor "db" = origen, pg 17).
set -euo pipefail
: "${NUBE_URL:?Define NUBE_URL en la terminal (read -s NUBE_URL; export NUBE_URL)}"
COMPOSE="docker compose -f deploy/compose.prod.yaml --env-file .env"
hora() { date '+%H:%M:%S'; }
set -a; . ./.env; set +a

echo "[$(hora)] 1. Congelar escrituras (detener la API)";  $COMPOSE stop api
echo "[$(hora)] 2. Respaldo/volcado del origen";           $COMPOSE exec -T db pg_dump -U "$POSTGRES_USER" -Fc "$POSTGRES_DB" -f /respaldos/migracion.dump
echo "[$(hora)] 3. Restauración en el destino";            $COMPOSE exec -T db pg_restore -d "$NUBE_URL" --no-owner --no-acl /respaldos/migracion.dump
echo "[$(hora)] 4. Huellas";
$COMPOSE exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA -f /sql/validar.sql > huella-origen.txt
$COMPOSE exec -T db psql "$NUBE_URL" -tA -f /sql/validar.sql > huella-destino.txt
if diff huella-origen.txt huella-destino.txt; then
  echo "HUELLAS IDÉNTICAS"
else
  echo "HUELLAS DISTINTAS: NO cortar. Rollback: reiniciar la API contra el origen ($COMPOSE start api)"; exit 1
fi
echo "[$(hora)] 5. Corte: cambia DATABASE_URL en .env a la nube (con DB_SSL=true) y ejecuta:"
echo "   $COMPOSE up -d --wait api && bash scripts/smoke-test.sh"
echo "   Rollback antes del punto de no retorno: volver DATABASE_URL al origen y repetir el comando."
