"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketEvents = registerSocketEvents;
const baileys_1 = require("@whiskeysockets/baileys");
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const commands_1 = require("../commands");
const classes_1 = require("../classes");
const utils_1 = require("../utils");
const topAntipala = classes_1.TopAntipala.getInstance();
function getMessageText(msg) {
    return (msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption ||
        "").trim();
}
function getSenderId(msg) {
    const jid = msg.key?.participant || msg.key?.remoteJid || "";
    return jid.split("@")[0];
}
async function registerSocketEvents(sock, reconnect) {
    sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            qrcode_terminal_1.default.generate(qr, { small: true });
        }
        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;
            if (code === baileys_1.DisconnectReason.loggedOut) {
                console.error("❌ Sesión cerrada. Eliminá la carpeta ./session y volvé a escanear el QR.");
            }
            else {
                console.warn("⚠️ Desconectado, reconectando...");
                await reconnect();
            }
        }
        else if (connection === "open") {
            console.log("🔐 Autenticado con éxito. Bot listo.");
        }
    });
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify")
            return;
        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe)
                continue;
            const body = getMessageText(msg);
            if (!body)
                continue;
            const bodyLower = body.toLowerCase();
            const userId = getSenderId(msg);
            const replyJid = msg.key.remoteJid;
            try {
                if (bodyLower.startsWith("top antipala del dia")) {
                    try {
                        if (classes_1.Commands.hasPermission(userId)) {
                            await (0, commands_1.topDiarioCommand)(bodyLower, topAntipala);
                            const reply = await topAntipala.getTopAntipala();
                            console.log("📊 Top Antipala del día registrado.");
                            await sock.sendMessage(replyJid, { text: reply }, { quoted: msg });
                        }
                    }
                    catch (error) {
                        await sock.sendMessage(replyJid, { text: error.message || "❌ Error al procesar el top." }, { quoted: msg });
                    }
                    continue;
                }
                if (bodyLower.startsWith("/")) {
                    try {
                        const command = bodyLower.split(" ")[0].slice(1);
                        if (command === "help") {
                            const helpMessage = classes_1.Commands.getInstance().help(userId);
                            await sock.sendMessage(replyJid, { text: helpMessage }, { quoted: msg });
                            continue;
                        }
                        if (classes_1.Commands.exists(command)) {
                            classes_1.Commands.hasPermission(userId, command);
                            const result = await (0, utils_1.handleCommand)(command, bodyLower);
                            console.log(`${userId}\n🔍 Comando ejecutado: ${command}`);
                            if (result.type === "text") {
                                await sock.sendMessage(replyJid, { text: result.payload }, { quoted: msg });
                            }
                            else if (result.type === "audio") {
                                await sock.sendMessage(replyJid, {
                                    audio: result.payload.buffer,
                                    mimetype: "audio/ogg; codecs=opus",
                                    ptt: true,
                                }, { quoted: msg });
                            }
                        }
                    }
                    catch (error) {
                        await sock.sendMessage(replyJid, { text: error.message || "❌ Error al procesar el comando." }, { quoted: msg });
                    }
                }
            }
            catch (error) {
                console.error("💥 Error no capturado:", error);
                console.error("Mensaje que causó el error:", body);
                try {
                    await sock.sendMessage(replyJid, { text: error.message || "❌ Ocurrió un error inesperado." }, { quoted: msg });
                }
                catch { }
            }
        }
    });
}
