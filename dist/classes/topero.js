"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topero = void 0;
const database_1 = __importDefault(require("../db/database"));
const utils_1 = require("../utils");
class Topero {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    static async findByName(name) {
        name = (0, utils_1.capitalize)(name);
        const db = database_1.default.getInstance().getDB();
        const row = db
            .prepare("SELECT id, name FROM toperos WHERE name = ?")
            .get(name);
        return row ? new Topero(row.id, row.name) : null;
    }
}
exports.Topero = Topero;
