"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showTopOfCommand = showTopOfCommand;
const classes_1 = require("../classes");
async function showTopOfCommand(date) {
    const topAntipala = classes_1.TopAntipala.getInstance();
    try {
        const top = await topAntipala.getTopAntipalaByDate(date);
        if (!top) {
            throw new Error("❌ No hubo top.");
        }
        return top;
    }
    catch (error) {
        throw new Error(error.message || "❌ Error al obtener el top para esa fecha.");
    }
}
