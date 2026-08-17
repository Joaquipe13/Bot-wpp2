# Comandos del bot

Todos los comandos empiezan con `/`. La mayoría tiene una abreviatura de una letra que hace exactamente lo mismo.

Para saber cómo se usa cualquier comando sin salir del chat, mandá **`/help [comando]`** (o `/h [comando]`) — te devuelve la sintaxis exacta. `/help audio` y `/help imagen` son especiales: en vez de la sintaxis, listan las carpetas/nombres realmente guardados.

| Comando | Abreviatura | Permiso | Qué hace |
|---|---|---|---|
| `/help [comando]` | `/h` | Todos | Lista los comandos disponibles, o cómo usar uno puntual |
| `/ping` | — | Todos | Responde "🏓 Pong!" (para chequear que el bot está vivo) |
| `/repo` | — | Todos | Muestra el link al repositorio y cómo contribuir |
| `/sugerir` | — | Todos | Manda una sugerencia para el bot, se guarda en la base |
| `/chiste` | — | Todos | Manda un chiste al azar |
| `/audio` | `/a` | Todos | Manda una nota de voz |
| `/imagen` | `/i` | Todos | Manda una imagen guardada |
| `/topdiario` | — | Todos | Muestra el historial completo de tops diarios |
| `/top` | — | Todos | Muestra el ranking del Top Antipala |
| `/sugerencias` | — | Admin | Lista todas las sugerencias mandadas |
| `/guardar` | `/g` | Admin | Guarda un audio, imagen o chiste nuevo |
| `/editar` | `/e` | Admin | Renombra un audio o imagen ya guardado |
| `/crear` | `/c` | Admin | Crea una carpeta de audios, o un topero nuevo |
| `/final` | — | Admin | Carga un final rendido |
| `/ban` | — | Admin | Banea a un contacto (no puede usar el bot) |
| `/unban` | — | Admin | Desbanea a un contacto |
| `/set` | — | Admin | Vincula un número a un topero ya existente |
| `/admin` | — | Owner | Da o quita el rol de admin a un contacto |
| `/[nombre_topero]` | — | Todos | Muestra las estadísticas de uso de ese topero en el grupo |

---

## Roles y permisos

El bot tiene tres niveles, de mayor a menor:

- **Owner** — fijo en el código del bot (no se puede otorgar ni quitar por comando). Es el único que puede usar `/admin`. Puede banear incluso a admins.
- **Admin** — se lo otorga un owner con `/admin @contacto`. Puede hacer todo lo que hace un admin hoy (`/guardar`, `/editar`, `/crear`, `/final`, `/sugerencias`) y además banear/desbanear a usuarios **no admin**. Si un admin es baneado, pierde el rol de admin automáticamente (aunque después lo desbaneen).
- **Común** — cualquiera que le escriba al bot. Puede usar los comandos marcados como "Todos".

Un usuario **baneado** no puede ejecutar ningún comando (ni siquiera `/help` o `/chiste`) hasta que un admin u owner lo desbanee con `/unban`.

Si no tenés permiso para un comando, el bot te lo avisa.

---

## Mencionar a un contacto (`@`)

`/ban`, `/unban`, `/admin` y `/set` necesitan que **menciones** al contacto (escribiendo `@` y eligiéndolo de la lista que sugiere WhatsApp). Si escribís el número a mano sin seleccionarlo de esa lista, WhatsApp no le manda al bot la información necesaria para identificarlo, y el comando va a fallar pidiéndote que menciones de verdad.

---

## `/help` (`/h`)

- **`/help`** → lista todos los comandos disponibles según tu permiso.
- **`/help [comando]`** → muestra la sintaxis exacta de ese comando (funciona con cualquier comando registrado, y con su abreviatura: `/h g` es lo mismo que `/help guardar`).
- **`/help audio`** → lista las carpetas de audio que existen.
- **`/help audio [carpeta]`** → lista los nombres de los audios cargados en esa carpeta.
- **`/help imagen`** → lista los nombres de todas las imágenes guardadas.

Ejemplos:
```
/help
/help guardar
/help audio
/help audio choco
/help imagen
```

---

## `/ping`

Sin argumentos. Responde `🏓 Pong!`. Sirve para confirmar que el bot está corriendo y respondiendo.

---

## `/repo`

Sin argumentos. Manda el link al repositorio del bot en GitHub, e invita a abrir un PR o mandar una idea con `/sugerir`.

---

## `/sugerir [sugerencia]`

Cualquiera puede mandar una idea o sugerencia para el bot. Queda guardada en la base con quién la mandó y cuándo; un admin la puede ver con `/sugerencias`.

```
/sugerir [tu sugerencia]
```

Ejemplo:
```
/sugerir agregar un comando /clima que tire el pronóstico
```

---

## `/sugerencias` — Admin

Sin argumentos. Lista todas las sugerencias mandadas hasta ahora, más nuevas primero.

```
/sugerencias
```

---

## `/chiste`

Sin argumentos. Manda un chiste al azar de los guardados. Si todavía no hay ninguno, te avisa cómo cargar el primero (`/guardar chiste`).

```
/chiste
```

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

Guarda un audio, una imagen, o un chiste.

**Para un audio o una imagen, se usa respondiendo (citando) el mensaje** que las tiene — no funciona si lo mandás suelto, y no podés guardar algo que mandó el propio bot.

**Para un audio**, respondé una nota de voz con:
```
/guardar [carpeta] [nombre]
```
La carpeta tiene que existir de antes (creála primero con `/crear audio [carpeta]`). Se guarda como `audios/[carpeta]/[nombre].ogg`.

**Para una imagen**, respondé una imagen con:
```
/guardar [nombre]
```
El nombre es opcional — si no ponés nada, se guarda como `imagen1`, `imagen2`, etc. (numeración automática).

**Para un chiste**, no hace falta responder nada:
```
/guardar chiste [texto]
```

Ejemplos:
```
/guardar choco risa_final
/g choco risa_final
/guardar meme_del_grupo
/g
/guardar chiste ¿Por qué el libro de matemáticas está triste? Porque tiene muchos problemas.
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

## `/crear` (`/c`) — Admin

Crea una carpeta de audios nueva, o un topero nuevo.

**Carpeta de audios**, para poder empezar a guardar audios ahí con `/guardar`:
```
/crear audio [nombre_carpeta]
```

**Topero nuevo**, opcionalmente vinculado a un número desde el inicio:
```
/crear topero [nombre]
/crear topero [nombre] @contacto
```

Ejemplos:
```
/crear audio memes_2026
/c audio memes_2026
/crear topero Choco
/crear topero Choco @contacto
```

Falla si ya existe una carpeta o un topero con ese nombre, o si el contacto mencionado ya está vinculado a otro topero.

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

## `/ban @contacto` — Admin

Banea a un contacto: no va a poder usar ningún comando del bot (ni `/help`) hasta que lo desbaneen. Tenés que mencionarlo con `@` (ver [Mencionar a un contacto](#mencionar-a-un-contacto-)).

```
/ban @contacto
```

Reglas:
- Nadie puede banear al owner.
- Solo el owner puede banear a un admin.
- Si el baneado era admin, pierde el rol automáticamente.
- No podés banearte a vos mismo.

---

## `/unban @contacto` — Admin

Desbanea a un contacto. Si era admin antes de ser baneado, **no** recupera el rol solo — hay que dárselo de nuevo con `/admin`.

```
/unban @contacto
```

---

## `/admin @contacto` — Owner

Le da el rol de admin a un contacto, o se lo quita.

```
/admin @contacto
/admin remove @contacto
```

Solo lo puede usar el owner (fijo en el código, no se otorga por comando). Falla si el contacto está baneado (hay que desbanearlo primero) o ya es admin.

---

## `/set [nombre_topero] @contacto` — Admin

Vincula un número de teléfono a un topero que ya existe, para que el bot pueda identificarlo (por ejemplo, para banearlo/hacerlo admin por su nombre de topero más adelante).

```
/set [nombre_topero] @contacto
```

Ejemplo:
```
/set Choco @contacto
```

Falla si el topero no existe, o si ese contacto ya está vinculado a otro topero.

---

## `/[nombre_topero]`

No es un comando fijo — es el nombre de cualquier topero que ya exista, usado como si fuera un comando. Devuelve, para **este grupo puntual**, cuántos comandos usó esa persona en total y cuál es el que más usó.

```
/[nombre_topero]
```

Ejemplo:
```
/Choco
```
```
📊 Estadísticas de Choco en este grupo:
Comandos usados: 14
Comando más usado: /audio (9 veces)
```

Para que funcione, el topero tiene que estar vinculado a un número con `/set` — si no, avisa que no hay estadísticas para mostrar. Y si el nombre coincide con un comando real (por ejemplo, si hubiera un topero llamado "Top"), siempre gana el comando: esta consulta solo se activa cuando lo que escribiste no es ningún comando existente.

El conteo incluye cualquier `/comando` real que se haya ejecutado (incluido `/help`), contando alias y variantes con argumentos como el mismo comando — `/a`, `/audio` y `/audio choco en_10` suman los tres al contador de `/audio`. No cuenta el registro de "Top antipala del dia" ni esta misma consulta.

---

## Cargar un top diario (sin `/`)

No es un comando con barra — es un mensaje de texto mandado directo al grupo, que empieza con "Top antipala del día" (la tilde es opcional, "dia" también funciona) y sigue con la lista de posiciones:

```
Top antipala del día
1 Nombre
2 Nombre
3 Nombre
```

El día al que corresponde ese top se indica (o no) en la primera línea, de cuatro formas posibles:

- **`Top antipala del día`** (sin nada más) → el top es de hoy.
- **`Top antipala del día ayer`** → el top es de ayer.
- **`Top antipala del día [día de la semana]`** (ej: `viernes`) → la ocurrencia más reciente de ese día (hoy incluido si coincide), nunca una fecha futura.
- **`Top antipala del día [dd/mm]`** o **`Top antipala del día [dd/mm/aaaa]`** → una fecha puntual. Si no ponés el año, se toma el actual.

Ejemplos:
```
Top antipala del día
1 Munné
2 Lucas
3 Seba

Top antipala del día ayer
1 Munné
2 Lucas
3 Seba

Top antipala del día viernes
1 Tomy
2 Lucas
3 Maxi

Top antipala del día 17/08
1 Tomy
2 Lucas
3 Maxi
```

No hace falta que sea un top 3 — puede tener tantas posiciones como se necesite. El bot lo detecta automáticamente, registra las posiciones de ese día y responde con el Top Antipala actualizado. Los nombres tienen que coincidir con toperos que ya existen en la base (no distingue mayúsculas de minúsculas). Solo lo puede registrar un admin u owner.

---

## Notas generales

- Las abreviaturas (`/a`, `/i`, `/e`, `/g`, `/h`, `/c`) funcionan exactamente igual que el comando completo, incluidos los permisos — `/g` requiere ser admin igual que `/guardar`.
- Los nombres de carpetas, audios e imágenes se guardan siempre en minúsculas y sin caracteres raros (solo letras, números, `_` y `-`) aunque los escribas distinto.
- Los nombres de topero no distinguen mayúsculas de minúsculas al buscarlos (`choco`, `Choco` y `CHOCO` son el mismo topero), y el bot siempre los muestra con la inicial de cada palabra en mayúscula (`Juan Caballo`), sin importar cómo estén guardados internamente. Los toperos ya cargados no se tocan; esto solo aplica a los nuevos.
- Si un comando falla, el bot responde con el motivo del error (carpeta inexistente, formato inválido, sin permisos, etc.) citando tu mensaje.
