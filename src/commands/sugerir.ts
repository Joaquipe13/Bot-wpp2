import DatabaseManager from '../db/database';

export function sugerirCommand(userId: string, texto: string): string {
	const textoLimpio = (texto || '').trim();
	if (!textoLimpio) {
		throw new Error('❌ Escribí la sugerencia. Uso: /sugerir [tu sugerencia]');
	}

	const db = DatabaseManager.getInstance().getDB();
	db.prepare('INSERT INTO sugerencias (user_id, texto) VALUES (?, ?)').run(userId, textoLimpio);

	return '✅ Gracias, tu sugerencia quedó guardada.';
}
