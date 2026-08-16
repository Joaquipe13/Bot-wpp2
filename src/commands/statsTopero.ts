import { Topero, ComandoUso } from '../classes';

// Devuelve null cuando "nombreTopero" no coincide con ningún topero, para que
// quien llame lo trate como "el comando no existe" (los comandos reales
// siempre tienen prioridad sobre esto; ver events.ts).
//
// El owner también resuelve por acá sin tratamiento especial: Commands.ensureOwnerToperos()
// garantiza al arrancar el bot que su topero (ej. "Joaquin") ya existe y está
// vinculado a su número, así que una búsqueda normal alcanza.
export async function statsToperoCommand(nombreTopero: string, groupJid: string): Promise<string | null> {
	const topero = await Topero.findByName(nombreTopero);
	if (!topero) return null;

	const jid = topero.jid;
	const nombre = topero.name;

	if (!jid) {
		return `📊 ${nombre} todavía no está vinculado a ningún número (usá /set ${nombre} @contacto), así que no hay estadísticas para mostrar.`;
	}

	const { total, masUsado } = ComandoUso.estadisticas(jid, groupJid);
	if (total === 0 || !masUsado) {
		return `📊 ${nombre} todavía no usó ningún comando en este grupo.`;
	}

	return (
		`📊 Estadísticas de ${nombre} en este grupo:\n` +
		`Comandos usados: ${total}\n` +
		`Comando más usado: /${masUsado.command} (${masUsado.count} ${masUsado.count === 1 ? "vez" : "veces"})`
	);
}
