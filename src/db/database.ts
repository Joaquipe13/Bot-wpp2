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
				date_top TEXT NOT NULL UNIQUE
			);
			-- CREATE TABLE no altera una tabla que ya existe, así que esto además
			-- aplica la restricción en bases que ya tenían top_diarios sin UNIQUE.
			CREATE UNIQUE INDEX IF NOT EXISTS idx_top_diarios_date_top ON top_diarios(date_top);
			CREATE TABLE IF NOT EXISTS toperos (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL UNIQUE,
				jid TEXT UNIQUE,
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
			DROP TABLE IF EXISTS reconexion;
			DROP TABLE IF EXISTS reconexiones;
		`);
	}

	public getDB(): Database.Database {
		return this.db;
	}
}

export default DatabaseManager;
