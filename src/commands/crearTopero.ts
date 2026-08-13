import { Topero } from '../classes';
import { normalizeJid } from '../utils';

export async function crearToperoCommand(nombre: string | undefined, mentionedJid?: string): Promise<string> {
	const nombreLimpio = (nombre || '').trim();
	if (!nombreLimpio) {
		throw new Error('❌ Uso: /crear topero [nombre] o /crear topero [nombre] @contacto');
	}

	const existente = await Topero.findByName(nombreLimpio);
	if (existente) {
		throw new Error(`❌ Ya existe un topero "${existente.name}".`);
	}

	let jid: string | null = null;
	if (mentionedJid) {
		jid = normalizeJid(mentionedJid);
		const yaVinculado = await Topero.findByJid(jid);
		if (yaVinculado) {
			throw new Error(`❌ Ese contacto ya está vinculado a "${yaVinculado.name}".`);
		}
	}

	const topero = await Topero.create(nombreLimpio, jid);
	return jid
		? `✅ Topero "${topero.name}" creado y vinculado al contacto.`
		: `✅ Topero "${topero.name}" creado.`;
}
