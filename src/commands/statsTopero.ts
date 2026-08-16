import { Topero, ComandoUso } from '../classes';

// Devuelve null cuando "nombreTopero" no coincide con ningún topero, para que
// quien llame lo trate como "el comando no existe" (los comandos reales
// siempre tienen prioridad sobre esto; ver events.ts).
export async function statsToperoCommand(nombreTopero: string, groupJid: string): Promise<string | null> {
	const topero = await Topero.findByName(nombreTopero);
	if (!topero) return null;

	if (!topero.jid) {
		return `📊 ${topero.name} todavía no está vinculado a ningún número (usá /set ${topero.name} @contacto), así que no hay estadísticas para mostrar.`;
	}

	const { total, masUsado } = ComandoUso.estadisticas(topero.jid, groupJid);
	if (total === 0 || !masUsado) {
		return `📊 ${topero.name} todavía no usó ningún comando en este grupo.`;
	}

	return (
		`📊 Estadísticas de ${topero.name} en este grupo:\n` +
		`Comandos usados: ${total}\n` +
		`Comando más usado: /${masUsado.command} (${masUsado.count} ${masUsado.count === 1 ? "vez" : "veces"})`
	);
}
