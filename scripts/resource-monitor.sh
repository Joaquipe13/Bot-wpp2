#!/bin/sh
# Registro de auditoría de recursos: muestrea docker stats del contenedor
# y lo va agregando a un CSV. Pensado para correr por cron cada 1-5 min
# durante unos días de uso real, para poder estimar el VPS necesario.
set -eu

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$REPO_DIR/logs"
CSV_FILE="$LOG_DIR/resource-usage.csv"
CONTAINER="bot-wpp"

mkdir -p "$LOG_DIR"

if [ ! -f "$CSV_FILE" ]; then
	echo "timestamp,cpu_perc,mem_usage,mem_perc,net_io,block_io,pids" >"$CSV_FILE"
fi

if ! docker inspect "$CONTAINER" >/dev/null 2>&1; then
	exit 0
fi

STATS=$(docker stats "$CONTAINER" --no-stream --format "{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}},{{.BlockIO}},{{.PIDs}}")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "$TIMESTAMP,$STATS" >>"$CSV_FILE"
