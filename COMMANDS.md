# Comandos del bot

Todos los comandos empiezan con `/`. La mayoría tiene una abreviatura de una letra que hace exactamente lo mismo.

| Comando | Abreviatura | Permiso | Qué hace |
|---|---|---|---|
| `/help` | `/h` | Todos | Lista los comandos disponibles |
| `/ping` | — | Todos | Responde "🏓 Pong!" (para chequear que el bot está vivo) |
| `/audio` | `/a` | Todos | Manda una nota de voz |
| `/imagen` | `/i` | Todos | Manda una imagen guardada |
| `/guardar` | `/g` | Admin | Guarda un audio o imagen nuevo (respondiendo a uno) |
| `/editar` | `/e` | Admin | Renombra un audio o imagen ya guardado |
| `/crear` | `/c` | Admin | Crea una carpeta nueva de audios |
| `/topdiario` | — | Todos | Muestra el historial completo de tops diarios |
| `/top` | — | Todos | Muestra el ranking del Top Antipala |
| `/final` | — | Admin | Carga un final rendido |

Los comandos marcados **Admin** solo los puede ejecutar un número limitado de usuarios (definidos en el código del bot). Si no tenés permiso, el bot te lo avisa.

---

## `/help` (`/h`)

Lista los comandos que podés usar. Tiene dos variantes extra específicas para audios e imágenes:

- **`/help`** → lista todos los comandos disponibles según tu permiso.
- **`/help audio`** → lista las carpetas de audio que existen.
- **`/help audio [carpeta]`** → lista los nombres de los audios cargados en esa carpeta.
- **`/help imagen`** → lista los nombres de todas las imágenes guardadas.

Ejemplos:
```
/help
/help audio
/help audio choco
/help imagen
```

---

## `/ping`

Sin argumentos. Responde `🏓 Pong!`. Sirve para confirmar que el bot está corriendo y respondiendo.

---

## `/audio [carpeta] [nombre]` (`/a`)

Manda una nota de voz. Según cuántos argumentos le des, se comporta distinto:

- **`/audio`** (sin nada) → un audio completamente al azar, de cualquier carpeta.
- **`/audio [carpeta]`** → un audio al azar, pero solo de esa carpeta.
- **`/audio [carpeta] [nombre]`** → ese audio puntual.

Ejemplos:
```
/audio
/audio choco
/audio choco en_10
/a choco en_10
```

Para saber qué carpetas y audios existen, usá `/help audio` y `/help audio [carpeta]`.

---

## `/imagen [nombre]` (`/i`)

Manda una imagen guardada.

- **`/imagen`** (sin nada) → una imagen al azar.
- **`/imagen [nombre]`** → esa imagen puntual.

Ejemplos:
```
/imagen
/imagen imagen1
/i imagen1
```

Para ver qué imágenes existen, usá `/help imagen`.

---

## `/guardar` (`/g`) — Admin

Guarda un audio o una imagen nueva. **Se usa respondiendo (citando) el mensaje** que tiene el audio o la imagen que querés guardar — no funciona si lo mandás suelto, y no podés guardar algo que mandó el propio bot.

**Para un audio**, respondé una nota de voz con:
```
/guardar [carpeta] [nombre]
```
La carpeta tiene que existir de antes (creála primero con `/crear`). Se guarda como `audios/[carpeta]/[nombre].ogg`.

**Para una imagen**, respondé una imagen con:
```
/guardar [nombre]
```
El nombre es opcional — si no ponés nada, se guarda como `imagen1`, `imagen2`, etc. (numeración automática).

Ejemplos:
```
/guardar choco risa_final
/g choco risa_final
/guardar meme_del_grupo
/g
```

Si ya existe un archivo con ese nombre, el bot no lo pisa: te avisa que elijas otro nombre.

---

## `/editar` (`/e`) — Admin

Renombra un audio o una imagen que ya está guardado (no crea ni borra nada, solo cambia el nombre).

**Para un audio**:
```
/editar audio [carpeta] [nombre_viejo] [nombre_nuevo]
```

**Para una imagen**:
```
/editar imagen [nombre_viejo] [nombre_nuevo]
```

Ejemplos:
```
/editar audio choco en_10 en_10_bis
/e audio choco en_10 en_10_bis
/editar imagen imagen1 gato_gracioso
/e imagen imagen1 gato_gracioso
```

Falla si el nombre viejo no existe, o si el nombre nuevo ya está ocupado por otro archivo.

---

## `/crear audio [nombre_carpeta]` (`/c`) — Admin

Crea una carpeta nueva dentro de `audios/`, para poder empezar a guardar audios ahí con `/guardar`.

```
/crear audio [nombre_carpeta]
/c audio [nombre_carpeta]
```

Ejemplo:
```
/crear audio memes_2026
```

Falla si ya existe una carpeta con ese nombre.

---

## `/topdiario`

Sin argumentos. Muestra el historial completo de tops diarios cargados, agrupados por fecha, con la posición de cada topero.

```
/topdiario
```

---

## `/top [AAAA-C]`

Muestra el ranking del Top Antipala (puntos por posición en los tops diarios, menos los puntos de finales aprobados).

- **`/top`** (sin nada) → el período actual (o el último que terminó, si estás entre cuatrimestres).
- **`/top AAAA-C`** → un período puntual, donde `C` es `1` o `2` (primer o segundo cuatrimestre). Ejemplo: `2026-1`.

Ejemplos:
```
/top
/top 2026-1
/top 2025-2
```

---

## `/final <nombre> materia:<texto> nota:<número> fecha:dd/mm/aaaa` — Admin

Carga un final rendido para un topero que ya existe. El formato es estricto, tiene que respetarse tal cual (con `materia:`, `nota:` y `fecha:` pegados al valor, sin espacio después de los dos puntos).

```
/final [nombre] materia:[materia] nota:[nota] fecha:[dd/mm/aaaa]
```

Ejemplo:
```
/final Choco materia:Álgebra nota:8 fecha:15/08/2026
```

Después de cargarlo, el bot responde con un mensaje según si aprobó o no, y muestra el Top Antipala actualizado.

---

## Cargar un top diario (sin `/`)

No es un comando con barra — es un mensaje de texto con este formato exacto, mandado directo al grupo:

```
Top antipala del dia dd/mm/aaaa
1 Nombre
2 Nombre
3 Nombre
```

El bot lo detecta automáticamente (sin admin necesario), registra las posiciones de ese día y responde con el Top Antipala actualizado. Los nombres tienen que coincidir con toperos que ya existen en la base.

---

## Notas generales

- Las abreviaturas (`/a`, `/i`, `/e`, `/g`, `/h`, `/c`) funcionan exactamente igual que el comando completo, incluidos los permisos — `/g` requiere ser admin igual que `/guardar`.
- Los nombres de carpetas, audios e imágenes se guardan siempre en minúsculas y sin caracteres raros (solo letras, números, `_` y `-`) aunque los escribas distinto.
- Si un comando falla, el bot responde con el motivo del error (carpeta inexistente, formato inválido, sin permisos, etc.) citando tu mensaje.
