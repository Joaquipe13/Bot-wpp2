"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTop = parseTop;
const parseDate_1 = require("./parseDate");
function parseTop(body) {
    const lines = body.split("\n").map((line) => line.trim());
    const dateRegex = /Top antipala del dia (\d{2}\/\d{2}\/\d{4})/i;
    const match = lines[0].match(dateRegex);
    if (!match) {
        throw new Error("❌ Formato de fecha inválido. Usá: dd/mm/aaaa");
    }
    const [dia, mes, anio] = match[1].split("/");
    const date_top = (0, parseDate_1.parseDate)(`${dia}/${mes}/${anio}`);
    const nombres = lines
        .slice(1)
        .map((line) => line.replace(/^\d+\s+/, "").trim())
        .filter((nombre) => nombre.length > 0);
    return { nombres, date_top };
}
