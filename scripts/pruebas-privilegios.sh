#!/usr/bin/env bash
# Pruebas negativas de privilegios. Cada operación corre dentro de BEGIN ... ROLLBACK: no deja
# datos. Se conecta por TCP (-h db) para que PostgreSQL pida contraseña (por el socket local
# del contenedor la autenticación es "trust"). La salida es la tabla 7.4 del entregable.
# Uso: bash scripts/pruebas-privilegios.sh        Código de salida 1 si algo no es lo esperado.
set -uo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
COMPOSE="docker compose -f deploy/compose.prod.yaml --env-file .env"
FALLAS=0

# probar ROL CLAVE ESPERADO(OK|ERROR) "operación" "sql"
probar() {
  local rol=$1 clave=$2 esperado=$3 desc=$4 sql=$5 salida estado simbolo obtenido
  if salida=$($COMPOSE exec -T -e PGPASSWORD="$clave" db psql -h db -U "$rol" -d "$POSTGRES_DB" \
        -v ON_ERROR_STOP=1 -tA -c "BEGIN; $sql; ROLLBACK;" 2>&1); then estado=OK; else estado=ERROR; fi
  [ "$esperado" = OK ] && simbolo='✅' || simbolo='❌'
  if [ "$estado" = OK ]; then obtenido='permitido'; else obtenido=$(echo "$salida" | grep -m1 -E 'ERROR|FATAL' | sed 's/^[A-Z]*: *//' | cut -c1-80); fi
  [ "$estado" = "$esperado" ] || { FALLAS=$((FALLAS+1)); obtenido="INESPERADO: $obtenido"; }
  echo "| $rol | \`$desc\` | $simbolo | $obtenido |"
}

INS="INSERT INTO materiales (id,nombre,categoria,unidad,precio,stock,stock_minimo) VALUES ('prueba-priv','x','Acero','un',1,1,0)"
echo "| Rol | Operación | Esperado | Obtenido |"
echo "|---|---|:---:|---|"
probar constructora_app "$APP_PASSWORD" OK    "SELECT en materiales"          "SELECT count(*) FROM materiales"
probar constructora_app "$APP_PASSWORD" OK    "INSERT en materiales"          "$INS"
probar constructora_app "$APP_PASSWORD" OK    "UPDATE en materiales"          "UPDATE materiales SET stock = stock WHERE id = 'mat-01'"
probar constructora_app "$APP_PASSWORD" OK    "DELETE en materiales"          "DELETE FROM materiales WHERE id = 'no-existe'"
probar constructora_app "$APP_PASSWORD" ERROR "DROP TABLE materiales"         "DROP TABLE materiales"
probar constructora_app "$APP_PASSWORD" ERROR "TRUNCATE materiales"           "TRUNCATE materiales"
probar constructora_app "$APP_PASSWORD" ERROR "ALTER TABLE materiales"        "ALTER TABLE materiales ADD COLUMN x int"
probar constructora_app "$APP_PASSWORD" ERROR "CREATE TABLE prueba"           "CREATE TABLE prueba (x int)"
probar constructora_app "$APP_PASSWORD" ERROR "SELECT en schema_migrations"   "SELECT * FROM schema_migrations"
probar constructora_app "$APP_PASSWORD" ERROR "CREATE ROLE intruso"           "CREATE ROLE intruso"
probar constructora_app "clave-incorrecta" ERROR "conexión con clave incorrecta" "SELECT 1"
probar constructora_respaldo "$RESPALDO_PASSWORD" OK    "SELECT en materiales" "SELECT count(*) FROM materiales"
probar constructora_respaldo "$RESPALDO_PASSWORD" ERROR "INSERT en materiales" "$INS"
probar constructora_respaldo "$RESPALDO_PASSWORD" ERROR "DELETE en materiales" "DELETE FROM materiales"
probar constructora_owner "$OWNER_PASSWORD" OK    "CREATE TABLE prueba (migraciones)" "CREATE TABLE prueba (x int)"
probar constructora_owner "$OWNER_PASSWORD" ERROR "CREATE ROLE intruso"      "CREATE ROLE intruso"
probar constructora_owner "$OWNER_PASSWORD" ERROR "CREATE DATABASE otra"     "CREATE DATABASE otra"
echo
if [ "$FALLAS" -eq 0 ]; then echo "RESULTADO: todas las pruebas dieron lo esperado"; else echo "RESULTADO: $FALLAS prueba(s) inesperadas"; exit 1; fi
