"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoldersInPath = getFoldersInPath;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getFoldersInPath(dir) {
    const fullPath = path_1.default.resolve(dir);
    const entries = fs_1.default.readdirSync(fullPath, { withFileTypes: true });
    return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
}
