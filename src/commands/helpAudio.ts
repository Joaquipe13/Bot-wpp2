import fs from 'fs/promises';
import path from 'path';
import { getFoldersInPath, AUDIOS_DIR } from '../utils';

export async function helpAudioCommand(carpeta?: string): Promise<string> {
	const disponibles = getFoldersInPath(AUDIOS_DIR);

	if (!carpeta) {
		return `🎵 Carpetas de audio disponibles: ${disponibles.join(', ')}\n\nUsá /help audio [carpeta] para ver los audios de una carpeta.`;
	}

	if (!disponibles.includes(carpeta)) {
		throw new Error(`❌ La carpeta "${carpeta}" no existe. Carpetas disponibles: ${disponibles.join(', ')}`);
	}

	const files = (await fs.readdir(path.join(AUDIOS_DIR, carpeta)))
		.filter(f => f.endsWith('.ogg'))
		.map(f => f.replace(/\.ogg$/, ''));

	if (files.length === 0) {
		return `📉 La carpeta "${carpeta}" no tiene audios cargados todavía.`;
	}

	return `🎵 Audios en "${carpeta}":\n${files.join('\n')}`;
}
