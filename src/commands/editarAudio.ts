import fs from 'fs/promises';
import path from 'path';
import { getFoldersInPath, AUDIOS_DIR, sanitizeFileName, fileExists } from '../utils';

export async function editarAudioCommand(
	carpeta: string,
	nombreViejo: string,
	nombreNuevo: string
): Promise<string> {
	const disponibles = getFoldersInPath(AUDIOS_DIR);
	if (!carpeta || !disponibles.includes(carpeta)) {
		throw new Error(
			`❌ La carpeta "${carpeta || ''}" no existe. Carpetas disponibles: ${disponibles.join(', ')}`
		);
	}

	const viejoLimpio = sanitizeFileName(nombreViejo || '');
	const nuevoLimpio = sanitizeFileName(nombreNuevo || '');
	if (!viejoLimpio || !nuevoLimpio) {
		throw new Error('❌ Uso: /editar audio [carpeta] [nombre_viejo] [nombre_nuevo]');
	}

	const rutaVieja = path.join(AUDIOS_DIR, carpeta, `${viejoLimpio}.ogg`);
	const rutaNueva = path.join(AUDIOS_DIR, carpeta, `${nuevoLimpio}.ogg`);

	if (!(await fileExists(rutaVieja))) {
		throw new Error(
			`❌ No existe el audio "${viejoLimpio}" en "${carpeta}". Usá /help audio ${carpeta} para ver los disponibles.`
		);
	}

	if (await fileExists(rutaNueva)) {
		throw new Error(`❌ Ya existe un audio "${nuevoLimpio}" en "${carpeta}". Elegí otro nombre.`);
	}

	await fs.rename(rutaVieja, rutaNueva);
	return `✅ Audio renombrado: "${viejoLimpio}" → "${nuevoLimpio}" en "${carpeta}".`;
}
