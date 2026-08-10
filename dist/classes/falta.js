"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Falta = void 0;
const database_1 = __importDefault(require("../db/database"));
class Falta {
    constructor(absence_date, topero_id, absences_hours, absences_classes) {
        this.topero_id = topero_id;
        this.absence_date = absence_date;
        this.absences_hours = absences_hours;
        this.absences_classes = absences_classes;
    }
    async save() {
        const db = database_1.default.getInstance().getDB();
        try {
            db.prepare("INSERT INTO faltas (absence_date, absences_hours, absences_classes, topero_id) VALUES (?, ?, ?, ?)").run(this.absence_date.toISOString().slice(0, 10), this.absences_hours, this.absences_classes, this.topero_id);
        }
        catch (error) {
            console.error("❌ Error al guardar la falta:", error);
            throw new Error("No se pudo guardar la falta.");
        }
    }
}
exports.Falta = Falta;
