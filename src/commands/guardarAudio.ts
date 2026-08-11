import fs from 'fs/promises';
import path from 'path';
import { proto, downloadContentFromMessage } from '@whiskeysockets/baileys';
import { getFoldersInPath, AUDIOS_DIR } from '../utils';

function sanitizeFileName(nombre: string): string {
	return nombre.toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

export async function guardarAudioCommand(
	nombreCarpeta: string,
	nombreAudio: string,
	audioMessage: proto.Message.IAudioMessage
): Promise<string> {
	const disponibles = getFoldersInPath(AUDIOS_DIR);
	if (!nombreCarpeta || !disponibles.includes(nombreCarpeta)) {
		throw new Error(
			`❌ La carpeta "${nombreCarpeta || ''}" no existe. Carpetas disponibles: ${disponibles.join(', ')}`
		);
	}

	const nombreLimpio = sanitizeFileName(nombreAudio || '');
	if (!nombreLimpio) {
		throw new Error('❌ Falta el nombre del audio. Uso: /guardar [carpeta] [nombre]');
	}

	if (!audioMessage.mimetype?.includes('ogg')) {
		throw new Error('❌ Solo se pueden guardar notas de voz (formato ogg).');
	}

	const fileName = `${nombreLimpio}.ogg`;
	const filePath = path.join(AUDIOS_DIR, nombreCarpeta, fileName);

	const yaExiste = await fs
		.access(filePath)
		.then(() => true)
		.catch(() => false);
	if (yaExiste) {
		throw new Error(`❌ Ya existe un audio "${fileName}" en "${nombreCarpeta}". Elegí otro nombre.`);
	}

	const stream = await downloadContentFromMessage(audioMessage, 'audio');
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(chunk as Buffer);
	}
	const buffer = Buffer.concat(chunks);

	await fs.writeFile(filePath, buffer);

	return `✅ Audio guardado en "${nombreCarpeta}" como ${fileName}.`;
}
