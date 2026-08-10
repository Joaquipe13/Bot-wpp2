"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Final = void 0;
const database_1 = __importDefault(require("../db/database"));
class Final {
    constructor(date_top, topero, materia, nota) {
        this.date_top = date_top;
        this.topero = topero;
        this.materia = materia;
        this.nota = nota;
        this.points = this.calculatePoints();
    }
    calculatePoints() {
        if (this.nota >= 10)
            return 5;
        else if (this.nota >= 8)
            return 4;
        else if (this.nota >= 6)
            return 3;
        else
            return 1;
    }
    async save() {
        const db = database_1.default.getInstance().getDB();
        try {
            db.prepare("INSERT INTO finales (date_top, nota, materia, points, topero_id) VALUES (?, ?, ?, ?, ?)").run(this.date_top.toISOString().slice(0, 10), this.nota, this.materia.trim(), this.points, this.topero.id);
        }
        catch (error) {
            console.error("❌ Error al guardar el final:", error);
            throw new Error("No se pudo guardar el final.");
        }
    }
}
exports.Final = Final;
