"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const DB_PATH = process.env.DB_PATH || path_1.default.join(process.cwd(), "data.db");
class DatabaseManager {
    constructor() {
        this.db = new better_sqlite3_1.default(DB_PATH);
        this.db.pragma("journal_mode = WAL");
        this.db.pragma("foreign_keys = ON");
        this.createTables();
        console.log(`✅ SQLite conectado: ${DB_PATH}`);
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    createTables() {
        this.db.exec(`
			CREATE TABLE IF NOT EXISTS top_diarios (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				date_top TEXT NOT NULL
			);
			CREATE TABLE IF NOT EXISTS toperos (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT NOT NULL UNIQUE
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
		`);
    }
    getDB() {
        return this.db;
    }
}
exports.default = DatabaseManager;
