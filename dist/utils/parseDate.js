"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
function parseDate(dateString) {
    const [day, month, year] = dateString.split('/');
    const fechaDate = new Date(+year, +month - 1, +day);
    if (isNaN(fechaDate.getTime())) {
        throw new Error("❌ Fecha inválida. Usá el formato dd/mm/aaaa.");
    }
    return fechaDate;
}
