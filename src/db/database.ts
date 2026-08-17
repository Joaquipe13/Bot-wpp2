import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data.db");

class DatabaseManager {
	private static instance: DatabaseManager;
	private db: Database.Database;

	private constructor() {
		this.db = new Database(DB_PATH);
		this.db.pragma("journal_mode = WAL");
		this.db.pragma("foreign_keys = ON");
		this.createTables();
		this.migrateToperos();
		console.log(`✅ SQLite conectado: ${DB_PATH}`);
	}

	public static getInstance(): DatabaseManager {
		if (!DatabaseManager.instance) {
			DatabaseManager.instance = new DatabaseManager();
		}
		return DatabaseManager.instance;
	}

	private createTables(): void {
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS top_diarios (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				date_top TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS toperos (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL UNIQUE,
				jid TEXT,
				role TEXT NOT NULL DEFAULT 'common',
				banned INTEGER NOT NULL DEFAULT 0
			);
			CREATE TABLE IF NOT EXISTS top_diario_toperos (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				top_diario_id INTEGER NOT NULL,
				topero_id INTEGER NOT NULL,
				posicion INTEGER NOT NULL,
				points INTEGER NOT NULL,
				FOREIGN KEY (top_diario_id) REFERENCES top_diarios(id),
				FOREIGN KEY (topero_id) REFERENCES toperos(id)
			);
			CREATE TABLE IF NOT EXISTS finales (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				topero_id INTEGER NOT NULL,
				date_top TEXT NOT NULL,
				nota INTEGER NOT NULL,
				materia TEXT NOT NULL,
				points INTEGER NOT NULL,
				FOREIGN KEY (topero_id) REFERENCES toperos(id)
			);
			CREATE TABLE IF NOT EXISTS faltas (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				absence_date TEXT NOT NULL,
				absences_hours INTEGER NOT NULL,
				absences_classes INTEGER NOT NULL,
				topero_id INTEGER NOT NULL,
				FOREIGN KEY (topero_id) REFERENCES toperos(id)
			);
			CREATE TABLE IF NOT EXISTS auth_state (
				key TEXT PRIMARY KEY,
				value TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS sugerencias (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id TEXT NOT NULL,
				texto TEXT NOT NULL,
				created_at TEXT NOT NULL DEFAULT (datetime('now'))
			);
			CREATE TABLE IF NOT EXISTS comando_usos (
				jid TEXT NOT NULL,
				group_jid TEXT NOT NULL,
				command TEXT NOT NULL,
				count INTEGER NOT NULL DEFAULT 0,
				PRIMARY KEY (jid, group_jid, command)
			);
			CREATE TABLE IF NOT EXISTS reconexiones (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				timestamp TEXT NOT NULL DEFAULT (datetime('now')),
				motivo TEXT
			);
		`);
	}

	// Migra bases ya existentes que fueron creadas antes de sumar jid/role/banned a toperos
	// (CREATE TABLE IF NOT EXISTS no altera tablas ya existentes).
	private migrateToperos(): void {
		const columns = this.db.prepare("PRAGMA table_info(toperos)").all() as { name: string }[];
		const names = columns.map((c) => c.name);
		if (!names.includes("jid")) {
			this.db.exec("ALTER TABLE toperos ADD COLUMN jid TEXT");
		}
		if (!names.includes("role")) {
			this.db.exec("ALTER TABLE toperos ADD COLUMN role TEXT NOT NULL DEFAULT 'common'");
		}
		if (!names.includes("banned")) {
			this.db.exec("ALTER TABLE toperos ADD COLUMN banned INTEGER NOT NULL DEFAULT 0");
		}
		// UNIQUE vía ALTER TABLE no está permitido en SQLite; se agrega como índice aparte.
		// SQLite trata cada NULL como distinto, así que los toperos sin jid asignado no chocan entre sí.
		this.db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_toperos_jid ON toperos(jid)");
	}

	public getDB(): Database.Database {
		return this.db;
	}
}

export default DatabaseManager;
