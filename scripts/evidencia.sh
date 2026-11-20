#!/usr/bin/env bash
# Reúne la evidencia de las semanas 5 y 6 en evidencias/<fecha>.txt para pegarla en los entregables.
# No imprime secretos. Ejecútalo en el servidor con el stack levantado.
# Uso: bash scripts/evidencia.sh [URL_BASE]
cd "$(dirname "$0")/.."
URL="${1:-http://127.0.0.1:8000}"
SALIDA="evidencias/$(date +%Y%m%d-%H%M).txt"
mkdir -p evidencias
COMPOSE="docker compose -f deploy/compose.prod.yaml --env-file .env"
{
  echo "# Evidencia generada $(date -Is) en $(hostname)"
  echo; echo "## docker compose ps";           $COMPOSE ps
  echo; echo "## Puertos escuchando (la base solo en 127.0.0.1)"; ss -tlnp 2>/dev/null | grep -E ':(5432|8000|22|80|443)\b' || echo "(ss no disponible)"
  echo; echo "## UFW";                         ufw status verbose 2>/dev/null || echo "(ufw no disponible o sin permisos: ejecuta con sudo)"
  echo; echo "## SSH efectivo";                sshd -T 2>/dev/null | grep -Ei '^(permitrootlogin|passwordauthentication|pubkeyauthentication|allowgroups)' || echo "(ejecuta con sudo)"
  echo; echo "## Permisos de archivos sensibles"; ls -ld /opt/constructora /opt/constructora/.env 2>/dev/null
  echo; echo "## Prueba de humo contra $URL";  bash scripts/smoke-test.sh "$URL"
  echo; echo "## Pruebas de privilegios (tabla 7.4)"; bash scripts/pruebas-privilegios.sh
  echo; echo "## Revisión de secretos (árbol e historial)"; bash scripts/revisar-secretos.sh
  echo; echo "## Respaldos"; tail -n 5 /var/log/respaldo/respaldo.log 2>/dev/null || echo "(sin log de respaldo todavía)"
} 2>&1 | tee "$SALIDA"
echo; echo "Guardado en $SALIDA (no lo subas al repositorio si agregas datos sensibles)."
