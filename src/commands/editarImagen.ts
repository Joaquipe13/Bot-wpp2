import fs from 'fs/promises';
import path from 'path';
import { MEMES_DIR, sanitizeFileName, fileExists } from '../utils';

export async function editarImagenCommand(nombreViejo: string, nombreNuevo: string): Promise<string> {
	const viejoLimpio = sanitizeFileName(nombreViejo || '');
	const nuevoLimpio = sanitizeFileName(nombreNuevo || '');
	if (!viejoLimpio || !nuevoLimpio) {
		throw new Error('❌ Uso: /editar imagen [nombre_viejo] [nombre_nuevo]');
	}

	const archivos = await fs.readdir(MEMES_DIR).catch(() => [] as string[]);
	const archivoViejo = archivos.find((f) => path.parse(f).name === viejoLimpio);
	if (!archivoViejo) {
		throw new Error(`❌ No existe una imagen "${viejoLimpio}".`);
	}

	const ext = path.extname(archivoViejo);
	const rutaVieja = path.join(MEMES_DIR, archivoViejo);
	const rutaNueva = path.join(MEMES_DIR, `${nuevoLimpio}${ext}`);

	if (await fileExists(rutaNueva)) {
		throw new Error(`❌ Ya existe una imagen "${nuevoLimpio}". Elegí otro nombre.`);
	}

	await fs.rename(rutaVieja, rutaNueva);
	return `✅ Imagen renombrada: "${viejoLimpio}" → "${nuevoLimpio}".`;
}
