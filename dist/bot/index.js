"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketEvents = exports.createSocket = void 0;
var initClient_1 = require("./initClient");
Object.defineProperty(exports, "createSocket", { enumerable: true, get: function () { return initClient_1.createSocket; } });
var events_1 = require("./events");
Object.defineProperty(exports, "registerSocketEvents", { enumerable: true, get: function () { return events_1.registerSocketEvents; } });
