#!/usr/bin/env bash
# Endurecimiento del servidor Ubuntu (ejecutar como root, desde la raíz del proyecto en /opt/constructora).
# Crea cuentas por persona, grupo de despliegue, sudo limitado, SSH solo con llave y UFW.
#
# Uso:  sudo ADMINS="ana" OPERADORES="luis" bash scripts/endurecer-servidor.sh
#   Antes, deja la llave pública de cada persona en /root/llaves/<usuario>.pub
#   ⚠️ NO cierres tu sesión SSH actual hasta probar el acceso nuevo desde OTRA terminal.
set -euo pipefail
[ "$(id -u)" -eq 0 ] || { echo "Ejecuta con sudo"; exit 1; }
cd "$(dirname "$0")/.."
ADMINS="${ADMINS:?Define ADMINS (personas con sudo), p. ej. ADMINS=\"ana\"}"
OPERADORES="${OPERADORES:-}"
DESTINO=/opt/constructora
export DEBIAN_FRONTEND=noninteractive

echo "== 1. Paquetes =="
apt-get update -qq
apt-get install -y -qq ufw restic postgresql-client sudo openssh-server >/dev/null

echo "== 2. Grupo de despliegue y cuentas =="
getent group despliegue >/dev/null || groupadd despliegue
crear_usuario() { # usuario grupos
  local u=$1 g=$2
  id "$u" >/dev/null 2>&1 || useradd --create-home --shell /bin/bash "$u"
  usermod -aG "$g" "$u"
  if [ -r "/root/llaves/$u.pub" ]; then
    install -d -m 700 -o "$u" -g "$u" "/home/$u/.ssh"
    install -m 600 -o "$u" -g "$u" "/root/llaves/$u.pub" "/home/$u/.ssh/authorized_keys"
  else
    echo "  ⚠️  Falta /root/llaves/$u.pub: $u NO podrá entrar por SSH"
  fi
}
for u in $ADMINS;     do crear_usuario "$u" "sudo,despliegue"; done
for u in $OPERADORES; do crear_usuario "$u" "despliegue"; done
echo "  Asigna contraseña a los administradores (sudo la pide):  passwd <usuario>"

echo "== 3. Carpeta del proyecto (setgid: lo nuevo hereda el grupo) =="
if [ "$PWD" != "$DESTINO" ]; then install -d -m 2770 "$DESTINO"; cp -a . "$DESTINO"/; fi
chown -R root:despliegue "$DESTINO"
chmod 2770 "$DESTINO"
[ -f "$DESTINO/.env" ] && chmod 640 "$DESTINO/.env" && chown root:despliegue "$DESTINO/.env"

echo "== 4. sudo limitado para operadores =="
cat > /usr/local/bin/reiniciar-constructora <<'WRAP'
#!/bin/sh
# Único comando que los operadores pueden ejecutar con sudo: reinicia la API.
exec docker compose -f /opt/constructora/deploy/compose.prod.yaml --env-file /opt/constructora/.env restart api
WRAP
chmod 755 /usr/local/bin/reiniciar-constructora
echo '%despliegue ALL=(root) NOPASSWD: /usr/local/bin/reiniciar-constructora' > /etc/sudoers.d/despliegue
chmod 440 /etc/sudoers.d/despliegue
visudo -cf /etc/sudoers.d/despliegue

echo "== 5. Usuario de servicio del respaldo (sin sesión) =="
id respaldo >/dev/null 2>&1 || useradd --system --create-home --home-dir /var/lib/respaldo --shell /usr/sbin/nologin respaldo

echo "== 6. SSH: solo llave, sin root =="
cat > /etc/ssh/sshd_config.d/10-endurecer.conf <<'SSH'
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AllowGroups sudo despliegue
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
SSH
sshd -t                      # valida ANTES de recargar: si falla, no se toca nada más
systemctl reload ssh 2>/dev/null || systemctl reload sshd

echo "== 7. Firewall UFW: negar por defecto =="
ufw default deny incoming
ufw default allow outgoing
ufw limit 22/tcp comment 'SSH (solo llave)'
ufw allow 80/tcp  comment 'HTTP (redirige a HTTPS)'
ufw allow 443/tcp comment 'HTTPS (proxy inverso)'
ufw --force enable
ufw status verbose
cat <<'AVISO'

Listo. Ahora, desde OTRA terminal, comprueba:
  ssh <usuario>@<servidor>                                  # entra con llave
  ssh -o PubkeyAuthentication=no <usuario>@<servidor>       # debe rechazar la contraseña
  ssh root@<servidor>                                       # debe rechazar
Recuerda: Docker salta UFW con los puertos publicados en 0.0.0.0. Aquí la API y la base se
publican solo en 127.0.0.1 (ver deploy/compose.prod.yaml).
AVISO
