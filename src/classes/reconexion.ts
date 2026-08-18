import DatabaseManager from "../db/database";

export class Reconexion {
	static registrar(motivo: string): void {
		const db = DatabaseManager.getInstance().getDB();
		db.prepare("INSERT INTO reconexiones (motivo) VALUES (?)").run(motivo);
	}

	static contarUltimas24h(): number {
		const db = DatabaseManager.getInstance().getDB();
		const row = db
			.prepare("SELECT COUNT(*) as total FROM reconexiones WHERE timestamp >= datetime('now', '-1 day')")
			.get() as { total: number };
		return row.total;
	}

	static contarUltimas24hCriticas(): number {
		const db = DatabaseManager.getInstance().getDB();
		const row = db
			.prepare(
				"SELECT COUNT(*) as total FROM reconexiones WHERE timestamp >= datetime('now', '-1 day') AND motivo NOT LIKE 'conexion:%' AND motivo NOT LIKE 'transitorio:%'"
			)
			.get() as { total: number };
		return row.total;
	}
}
