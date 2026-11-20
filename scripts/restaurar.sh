#!/usr/bin/env bash
# Restauración de desastre en un servidor NUEVO, a partir de la copia fuera del sitio.
# La ejecuta OTRA persona del equipo, leyendo solo este procedimiento. Mide el tiempo total.
#
# Antes de empezar (a mano):
#   1. Servidor con Docker, restic y este repositorio clonado en /opt/constructora.
#   2. .env con las claves vigentes (del gestor de contraseñas del equipo).
#   3. /etc/restic/password con la contraseña de restic (del gestor de contraseñas).
#   4. Si quieres comparar huellas: huella-antes.txt (guardada antes del desastre).
# Uso:  sudo REPO_EXTERNO=<repositorio externo> bash scripts/restaurar.sh [huella-antes.txt]
set -euo pipefail
cd "$(dirname "$0")/.."
: "${REPO_EXTERNO:?Define REPO_EXTERNO (el mismo repositorio externo del respaldo)}"
[ -r /etc/restic/password ] || { echo "Falta /etc/restic/password (contraseña de restic)"; exit 1; }
[ -f .env ] || { echo "Falta .env"; exit 1; }
ANTES="${1:-}"
set -a; . ./.env; set +a
export RESTIC_PASSWORD_FILE=/etc/restic/password
COMPOSE="docker compose -f deploy/compose.prod.yaml --env-file .env"
INICIO=$(date +%s); hora() { date '+%H:%M:%S'; }

echo "[$(hora)] 1. Levantar SOLO la base (sin migrar: los datos vienen del respaldo)"
$COMPOSE up -d --wait db

echo "[$(hora)] 2. Roles y permisos (el volcado no trae los roles)"
bash scripts/aplicar-roles.sh

echo "[$(hora)] 3. Restaurar la última copia desde el repositorio externo"
restic -r "$REPO_EXTERNO" snapshots --tag db --latest 1
restic -r "$REPO_EXTERNO" dump --tag db latest "$POSTGRES_DB.dump" \
  | $COMPOSE exec -T db pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --exit-on-error

echo "[$(hora)] 4. Permisos de nuevo (los de la base, como CONNECT, no viajan en el volcado)"
bash scripts/aplicar-roles.sh

echo "[$(hora)] 5. Huellas"
$COMPOSE exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tA -f /sql/validar.sql > huella-despues.txt
cat huella-despues.txt
if [ -n "$ANTES" ]; then
  diff "$ANTES" huella-despues.txt && echo "HUELLAS IDÉNTICAS" || { echo "HUELLAS DISTINTAS: investiga antes de volver a servicio"; exit 1; }
fi

echo "[$(hora)] 6. Volver a servicio y prueba de humo"
$COMPOSE up -d --build --wait
bash scripts/smoke-test.sh "http://127.0.0.1:${PORT:-8000}"

FIN=$(date +%s)
echo "TIEMPO TOTAL DE LA RESTAURACIÓN: $(( (FIN-INICIO)/60 )) min $(( (FIN-INICIO)%60 )) s  (compáralo con el RTO acordado)"
