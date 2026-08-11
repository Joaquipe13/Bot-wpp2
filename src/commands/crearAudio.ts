import fs from 'fs/promises';
import path from 'path';
import { getFoldersInPath, AUDIOS_DIR } from '../utils';

function sanitizeFolderName(nombre: string): string {
	return nombre.toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

export async function crearAudioCommand(nombreCarpeta: string): Promise<string> {
	const nombreLimpio = sanitizeFolderName(nombreCarpeta || '');
	if (!nombreLimpio) {
		throw new Error('❌ Uso: /crear audio [nombre_carpeta]');
	}

	const disponibles = getFoldersInPath(AUDIOS_DIR);
	if (disponibles.includes(nombreLimpio)) {
		throw new Error(`❌ La carpeta "${nombreLimpio}" ya existe.`);
	}

	await fs.mkdir(path.join(AUDIOS_DIR, nombreLimpio));
	return `✅ Carpeta "${nombreLimpio}" creada. Ya podés guardar audios ahí con /guardar ${nombreLimpio} [nombre].`;
}
