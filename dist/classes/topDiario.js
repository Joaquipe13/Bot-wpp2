"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopDiario = void 0;
const database_1 = __importDefault(require("../db/database"));
const topAntipala_1 = require("./topAntipala");
class TopDiario {
    constructor(date_top, toperos) {
        this.date_top = date_top.toISOString().slice(0, 10);
        this.toperos = toperos;
    }
    async save() {
        const db = database_1.default.getInstance().getDB();
        const toperos = this.toperos;
        const dateTop = this.date_top;
        const topLength = toperos.length;
        const doInsert = db.transaction(() => {
            const result = db
                .prepare("INSERT INTO top_diarios (date_top) VALUES (?)")
                .run(dateTop);
            const topDiarioId = result.lastInsertRowid;
            for (let i = 0; i < topLength; i++) {
                db.prepare("INSERT INTO top_diario_toperos (top_diario_id, topero_id, posicion, points) VALUES (?, ?, ?, ?)").run(topDiarioId, toperos[i].id, i + 1, topLength - i);
            }
        });
        try {
            doInsert();
        }
        catch (error) {
            console.error("❌ Error en transacción:", error);
            throw new Error("❌ Error guardando TopDiario, suerte la próxima.");
        }
        topAntipala_1.TopAntipala.getInstance().refreshTopsList();
    }
}
exports.TopDiario = TopDiario;
