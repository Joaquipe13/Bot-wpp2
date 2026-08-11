import fs from 'fs/promises';
import path from 'path';
import { MEMES_DIR } from '../utils';

const MIMETYPES: Record<string, string> = {
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
};

export async function imagenCommand(): Promise<{ buffer: Buffer; mimetype: string }> {
	const files = await fs
		.readdir(MEMES_DIR)
		.then((entries) => entries.filter((f) => MIMETYPES[path.extname(f).toLowerCase()]))
		.catch(() => [] as string[]);

	if (files.length === 0) {
		throw new Error('❌ Todavía no hay imágenes guardadas. Respondé una imagen con /guardar para agregar una.');
	}

	const selected = files[Math.floor(Math.random() * files.length)];
	const buffer = await fs.readFile(path.join(MEMES_DIR, selected));
	const mimetype = MIMETYPES[path.extname(selected).toLowerCase()];

	return { buffer, mimetype };
}
