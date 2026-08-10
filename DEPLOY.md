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

Esto construye la imagen (compila TypeScript y el addon nativo `better-sqlite3`) y arranca el contenedor. `./data` y `./session` se crean en el host y persisten la base SQLite y la sesión de WhatsApp entre reinicios/actualizaciones.

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
cp data/data.db data/data.db.bak
tar -czf backup-session.tar.gz session/
```

## Notas

- Límite de memoria del contenedor: 512 MB (configurable en `docker-compose.yml`).
- Si el host no tiene recursos suficientes para buildear (CPU/RAM muy limitados), se puede buildear en otra máquina con `docker build --platform linux/amd64 -t bot-wpp .`, exportar con `docker save bot-wpp | gzip > bot-wpp.tar.gz`, transferir y cargar con `docker load < bot-wpp.tar.gz` en el destino — ahí sí usar `docker compose up -d` sin `--build`.
