import DatabaseManager from "../db/database";
import { capitalize } from "../utils";

export class Topero {
	id: number;
	name: string;

	constructor(id: number, name: string) {
		this.id = id;
		this.name = name;
	}

	static async findByName(name: string): Promise<Topero | null> {
		name = capitalize(name);
		const db = DatabaseManager.getInstance().getDB();
		const row = db
			.prepare("SELECT id, name FROM toperos WHERE name = ?")
			.get(name) as { id: number; name: string } | undefined;
		return row ? new Topero(row.id, row.name) : null;
	}
}
