"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAbsencesCommand = uploadAbsencesCommand;
const classes_1 = require("../classes");
const falta_1 = require("../classes/falta");
const utils_1 = require("../utils");
async function uploadAbsencesCommand(body) {
    try {
        const match = body.match(/^\/falta\s+(.+?)\s+clases:(\d+)\s+horas:(\d+)\s+fecha:(\d{2}\/\d{2}\/\d{4})$/i);
        if (!match) {
            throw new Error("❌ Formato inválido. Usá:\n/falta <nombre> clases:<número> horas:<número> fecha:dd/mm/aaaa");
        }
        const [, nombre, clases, horas, dateStr] = match;
        const absences_classes = parseInt(clases, 10);
        const absences_hours = parseInt(horas, 10);
        const absence_date = (0, utils_1.parseDate)(dateStr);
        const topero = await classes_1.Topero.findByName(nombre.trim());
        if (!topero) {
            throw new Error(`❌ No se encontró el topero ${nombre.trim()}.`);
        }
        const falta = new falta_1.Falta(absence_date, topero.id, absences_hours, absences_classes);
        await falta.save();
        return `Muy antipala lo tuyo ${topero.name}`;
    }
    catch (error) {
        throw new Error(error.message || "❌ Error al registrar la falta.");
    }
}
