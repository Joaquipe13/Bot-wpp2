import DatabaseManager from "../db/database";

export class Falta {
	private absence_date: Date;
	private absences_hours: number;
	private topero_id: number;
	private absences_classes: number;

	constructor(
		absence_date: Date,
		topero_id: number,
		absences_hours: number,
		absences_classes: number
	) {
		this.topero_id = topero_id;
		this.absence_date = absence_date;
		this.absences_hours = absences_hours;
		this.absences_classes = absences_classes;
	}

	async save(): Promise<void> {
		const db = DatabaseManager.getInstance().getDB();
		try {
			db.prepare(
				"INSERT INTO faltas (absence_date, absences_hours, absences_classes, topero_id) VALUES (?, ?, ?, ?)"
			).run(
				this.absence_date.toISOString().slice(0, 10),
				this.absences_hours,
				this.absences_classes,
				this.topero_id
			);
		} catch (error) {
			console.error("❌ Error al guardar la falta:", error);
			throw new Error("No se pudo guardar la falta.");
		}
	}
}
