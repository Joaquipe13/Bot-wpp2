import fs from 'fs/promises';
import path from 'path';
import { MEMES_DIR } from '../utils';

function sanitizeFileName(nombre: string): string {
	return nombre.toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

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

	const existeNuevo = await fs
		.access(rutaNueva)
		.then(() => true)
		.catch(() => false);
	if (existeNuevo) {
		throw new Error(`❌ Ya existe una imagen "${nuevoLimpio}". Elegí otro nombre.`);
	}

	await fs.rename(rutaVieja, rutaNueva);
	return `✅ Imagen renombrada: "${viejoLimpio}" → "${nuevoLimpio}".`;
}
