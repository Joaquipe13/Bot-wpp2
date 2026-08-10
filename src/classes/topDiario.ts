import { Topero } from "./topero";
import DatabaseManager from "../db/database";
import { TopAntipala } from "./topAntipala";

export class TopDiario {
	date_top: string;
	toperos: Topero[];

	constructor(date_top: Date, toperos: Topero[]) {
		this.date_top = date_top.toISOString().slice(0, 10);
		this.toperos = toperos;
	}

	async save(): Promise<void> {
		const db = DatabaseManager.getInstance().getDB();
		const toperos = this.toperos;
		const dateTop = this.date_top;
		const topLength = toperos.length;

		const doInsert = db.transaction(() => {
			const result = db
				.prepare("INSERT INTO top_diarios (date_top) VALUES (?)")
				.run(dateTop);
			const topDiarioId = result.lastInsertRowid as number;
			for (let i = 0; i < topLength; i++) {
				db.prepare(
					"INSERT INTO top_diario_toperos (top_diario_id, topero_id, posicion, points) VALUES (?, ?, ?, ?)"
				).run(topDiarioId, toperos[i].id, i + 1, topLength - i);
			}
		});

		try {
			doInsert();
		} catch (error) {
			console.error("❌ Error en transacción:", error);
			throw new Error("❌ Error guardando TopDiario, suerte la próxima.");
		}
		TopAntipala.getInstance().refreshTopsList();
	}
}
