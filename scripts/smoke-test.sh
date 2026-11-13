#!/usr/bin/env bash
# Prueba de humo posterior al despliegue.
# Uso: bash scripts/smoke-test.sh [URL_BASE]     (por defecto http://127.0.0.1:8000)
# Código de salida 0 = todo bien, 1 = alguna verificación falló (útil en CI y para decidir rollback).
set -u
BASE="${1:-http://127.0.0.1:8000}"
FALLAS=0
ID="smoke-test-$$"

ok()   { echo "  OK    $1"; }
fallo(){ echo "  FALLO $1"; FALLAS=$((FALLAS+1)); }
codigo() { curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$@"; }

echo "Prueba de humo contra $BASE"

# 1. Salud
[ "$(codigo "$BASE/api/health")" = "200" ] && ok "GET /api/health -> 200" || fallo "GET /api/health debía dar 200"

# 2. Encabezado Content-Type de /api/health (verificación propia)
curl -sI --max-time 5 "$BASE/api/health" | tr -d '\r' | grep -iq '^content-type: application/json' \
  && ok "/api/health responde application/json" || fallo "/api/health sin Content-Type application/json"

# 3. Versión desplegada distinta de "dev" (verificación propia: en un servidor nunca debe ir sin versión)
VERSION=$(curl -s --max-time 5 "$BASE/api/version")
echo "$VERSION" | grep -q '"version":"dev"' && fallo "la versión es 'dev' (APP_VERSION sin definir)" || ok "versión desplegada: $VERSION"

# 4. Datos: el listado de materiales es un arreglo JSON no vacío
curl -s --max-time 5 "$BASE/api/materiales" | grep -q '^\[{' && ok "GET /api/materiales devuelve datos" || fallo "GET /api/materiales vacío o inválido"

# 5. Caso feliz: crear un material de prueba
CUERPO="{\"id\":\"$ID\",\"nombre\":\"Material de prueba\",\"categoria\":\"Acero\",\"unidad\":\"un\",\"precio\":1000,\"stock\":1,\"stock_minimo\":0}"
[ "$(codigo -X POST -H 'Content-Type: application/json' -d "$CUERPO" "$BASE/api/materiales")" = "201" ] \
  && ok "POST /api/materiales -> 201" || fallo "POST /api/materiales debía dar 201"

# 6. Errores esperados: duplicado -> 409, inválido -> 422
[ "$(codigo -X POST -H 'Content-Type: application/json' -d "$CUERPO" "$BASE/api/materiales")" = "409" ] \
  && ok "id duplicado -> 409" || fallo "id duplicado debía dar 409"
[ "$(codigo -X POST -H 'Content-Type: application/json' -d '{"id":"x"}' "$BASE/api/materiales")" = "422" ] \
  && ok "datos inválidos -> 422" || fallo "datos inválidos debían dar 422"

# 7. Limpieza: no dejar datos basura
[ "$(codigo -X DELETE "$BASE/api/materiales/$ID")" = "200" ] && ok "limpieza del material de prueba" || fallo "no se pudo limpiar $ID"

if [ "$FALLAS" -eq 0 ]; then echo "RESULTADO: TODO EN VERDE"; exit 0; else echo "RESULTADO: $FALLAS verificación(es) fallaron"; exit 1; fi
