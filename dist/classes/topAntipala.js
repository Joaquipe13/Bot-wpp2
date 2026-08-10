"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopAntipala = void 0;
const topero_1 = require("./topero");
const utils_1 = require("../utils");
const database_1 = __importDefault(require("../db/database"));
const cuatrimestre_1 = require("./cuatrimestre");
class TopAntipala {
    getDB() {
        return database_1.default.getInstance().getDB();
    }
    constructor() {
        this.tops = {};
        this.topList = null;
    }
    refreshTopsList() {
        this.topList = null;
        this.tops = {};
    }
    static getInstance() {
        if (!TopAntipala.instance) {
            TopAntipala.instance = new TopAntipala();
        }
        return TopAntipala.instance;
    }
    async getTopAntipala(period) {
        try {
            if (!period) {
                period = cuatrimestre_1.PeriodManager.resolvePeriodByDate(new Date());
            }
            if (this.tops[period]) {
                return this.tops[period];
            }
            const periodDates = cuatrimestre_1.PeriodManager.getPeriod(period);
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
			`).all(dateStart, dateEnd, dateStart, dateEnd);
            if (rows.length === 0) {
                return `📉 No hay registros aún para el Top Antipala del período ${period}.`;
            }
            const [anio, cuatriNum] = period.split("-");
            const cuatri = cuatriNum === "1" ? "1er cuatrimestre" : "2do cuatrimestre";
            let mensaje = `🔝 Top Antipala ${cuatri} ${anio}:\n`;
            rows.forEach((row, index) => {
                mensaje += `${index + 1}. ${row.name} (${row.total_points} pts)\n`;
            });
            this.tops[period] = mensaje.trim();
            return mensaje.trim();
        }
        catch (error) {
            throw new Error("❌ Error al obtener el Top Antipala.");
        }
    }
    async validarUsuariosExistentes(nombres) {
        if (nombres.length === 0) {
            throw new Error("❌ No ha nadie en el top gil.");
        }
        const capitalizedNames = nombres.map((n) => (0, utils_1.capitalize)(n));
        const db = this.getDB();
        const placeholders = capitalizedNames.map(() => "?").join(",");
        const rows = db
            .prepare(`SELECT id, name FROM toperos WHERE name IN (${placeholders})`)
            .all(...capitalizedNames);
        const encontradosMap = new Map(rows.map((r) => [r.name, new topero_1.Topero(r.id, r.name)]));
        const encontrados = capitalizedNames
            .map((n) => encontradosMap.get(n))
            .filter(Boolean);
        const faltantes = capitalizedNames.filter((n) => !encontradosMap.has(n));
        if (faltantes.length > 0) {
            throw new Error(`❌ Flasheaste cualquiera con: ${faltantes.join(", ")}.\nEscribi bien mogolico.`);
        }
        console.log(encontrados);
        return encontrados;
    }
    async getTopsList() {
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
            .all();
        if (rows.length === 0) {
            throw new Error("📉 No hay registros aún para el Top Antipala del día.");
        }
        const grouped = {};
        for (const row of rows) {
            if (!grouped[row.date_top])
                grouped[row.date_top] = [];
            grouped[row.date_top].push({ posicion: row.posicion, name: row.name });
        }
        const result = Object.entries(grouped).map(([date, entries]) => {
            const lines = entries.map((e) => `${e.posicion} ${e.name}`).join("\n");
            return `Top antipala del dia ${date}:\n${lines}`;
        });
        this.topList = result.join("\n\n");
        return this.topList;
    }
    async getTopAntipalaByDate(date_top) {
        const db = this.getDB();
        const dateParsed = (0, utils_1.parseDate)(date_top);
        const dateStr = dateParsed.toISOString().split("T")[0];
        const rows = db
            .prepare(`
				SELECT t.name, dt.points
				FROM top_diario_toperos dt
				JOIN top_diarios d ON d.id = dt.top_diario_id
				JOIN toperos t ON t.id = dt.topero_id
				WHERE d.date_top = ?
				ORDER BY dt.posicion
			`)
            .all(dateStr);
        if (rows.length === 0) {
            return `📉 No hay registros para el Top Antipala del ${dateStr}.`;
        }
        let mensaje = `🔝 Top Antipala del ${dateStr}:\n`;
        rows.forEach((row, index) => {
            mensaje += `${index + 1}. ${row.name} (${row.points} pts)\n`;
        });
        return mensaje.trim();
    }
}
exports.TopAntipala = TopAntipala;
