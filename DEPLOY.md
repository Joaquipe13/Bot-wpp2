# Deploy — Bot WPP

Pensado para correr directamente en el host de destino (VPS en la nube, otra PC, etc.), que buildea su propia imagen.

## Requisitos en el host

- Docker Engine + Docker Compose plugin instalados

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# cerrar sesión y volver a entrar para que tome efecto el grupo
docker --version
docker compose version
```

## 1. Clonar el repo y configurar

```bash
git clone <url-del-repo> bot-wpp
cd bot-wpp
cp .env.example .env
# editar .env si hace falta (por defecto ya apunta a /app/data/data.db)
```

## 2. Buildear y levantar

```bash
docker compose up -d --build
```

Esto construye la imagen (compila TypeScript y el addon nativo `better-sqlite3`) y arranca el contenedor. `./data` persiste la base SQLite (incluye la sesión de WhatsApp y los memes guardados con `/guardar`) y `./audios` persiste los audios, tanto los del repo como los agregados con `/guardar` en el grupo — ambos sobreviven reinicios/actualizaciones/migraciones de host.

## 3. Primera autenticación (escanear QR)

```bash
docker compose logs -f
```

Buscá el bloque con el QR, abrí WhatsApp en el celular → Dispositivos vinculados → Vincular dispositivo → escaneá.

## 4. Actualizar el bot

```bash
git pull
docker compose up -d --build
```

La sesión y la base de datos no se pierden porque viven en volúmenes fuera de la imagen.

## 5. Auto-deploy al pushear a main (opcional)

Para no tener que entrar por SSH cada vez que cambia el código: `scripts/auto-deploy.sh` revisa si `origin/main` tiene commits nuevos y, si los hay, hace `git pull` + rebuild solo. Pensado para correr por cron cada pocos minutos — no hace nada (ni deja rastro en el log) si no hay cambios.

```bash
chmod +x scripts/auto-deploy.sh
crontab -e
```

Agregá esta línea (ajustá la ruta a donde clonaste el repo):

```
*/5 * * * * /home/tu_usuario/bot-wpp/scripts/auto-deploy.sh
```

Cada 5 minutos revisa y actualiza si hace falta. El resultado de cada corrida con cambios queda en `logs/deploy.log` dentro del repo (`tail -f logs/deploy.log` para ver en vivo). Si el repo tiene cambios locales sin commitear (por ejemplo si tocaste algo a mano en el VPS), el script no actualiza y avisa en el log en vez de pisarlos.

Nota: el cron corre con un `PATH` mínimo y puede no encontrar `git`/`docker`. Si el log muestra errores de "command not found", probá correr el script a mano primero (`./scripts/auto-deploy.sh`) para confirmar que anda, y si hace falta agregá `PATH=/usr/bin:/usr/local/bin` como primera línea del crontab.

## 6. Auditoría de recursos (para dimensionar el VPS)

`scripts/resource-monitor.sh` toma una foto de `docker stats` (CPU, memoria, red, disco) y la agrega a un CSV. Corriéndolo por cron cada 1-5 minutos durante unos días de uso real (con gente mandando audios/imágenes, no solo en reposo), queda un historial que sirve para decidir si el plan de VPS que elegiste alcanza o se queda corto.

```bash
chmod +x scripts/resource-monitor.sh
crontab -e
```

Agregá (junto a la línea de auto-deploy si ya la tenés):

```
*/5 * * * * /home/tu_usuario/bot-wpp/scripts/resource-monitor.sh
```

Los datos quedan en `logs/resource-usage.csv` (columnas: timestamp, cpu_perc, mem_usage, mem_perc, net_io, block_io, pids). Para ver las 5 muestras con mayor % de memoria usada:

```bash
sort -t',' -k4 -n -r logs/resource-usage.csv | head -5
```

O simplemente abrí el CSV en una planilla (Excel, Google Sheets) para graficarlo. Si ves que el `mem_perc` anda cerca del 100% seguido, es momento de subir el `mem_limit` en `docker-compose.yml` o de pasar a un plan de VPS con más RAM.

## Comandos útiles

```bash
docker compose logs -f          # logs en tiempo real
docker compose restart          # reiniciar
docker compose stop             # detener
docker stats bot-wpp            # uso de recursos
docker exec -it bot-wpp sh      # entrar al contenedor
docker compose ps               # estado
```

## Backup de datos

```bash
cp data/data.db data/data.db.bak   # incluye también la sesión de WhatsApp
```

## Sesión de WhatsApp

Las credenciales de Baileys se guardan en la tabla `auth_state` de la misma base SQLite (no en archivos sueltos). Al arrancar, el bot intenta reconectar con la sesión guardada en `./data/data.db`; si no hay sesión válida (primera vez, o si cerraste la sesión desde el celular), vuelve a mostrar el QR en `docker compose logs -f` automáticamente — no hace falta borrar nada a mano.

## Notas

- Límite de memoria del contenedor: 512 MB (configurable en `docker-compose.yml`).
- Si el host no tiene recursos suficientes para buildear (CPU/RAM muy limitados), se puede buildear en otra máquina con `docker build --platform linux/amd64 -t bot-wpp .`, exportar con `docker save bot-wpp | gzip > bot-wpp.tar.gz`, transferir y cargar con `docker load < bot-wpp.tar.gz` en el destino — ahí sí usar `docker compose up -d` sin `--build`.
