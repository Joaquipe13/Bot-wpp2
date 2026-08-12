import DatabaseManager from '../db/database';

export function sugerenciasCommand(): string {
	const db = DatabaseManager.getInstance().getDB();
	const rows = db
		.prepare('SELECT id, user_id, texto, created_at FROM sugerencias ORDER BY id DESC')
		.all() as Array<{ id: number; user_id: string; texto: string; created_at: string }>;

	if (rows.length === 0) {
		return '📭 Todavía no hay sugerencias.';
	}

	return (
		`📋 Sugerencias (${rows.length}):\n\n` +
		rows.map((r) => `#${r.id} — ${r.user_id} (${r.created_at}):\n${r.texto}`).join('\n\n')
	);
}
