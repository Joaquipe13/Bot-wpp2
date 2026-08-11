import fs from 'fs/promises';
import path from 'path';
import { getFoldersInPath, AUDIOS_DIR } from '../utils';

export async function audioCommand(body: string): Promise<{ buffer: Buffer; mimetype: string; fileName: string }> {
	const baseDir = AUDIOS_DIR;
	try {
		const args = body.trim().split(" ");
		const disponibles = getFoldersInPath(baseDir);
		if (disponibles.length === 0) {
			throw new Error("❌ No hay carpetas de audio disponibles.");
		}

		let carpeta = args[1];
		if (!carpeta) {
			carpeta = disponibles[Math.floor(Math.random() * disponibles.length)];
		} else if (!disponibles.includes(carpeta)) {
			throw new Error(`El audio "${carpeta}" no está disponible. Audios disponibles: ${disponibles.join(", ")}`);
		}

		const folder = path.join(baseDir, carpeta);
		const files = (await fs.readdir(folder)).filter(f => f.endsWith('.ogg'));
		if (files.length === 0) {
			throw new Error(`❌ No hay audios del ${carpeta} disponibles.`);
		}

		const nombreAudio = args[2];
		let selectedFile: string;
		if (nombreAudio) {
			const target = `${nombreAudio}.ogg`;
			if (!files.includes(target)) {
				throw new Error(
					`❌ El audio "${nombreAudio}" no existe en "${carpeta}". Usá /help audio ${carpeta} para ver los disponibles.`
				);
			}
			selectedFile = target;
		} else {
			selectedFile = files[Math.floor(Math.random() * files.length)];
		}

		const ruta = path.join(folder, selectedFile);
		const buffer = await fs.readFile(ruta);
		return { buffer, mimetype: 'audio/ogg; codecs=opus', fileName: selectedFile };
	} catch (error: any) {
		throw new Error(error.message || `❌ Error al obtener el audio`);
	}
}
