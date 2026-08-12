import { Topero, Commands } from '../classes';
import { normalizeJid } from '../utils';

export async function banCommand(actorJid: string, targetJid: string): Promise<string> {
	const target = normalizeJid(targetJid);
	if (target === normalizeJid(actorJid)) {
		throw new Error('❌ No podés banearte a vos mismo.');
	}
	if (Commands.isOwner(target)) {
		throw new Error('❌ No se puede banear al owner.');
	}

	const topero = await Topero.findOrCreateByJid(target);
	if (topero.banned) {
		throw new Error(`❌ ${topero.name} ya está baneado.`);
	}
	if (topero.role === 'admin' && !Commands.isOwner(normalizeJid(actorJid))) {
		throw new Error('❌ Solo el owner puede banear a un admin.');
	}

	const eraAdmin = topero.role === 'admin';
	topero.setBanned(true);
	if (eraAdmin) topero.setRole('common');

	return `🚫 ${topero.name} fue baneado.${eraAdmin ? ' Perdió su rol de admin.' : ''}`;
}

export async function unbanCommand(targetJid: string): Promise<string> {
	const target = normalizeJid(targetJid);
	const topero = await Topero.findByJid(target);
	if (!topero || !topero.banned) {
		throw new Error('❌ Ese contacto no está baneado.');
	}

	topero.setBanned(false);
	return `✅ ${topero.name} fue desbaneado.`;
}
