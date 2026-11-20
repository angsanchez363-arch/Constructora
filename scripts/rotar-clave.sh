#!/usr/bin/env bash
# Rota la contraseña de un rol: genera una nueva, la aplica en PostgreSQL, actualiza .env y
# reinicia lo que la usa. La clave nueva nunca se imprime ni queda en el historial de la terminal.
# Uso: bash scripts/rotar-clave.sh app|owner|respaldo|admin
# Después: comprueba que la clave VIEJA ya no entra (bash scripts/pruebas-privilegios.sh) y
# actualiza el gestor de contraseñas del equipo.
set -euo pipefail
cd "$(dirname "$0")/.."
ROL="${1:?Uso: rotar-clave.sh app|owner|respaldo|admin}"
COMPOSE="docker compose -f deploy/compose.prod.yaml --env-file .env"
set -a; . ./.env; set +a
NUEVA=$(openssl rand -hex 24)          # solo letras y números: segura dentro de una URL

# actualizar_env VARIABLE VALOR  (reemplaza la línea; permisos de .env no cambian)
actualizar_env() { sed -i "s|^$1=.*|$1=$2|" .env; }

case "$ROL" in
  app)      SQLROL=constructora_app;      actualizar_env APP_PASSWORD "$NUEVA"
            actualizar_env DATABASE_URL "postgresql://constructora_app:$NUEVA@db:5432/$POSTGRES_DB" ;;
  owner)    SQLROL=constructora_owner;    actualizar_env OWNER_PASSWORD "$NUEVA"
            actualizar_env MIGRATION_DATABASE_URL "postgresql://constructora_owner:$NUEVA@db:5432/$POSTGRES_DB" ;;
  respaldo) SQLROL=constructora_respaldo; actualizar_env RESPALDO_PASSWORD "$NUEVA" ;;
  admin)    SQLROL="$POSTGRES_USER";      actualizar_env POSTGRES_PASSWORD "$NUEVA" ;;
  *) echo "Rol desconocido: $ROL"; exit 1 ;;
esac

# La clave viaja por la entrada estándar (no por argumentos de proceso).
printf "ALTER ROLE %s PASSWORD '%s';\n" "$SQLROL" "$NUEVA" \
  | $COMPOSE exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1

case "$ROL" in
  app)      $COMPOSE up -d --wait api ;;
  respaldo) echo "Actualiza ~respaldo/.pgpass con la clave nueva (sudo scripts/configurar-respaldo.sh la reescribe)." ;;
  admin)    echo "Recuerda: POSTGRES_PASSWORD solo se usa al crear el volumen; la clave ya cambió en la base." ;;
esac
echo "Clave de '$SQLROL' rotada. Guarda la nueva (está en .env) en el gestor de contraseñas del equipo."
