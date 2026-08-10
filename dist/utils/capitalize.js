"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalize = capitalize;
function capitalize(str) {
    if (!str)
        return "";
    return str[0].toUpperCase() + str.slice(1).toLowerCase();
}
