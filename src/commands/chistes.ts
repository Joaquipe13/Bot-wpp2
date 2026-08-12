import fs from 'fs/promises';
import path from 'path';
import { DB_PATH } from '../db/database';

const CHISTES_PATH = path.join(path.dirname(DB_PATH), 'chistes.json');

async function leerChistes(): Promise<string[]> {
	try {
		const contenido = await fs.readFile(CHISTES_PATH, 'utf-8');
		return JSON.parse(contenido);
	} catch (err: any) {
		if (err.code === 'ENOENT') {
			await fs.writeFile(CHISTES_PATH, '[]');
			return [];
		}
		throw new Error('❌ Error al leer el archivo de chistes.');
	}
}

export async function chisteCommand(): Promise<string> {
	const chistes = await leerChistes();
	if (chistes.length === 0) {
		return 'No hay chistes guardados todavía. Usá /guardar chiste <texto> para agregar uno.';
	}
	return chistes[Math.floor(Math.random() * chistes.length)];
}

export async function guardarChisteCommand(texto: string): Promise<string> {
	const textoLimpio = (texto || '').trim();
	if (!textoLimpio) {
		throw new Error('❌ Escribí el chiste. Uso: /guardar chiste <texto>');
	}

	const chistes = await leerChistes();
	chistes.push(textoLimpio);

	try {
		await fs.writeFile(CHISTES_PATH, JSON.stringify(chistes, null, 2));
	} catch (err: any) {
		throw new Error('❌ Error al guardar el chiste.');
	}

	return '✅ Chiste guardado.';
}
