import { Topero } from '../classes';
import { normalizeJid } from '../utils';

export async function setToperoCommand(nombreTopero: string, targetJid: string): Promise<string> {
	const topero = await Topero.findByName(nombreTopero);
	if (!topero) {
		throw new Error(`❌ No existe el topero "${nombreTopero}".`);
	}

	const target = normalizeJid(targetJid);
	const yaVinculado = await Topero.findByJid(target);
	if (yaVinculado && yaVinculado.id !== topero.id) {
		throw new Error(`❌ Ese contacto ya está vinculado a "${yaVinculado.name}".`);
	}

	topero.setJid(target);
	return `✅ ${topero.name} vinculado correctamente.`;
}
