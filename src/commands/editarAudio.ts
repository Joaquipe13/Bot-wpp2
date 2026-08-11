import fs from 'fs/promises';
import path from 'path';
import { getFoldersInPath, AUDIOS_DIR } from '../utils';

function sanitizeFileName(nombre: string): string {
	return nombre.toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

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

	const existeViejo = await fs
		.access(rutaVieja)
		.then(() => true)
		.catch(() => false);
	if (!existeViejo) {
		throw new Error(
			`❌ No existe el audio "${viejoLimpio}" en "${carpeta}". Usá /help audio ${carpeta} para ver los disponibles.`
		);
	}

	const existeNuevo = await fs
		.access(rutaNueva)
		.then(() => true)
		.catch(() => false);
	if (existeNuevo) {
		throw new Error(`❌ Ya existe un audio "${nuevoLimpio}" en "${carpeta}". Elegí otro nombre.`);
	}

	await fs.rename(rutaVieja, rutaNueva);
	return `✅ Audio renombrado: "${viejoLimpio}" → "${nuevoLimpio}" en "${carpeta}".`;
}
