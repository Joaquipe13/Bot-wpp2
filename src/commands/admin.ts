import { Topero, Commands } from '../classes';
import { normalizeJid } from '../utils';

export async function adminCommand(targetJid: string): Promise<string> {
	const target = normalizeJid(targetJid);
	if (Commands.isOwner(target)) {
		throw new Error('❌ Ese contacto ya es owner.');
	}

	const topero = await Topero.findOrCreateByJid(target);
	if (topero.banned) {
		throw new Error(`❌ ${topero.name} está baneado. Desbaneálo primero con /unban.`);
	}
	if (topero.role === 'admin') {
		throw new Error(`❌ ${topero.name} ya es admin.`);
	}

	topero.setRole('admin');
	return `✅ ${topero.name} ahora es admin.`;
}

export async function adminRemoveCommand(targetJid: string): Promise<string> {
	const target = normalizeJid(targetJid);
	const topero = await Topero.findByJid(target);
	if (!topero || topero.role !== 'admin') {
		throw new Error('❌ Ese contacto no es admin.');
	}

	topero.setRole('common');
	return `✅ ${topero.name} ya no es admin.`;
}
