"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topDiarioCommand = topDiarioCommand;
const classes_1 = require("../classes");
const utils_1 = require("../utils");
async function topDiarioCommand(body, topAntipala) {
    try {
        const { nombres, date_top } = (0, utils_1.parseTop)(body);
        const toperos = await topAntipala.validarUsuariosExistentes(nombres);
        const topDiario = new classes_1.TopDiario(date_top, toperos);
        await topDiario.save();
    }
    catch (error) {
        throw new Error(error.message);
    }
}
;
