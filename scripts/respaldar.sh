#!/usr/bin/env bash
# Respaldo cifrado de la base con restic: una copia local y una fuera del sitio (regla 3-2-1).
#
# Lo ejecuta el usuario de sistema "respaldo" por cron. Lee:
#   ~/.pgpass               credenciales del rol constructora_respaldo (permisos 600)
#   /etc/restic/password    contraseña de cifrado de los repositorios (permisos 600)
#   /etc/constructora/respaldo.conf   REPO_EXTERNO y demás valores (sin secretos)
# Opcional: URL_LATIDO, URL "push" de Uptime Kuma que se llama solo si todo salió bien (semana 7).
# Uso manual:  sudo -u respaldo /opt/respaldo/respaldar.sh
set -euo pipefail

CONF="${CONF:-/etc/constructora/respaldo.conf}"
# shellcheck disable=SC1090
[ -r "$CONF" ] && . "$CONF"

export RESTIC_PASSWORD_FILE="${RESTIC_PASSWORD_FILE:-/etc/restic/password}"
REPO_LOCAL="${REPO_LOCAL:-/var/respaldos/restic}"
REPO_EXTERNO="${REPO_EXTERNO:?Define REPO_EXTERNO en $CONF (p. ej. rest:https://respaldos.ejemplo.com/constructora)}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-constructora_respaldo}"
DB_NAME="${DB_NAME:-constructora}"

# El volcado vive solo mientras corre el script, en una carpeta que nadie más puede leer.
umask 077
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
volcado="$tmp/$DB_NAME.dump"

echo "$(date -Is) inicio"

# 1. Volcado lógico (formato custom) con el rol de solo lectura. La contraseña sale de ~/.pgpass.
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -w -Fc "$DB_NAME" -f "$volcado"
pg_restore --list "$volcado" > /dev/null          # el archivo es legible

# 2. Copia cifrada en los dos repositorios. Se entrega por la entrada estándar con un nombre
#    fijo: así todas las instantáneas son "del mismo archivo" y la retención las agrupa.
for repo in "$REPO_LOCAL" "$REPO_EXTERNO"; do
  restic -r "$repo" backup --quiet --tag db --stdin --stdin-filename "$DB_NAME.dump" < "$volcado"
done

# 3. Retención en el repositorio local: 7 diarios, 4 semanales, 12 mensuales.
#    El externo es solo-agregar: allí la retención la aplica su administrador, desde otro equipo.
restic -r "$REPO_LOCAL" forget --quiet --tag db --keep-daily 7 --keep-weekly 4 --keep-monthly 12 --prune

# 4. Verificación de la estructura del repositorio local (en cada ejecución).
restic -r "$REPO_LOCAL" check --quiet

# 5. Latido para el monitoreo (semana 7): si no llega, Uptime Kuma avisa que el respaldo falló.
if [ -n "${URL_LATIDO:-}" ]; then
  curl -fsS -m 10 --retry 3 "$URL_LATIDO" > /dev/null || echo "aviso: no se pudo enviar el latido"
fi

echo "$(date -Is) fin OK"
