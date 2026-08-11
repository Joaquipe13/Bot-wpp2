import fs from 'fs/promises';
import path from 'path';
import { MEMES_DIR } from '../utils';

export async function helpImagenCommand(): Promise<string> {
	const files = await fs
		.readdir(MEMES_DIR)
		.then((entries) => entries.map((f) => path.parse(f).name))
		.catch(() => [] as string[]);

	if (files.length === 0) {
		return '📉 Todavía no hay imágenes guardadas. Respondé una imagen con /guardar para agregar una.';
	}

	return `🖼️ Imágenes disponibles:\n${files.join('\n')}`;
}
