#!/usr/bin/env bash
# Prepara el respaldo automático en el servidor (ejecutar como root, desde la raíz del proyecto).
# Uso: sudo REPO_EXTERNO=rest:https://respaldos.ejemplo.com/constructora bash scripts/configurar-respaldo.sh
#      (o sftp:respaldo@servidor-externo:/respaldos/constructora)
# Crea el usuario "respaldo" (sin sesión), instala el script en /opt/respaldo, guarda la clave del
# rol constructora_respaldo en su .pgpass, genera la contraseña de restic (si no existe), inicia
# los repositorios y programa el cron a las 2:15 a. m.
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Ejecuta con sudo"; exit 1; }
cd "$(dirname "$0")/.."
: "${REPO_EXTERNO:?Define REPO_EXTERNO (repositorio restic fuera del sitio)}"
ENV_FILE="${ENV_FILE:-$PWD/.env}"
set -a; . "$ENV_FILE"; set +a
: "${RESPALDO_PASSWORD:?Falta RESPALDO_PASSWORD en $ENV_FILE}"

id respaldo >/dev/null 2>&1 || useradd --system --create-home --home-dir /var/lib/respaldo --shell /usr/sbin/nologin respaldo
install -d -m 755 /opt/respaldo /etc/constructora
install -m 755 scripts/respaldar.sh /opt/respaldo/respaldar.sh
install -d -o respaldo -g respaldo -m 700 /var/respaldos
install -d -o respaldo -g respaldo -m 750 /var/log/respaldo

# Credenciales del rol de solo lectura (nunca las del administrador)
umask 077
echo "127.0.0.1:${DB_HOST_PORT:-5432}:${POSTGRES_DB}:constructora_respaldo:${RESPALDO_PASSWORD}" > /var/lib/respaldo/.pgpass
chown respaldo:respaldo /var/lib/respaldo/.pgpass; chmod 600 /var/lib/respaldo/.pgpass

# Valores no secretos
cat > /etc/constructora/respaldo.conf <<CONF
REPO_EXTERNO="$REPO_EXTERNO"
DB_PORT="${DB_HOST_PORT:-5432}"
DB_NAME="${POSTGRES_DB}"
CONF
chmod 644 /etc/constructora/respaldo.conf

# Contraseña de cifrado de restic
install -d -m 700 -o respaldo -g respaldo /etc/restic
if [ ! -s /etc/restic/password ]; then
  head -c 32 /dev/urandom | base64 > /etc/restic/password
  echo ">>> CONTRASEÑA DE RESTIC GENERADA. Guárdala AHORA fuera del servidor (gestor de contraseñas del equipo):"
  cat /etc/restic/password
  echo ">>> Sin ella NO se puede restaurar ningún respaldo."
fi
chown respaldo:respaldo /etc/restic/password; chmod 600 /etc/restic/password

# Repositorios (si ya existen, init falla y se ignora)
restic_r() { sudo -u respaldo env RESTIC_PASSWORD_FILE=/etc/restic/password restic "$@"; }
restic_r -r /var/respaldos/restic cat config >/dev/null 2>&1 || restic_r -r /var/respaldos/restic init
restic_r -r "$REPO_EXTERNO"        cat config >/dev/null 2>&1 || restic_r -r "$REPO_EXTERNO" init

# Cron: todos los días a las 2:15 a. m. (RPO = 24 h)
cat > /etc/cron.d/respaldo-constructora <<'CRON'
# m h dom mes dow usuario comando
15 2 * * * respaldo /opt/respaldo/respaldar.sh >> /var/log/respaldo/respaldo.log 2>&1
CRON
chmod 644 /etc/cron.d/respaldo-constructora
echo "Listo. Primer respaldo manual:  sudo -u respaldo /opt/respaldo/respaldar.sh"
