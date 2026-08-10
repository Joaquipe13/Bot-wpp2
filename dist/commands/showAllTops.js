"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showAllTopsCommand = showAllTopsCommand;
const classes_1 = require("../classes");
async function showAllTopsCommand() {
    try {
        const topAntipala = classes_1.TopAntipala.getInstance();
        const topList = await topAntipala.getTopsList();
        return topList;
    }
    catch (error) {
        throw new Error(error.message);
    }
}
;
