import DatabaseManager from "../db/database";
import { toTitleCase } from "../utils";

type Role = "common" | "admin";

interface ToperoRow {
	id: number;
	name: string;
	jid: string | null;
	role: Role;
	banned: number;
}

export class Topero {
	id: number;
	name: string;
	jid: string | null;
	role: Role;
	banned: boolean;

	constructor(id: number, name: string, jid: string | null = null, role: Role = "common", banned: boolean = false) {
		this.id = id;
		// Se normaliza acá para que cualquier forma de obtener un Topero (buscarlo,
		// crearlo) muestre siempre el mismo formato, sin importar cómo esté
		// guardado el nombre en la base (eso no se toca).
		this.name = toTitleCase(name);
		this.jid = jid;
		this.role = role;
		this.banned = banned;
	}

	private static fromRow(row: ToperoRow): Topero {
		return new Topero(row.id, row.name, row.jid, row.role, !!row.banned);
	}

	static async findByName(name: string): Promise<Topero | null> {
		const db = DatabaseManager.getInstance().getDB();
		// COLLATE NOCASE compara sin importar mayúsculas/minúsculas contra el nombre
		// tal cual está guardado (sea cual sea el formato con el que se cargó antes).
		const row = db
			.prepare("SELECT id, name, jid, role, banned FROM toperos WHERE name = ? COLLATE NOCASE")
			.get(name.trim()) as ToperoRow | undefined;
		return row ? Topero.fromRow(row) : null;
	}

	static async findByJid(jid: string): Promise<Topero | null> {
		const db = DatabaseManager.getInstance().getDB();
		const row = db
			.prepare("SELECT id, name, jid, role, banned FROM toperos WHERE jid = ?")
			.get(jid) as ToperoRow | undefined;
		return row ? Topero.fromRow(row) : null;
	}

	static async create(name: string, jid: string | null = null): Promise<Topero> {
		const cleanName = toTitleCase(name);
		const db = DatabaseManager.getInstance().getDB();
		const info = jid
			? db.prepare("INSERT INTO toperos (name, jid) VALUES (?, ?)").run(cleanName, jid)
			: db.prepare("INSERT INTO toperos (name) VALUES (?)").run(cleanName);
		return new Topero(info.lastInsertRowid as number, cleanName, jid);
	}

	// Usado por /ban y /admin: si el jid todavía no corresponde a ningún topero
	// (no participa del top diario), se crea una fila propia solo para poder
	// llevar su rol/ban. Esto no lo suma a ninguna competencia.
	static async findOrCreateByJid(jid: string): Promise<Topero> {
		const existing = await Topero.findByJid(jid);
		if (existing) return existing;

		const db = DatabaseManager.getInstance().getDB();
		const info = db.prepare("INSERT INTO toperos (name, jid) VALUES (?, ?)").run(jid, jid);
		return new Topero(info.lastInsertRowid as number, jid, jid, "common", false);
	}

	setJid(jid: string): void {
		const db = DatabaseManager.getInstance().getDB();
		db.prepare("UPDATE toperos SET jid = ? WHERE id = ?").run(jid, this.id);
		this.jid = jid;
	}

	setRole(role: Role): void {
		const db = DatabaseManager.getInstance().getDB();
		db.prepare("UPDATE toperos SET role = ? WHERE id = ?").run(role, this.id);
		this.role = role;
	}

	setBanned(banned: boolean): void {
		const db = DatabaseManager.getInstance().getDB();
		db.prepare("UPDATE toperos SET banned = ? WHERE id = ?").run(banned ? 1 : 0, this.id);
		this.banned = banned;
	}
}
