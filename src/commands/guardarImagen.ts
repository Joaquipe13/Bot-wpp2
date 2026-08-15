import fs from 'fs/promises';
import path from 'path';
import { proto, downloadContentFromMessage } from '@whiskeysockets/baileys';
import { MEMES_DIR, sanitizeFileName, fileExists } from '../utils';

function extensionFromMimetype(mimetype?: string | null): string {
	if (mimetype?.includes('png')) return 'png';
	if (mimetype?.includes('webp')) return 'webp';
	return 'jpg';
}

async function nextAutoName(): Promise<string> {
	const files = await fs.readdir(MEMES_DIR);
	let max = 0;
	for (const file of files) {
		const match = file.match(/^imagen(\d+)\./);
		if (match) max = Math.max(max, parseInt(match[1], 10));
	}
	return `imagen${max + 1}`;
}

export async function guardarImagenCommand(
	nombreImagen: string | undefined,
	imageMessage: proto.Message.IImageMessage
): Promise<string> {
	await fs.mkdir(MEMES_DIR, { recursive: true });

	const nombreLimpio = nombreImagen ? sanitizeFileName(nombreImagen) : '';
	const nombre = nombreLimpio || (await nextAutoName());
	const fileName = `${nombre}.${extensionFromMimetype(imageMessage.mimetype)}`;
	const filePath = path.join(MEMES_DIR, fileName);

	if (await fileExists(filePath)) {
		throw new Error(`❌ Ya existe una imagen "${fileName}". Elegí otro nombre.`);
	}

	const stream = await downloadContentFromMessage(imageMessage, 'image');
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(chunk as Buffer);
	}
	const buffer = Buffer.concat(chunks);

	await fs.writeFile(filePath, buffer);

	return `✅ Imagen guardada como ${fileName}.`;
}
