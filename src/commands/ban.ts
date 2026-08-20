import { Topero, Commands } from '../classes';
import { normalizeJid } from '../utils';

export async function banCommand(actorJid: string, targetInput: string): Promise<string> {
    const cleanActor = normalizeJid(actorJid);
    const target = normalizeJid(targetInput);

    // 1. Buscar primero por nombre, luego por JID, o crearlo si es un JID nuevo
    let topero = await Topero.findByName(target);
    if (!topero) {
        topero = await Topero.findByJid(target);
    }
    if (!topero) {
        // Si no existe por nombre ni por JID, asumimos que targetInput era un JID nuevo
        topero = await Topero.findOrCreateByJid(target);
    }

    const cleanTargetJid = normalizeJid(topero.jid);

    // 2. Validaciones contra el usuario objetivo resuelto
    if (cleanTargetJid === cleanActor) {
        throw new Error('❌ No podés banearte a vos mismo.');
    }
    if (Commands.isOwner(cleanTargetJid)) {
        throw new Error('❌ No se puede banear al papu.');
    }
    if (topero.banned) {
        throw new Error(`❌ ${topero.name} ya está baneado.`);
    }
    if (topero.role === 'admin' && !Commands.isOwner(cleanActor)) {
        throw new Error('❌ Solo el papu puede banear a un admin.');
    }

    // 3. Aplicar sanción y persistir cambios
    const eraAdmin = topero.role === 'admin';
    await topero.setBanned(true);
    if (eraAdmin) {
        await topero.setRole('common');
    }

    return `🚫 ${topero.name} fue baneado.${eraAdmin ? ' Perdió su rol de admin.' : ''}`;
}

export async function unbanCommand(targetJid: string): Promise<string> {
	const target = normalizeJid(targetJid);
	let topero = await Topero.findByName(target);
	if (!topero) {
		topero = await Topero.findByJid(target);
	}
	if (!topero) {
        throw new Error('❌ Contacto no encontrado.');
    }
	if (!topero.banned) {
		throw new Error('❌ Ese contacto no está baneado.');
	}

	topero.setBanned(false);
	return `✅ ${topero.name} fue desbaneado.`;
}
