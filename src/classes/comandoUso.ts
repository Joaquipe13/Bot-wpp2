import DatabaseManager from "../db/database";

export interface EstadisticasComando {
	total: number;
	masUsado: { command: string; count: number } | null;
}

export class ComandoUso {
	// jid: quién ejecutó el comando. groupJid: en qué chat/grupo (mismo remoteJid
	// que se usa para responder). command: ya resuelto de alias (ej: "a" -> "audio"),
	// así que /a, /audio y /audio [carpeta] [nombre] cuentan todos como "audio".
	static registrar(jid: string, groupJid: string, command: string): void {
		const db = DatabaseManager.getInstance().getDB();
		db.prepare(
			`INSERT INTO comando_usos (jid, group_jid, command, count) VALUES (?, ?, ?, 1)
			 ON CONFLICT(jid, group_jid, command) DO UPDATE SET count = count + 1`
		).run(jid, groupJid, command);
	}

	static estadisticas(jid: string, groupJid: string): EstadisticasComando {
		const db = DatabaseManager.getInstance().getDB();
		const rows = db
			.prepare(
				`SELECT command, count FROM comando_usos WHERE jid = ? AND group_jid = ? ORDER BY count DESC, command ASC`
			)
			.all(jid, groupJid) as Array<{ command: string; count: number }>;

		const total = rows.reduce((acc, r) => acc + r.count, 0);
		const masUsado = rows.length > 0 ? { command: rows[0].command, count: rows[0].count } : null;
		return { total, masUsado };
	}
}
