#!/bin/sh
# Auto-deploy: corré esto por cron cada pocos minutos en el VPS.
# Si hay commits nuevos en origin/main, hace git pull + rebuild del contenedor.
# No hace nada (ni loguea) si no hay cambios, para no ensuciar el log.
set -eu

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$REPO_DIR/logs"
LOG_FILE="$LOG_DIR/deploy.log"
LOCK_FILE="$LOG_DIR/deploy.lock"

mkdir -p "$LOG_DIR"

# Evita que dos corridas se pisen si el build anterior todavía sigue.
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
	exit 0
fi

cd "$REPO_DIR"

log() {
	echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >>"$LOG_FILE"
}

git fetch origin main --quiet

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
	exit 0
fi

if [ -n "$(git status --porcelain)" ]; then
	log "⚠️ Hay cambios locales sin commitear en $REPO_DIR, no actualizo para no pisarlos."
	exit 1
fi

log "🔄 Nuevo commit detectado ($LOCAL -> $REMOTE), actualizando..."

if git pull origin main >>"$LOG_FILE" 2>&1 && docker compose up -d --build >>"$LOG_FILE" 2>&1; then
	log "✅ Deploy OK ($(git rev-parse HEAD))"
else
	log "❌ Deploy falló, revisá el log arriba."
fi
