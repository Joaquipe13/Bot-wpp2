import { Topero } from "./topero";
import { toTitleCase } from "../utils";
import DatabaseManager from "../db/database";
import { PeriodManager } from "./cuatrimestre";

export class TopAntipala {
	private static instance: TopAntipala;
	private tops: Record<string, string> = {};
	private topList: string | null = null;

	private getDB() {
		return DatabaseManager.getInstance().getDB();
	}

	private constructor() {}

	public refreshTopsList(): void {
		this.topList = null;
		this.tops = {};
	}

	public static getInstance(): TopAntipala {
		if (!TopAntipala.instance) {
			TopAntipala.instance = new TopAntipala();
		}
		return TopAntipala.instance;
	}

	public async getTopAntipala(period?: string): Promise<string> {
		try {
			if (!period) {
				period = PeriodManager.resolvePeriodByDate(new Date());
			}
			if (this.tops[period]) {
				return this.tops[period];
			}
			const periodDates = PeriodManager.getPeriod(period);
			const dateStart = periodDates.date_start.toISOString().slice(0, 10);
			const dateEnd = periodDates.date_end.toISOString().slice(0, 10);
			const db = this.getDB();

			const rows = db.prepare(`
				SELECT
					t.name,
					COALESCE(tops.total_top_points, 0) - COALESCE(finals.total_final_points, 0) AS total_points
				FROM toperos t
				LEFT JOIN (
					SELECT topero_id, SUM(points) AS total_top_points
					FROM top_diario_toperos td
					JOIN top_diarios d ON td.top_diario_id = d.id
					WHERE d.date_top BETWEEN ? AND ?
					GROUP BY topero_id
				) AS tops ON tops.topero_id = t.id
				LEFT JOIN (
					SELECT topero_id, SUM(points) AS total_final_points
					FROM finales
					WHERE date_top BETWEEN ? AND ?
					GROUP BY topero_id
				) AS finals ON finals.topero_id = t.id
				ORDER BY total_points DESC
			`).all(dateStart, dateEnd, dateStart, dateEnd) as Array<{ name: string; total_points: number }>;

			if (rows.length === 0) {
				return `📉 No hay registros aún para el Top Antipala del período ${period}.`;
			}

			const [anio, cuatriNum] = period.split("-");
			const cuatri = cuatriNum === "1" ? "1er cuatrimestre" : "2do cuatrimestre";
			let mensaje = `🔝 Top Antipala ${cuatri} ${anio}:\n`;
			rows.forEach((row, index) => {
				mensaje += `${index + 1}. ${toTitleCase(row.name)} (${row.total_points} pts)\n`;
			});
			this.tops[period] = mensaje.trim();
			return mensaje.trim();
		} catch (error: any) {
			throw new Error("❌ Error al obtener el Top Antipala.");
		}
	}

	public async validarUsuariosExistentes(nombres: string[]): Promise<Topero[]> {
		if (nombres.length === 0) {
			throw new Error("❌ No ha nadie en el top gil.");
		}
		const nombresLimpios = nombres.map((n) => n.trim());
		const db = this.getDB();
		const placeholders = nombresLimpios.map(() => "?").join(",");
		// COLLATE NOCASE: "juan", "Juan" y "JUAN" tienen que matchear el mismo topero
		// sin importar cómo esté guardado su nombre.
		const rows = db
			.prepare(`SELECT id, name FROM toperos WHERE name COLLATE NOCASE IN (${placeholders})`)
			.all(...nombresLimpios) as Array<{ id: number; name: string }>;

		const encontradosMap = new Map(rows.map((r) => [r.name.toLowerCase(), new Topero(r.id, r.name)]));
		const encontrados = nombresLimpios
			.map((n) => encontradosMap.get(n.toLowerCase()))
			.filter(Boolean) as Topero[];

		const faltantes = nombresLimpios.filter((n) => !encontradosMap.has(n.toLowerCase()));
		if (faltantes.length > 0) {
			throw new Error(
				`❌ Flasheaste cualquiera con: ${faltantes.join(", ")}.\nEscribi bien mogolico.`
			);
		}
		return encontrados;
	}

	public async getTopsList(): Promise<string> {
		if (this.topList) {
			return this.topList;
		}
		const db = this.getDB();
		const rows = db
			.prepare(`
				SELECT d.date_top, dt.posicion, t.name
				FROM top_diario_toperos dt
				JOIN top_diarios d ON d.id = dt.top_diario_id
				JOIN toperos t ON t.id = dt.topero_id
				ORDER BY d.date_top DESC, dt.posicion ASC
			`)
			.all() as Array<{ date_top: string; posicion: number; name: string }>;

		if (rows.length === 0) {
			throw new Error("📉 No hay registros aún para el Top Antipala del día.");
		}

		const grouped: Record<string, Array<{ posicion: number; name: string }>> = {};
		for (const row of rows) {
			if (!grouped[row.date_top]) grouped[row.date_top] = [];
			grouped[row.date_top].push({ posicion: row.posicion, name: row.name });
		}

		const result = Object.entries(grouped).map(([date, entries]) => {
			const lines = entries.map((e) => `${e.posicion} ${toTitleCase(e.name)}`).join("\n");
			return `Top antipala del dia ${date}:\n${lines}`;
		});

		this.topList = result.join("\n\n");
		return this.topList;
	}
}
