#!/usr/bin/env bash
# Busca secretos en los archivos versionados y en TODO el historial de git.
# Uso: bash scripts/revisar-secretos.sh     Código 1 si encuentra algo sospechoso.
# Si encuentras un secreto: 1) ROTA (scripts/rotar-clave.sh), 2) limpia el historial si el
# repositorio es público, 3) documéntalo en el entregable (7.5). Rotar va primero.
cd "$(dirname "$0")/.."
PATRON='(postgres(ql)?://[^:/@ ]+:[^@ ]+@|BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|glpat-[A-Za-z0-9_-]{20,}|(PASSWORD|SECRET|TOKEN|API_KEY)=[^ ]{6,})'
# Valores ficticios permitidos (los de .env.example y la documentación)
FICTICIO='(cambia-|usuario:clave|<clave>|<contraseña>|ep-ejemplo|\$\{|\$[A-Z_]+|NUEVA|xxxx)'
HALLAZGOS=0

echo "== Archivos versionados (árbol actual) =="
if git rev-parse --git-dir >/dev/null 2>&1; then ARCHIVOS=$(git ls-files); else ARCHIVOS=$(find . -type f -not -path './node_modules/*' -not -path './.git/*'); fi
while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in package-lock.json|*.png|*.jpg|*.svg|evidencias/*) continue ;; esac
  R=$(grep -InE "$PATRON" "$f" 2>/dev/null | grep -vE "$FICTICIO" | sed "s|^|$f:|")
  [ -n "$R" ] && { echo "$R"; HALLAZGOS=1; }
done <<< "$ARCHIVOS"

echo "== Historial de git =="
if git rev-parse --git-dir >/dev/null 2>&1; then
  R=$(git log -p --all -G"$PATRON" --pretty=format:'commit %h' 2>/dev/null | grep -E "^\+[^+].*($PATRON)" | grep -vE "$FICTICIO")
  [ -n "$R" ] && { echo "$R"; HALLAZGOS=1; }
  R=$(git log --all --name-only --pretty=format: | grep -E '(^|/)\.env$' | sort -u)
  [ -n "$R" ] && { echo "¡Un .env estuvo en el historial!: $R"; HALLAZGOS=1; }
else
  echo "(no es un repositorio git: ejecuta este script dentro del clon del proyecto)"
fi

if [ "$HALLAZGOS" -eq 0 ]; then echo "SIN HALLAZGOS: ningún secreto en el árbol ni en el historial."; exit 0
else echo "HALLAZGOS: revisa lo anterior, rota y documenta."; exit 1; fi
