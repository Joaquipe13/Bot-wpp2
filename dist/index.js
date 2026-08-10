"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./db/database"));
const dotenv_1 = __importDefault(require("dotenv"));
const bot_1 = require("./bot");
dotenv_1.default.config();
async function main() {
    database_1.default.getInstance();
    console.log("✅ Base de datos lista y bot inicializado");
    async function startBot() {
        try {
            const sock = await (0, bot_1.createSocket)();
            await (0, bot_1.registerSocketEvents)(sock, startBot);
        }
        catch (error) {
            console.error("❌ Error al crear socket, reintentando en 5s...", error);
            setTimeout(startBot, 5000);
        }
    }
    await startBot();
}
main().catch((error) => {
    console.error("❌ Error al iniciar:", error);
    process.exit(1);
});
