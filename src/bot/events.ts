import { WASocket, proto, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "path";
import { topDiarioCommand, helpAudioCommand, helpImagenCommand } from "../commands";
import { TopAntipala, Commands } from "../classes";
import { handleCommand } from "../utils";
import { DB_PATH } from "../db/database";

const topAntipala = TopAntipala.getInstance();
const QR_PATH = path.join(path.dirname(DB_PATH), "qr.png");

function getMessageText(msg: proto.IWebMessageInfo): string {
	return (
		msg.message?.conversation ||
		msg.message?.extendedTextMessage?.text ||
		msg.message?.imageMessage?.caption ||
		""
	).trim();
}

function getSenderId(msg: proto.IWebMessageInfo): string {
	const jid = msg.key?.participant || msg.key?.remoteJid || "";
	return jid.split("@")[0];
}

function baseJid(jid?: string | null): string {
	return (jid || "").split(":")[0].split("@")[0];
}

export async function registerSocketEvents(
	sock: WASocket,
	reconnect: () => Promise<void>,
	clearAuthState: () => void
): Promise<void> {
	sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
		if (qr) {
			qrcode.generate(qr, { small: true });
			try {
				await QRCode.toFile(QR_PATH, qr);
				console.log(`📷 QR también guardado como imagen en: ${QR_PATH}`);
			} catch (error) {
				console.error("⚠️ No se pudo guardar el QR como imagen:", error);
			}
		}

		if (connection === "close") {
			const code = (lastDisconnect?.error as Boom)?.output?.statusCode;
			if (code === DisconnectReason.loggedOut) {
				console.error("❌ Sesión cerrada desde el celular. Generando nuevo QR...");
				clearAuthState();
				await reconnect();
			} else {
				console.warn("⚠️ Desconectado, reconectando...");
				await reconnect();
			}
		} else if (connection === "open") {
			console.log("🔐 Autenticado con éxito. Bot listo.");
			await fs.unlink(QR_PATH).catch(() => {});
		}
	});

	sock.ev.on("messages.upsert", async ({ messages, type }) => {
		if (type !== "notify") return;

		for (const msg of messages) {
			if (!msg.message || msg.key.fromMe) continue;

			const body = getMessageText(msg);
			if (!body) continue;

			const bodyLower = body.toLowerCase();
			const userId = getSenderId(msg);
			const replyJid = msg.key.remoteJid!;

			try {
				if (bodyLower.startsWith("top antipala del dia")) {
					try {
						if (Commands.hasPermission(userId)) {
							await topDiarioCommand(bodyLower, topAntipala);
							const reply = await topAntipala.getTopAntipala();
							console.log("📊 Top Antipala del día registrado.");
							await sock.sendMessage(replyJid, { text: reply }, { quoted: msg });
						}
					} catch (error: any) {
						try {
							await sock.sendMessage(
								replyJid,
								{ text: error.message || "❌ Error al procesar el top." },
								{ quoted: msg }
							);
						} catch (sendError: any) {
							console.error("⚠️ No se pudo avisar el error (conexión caída):", sendError);
						}
					}
					continue;
				}

				if (bodyLower.startsWith("/")) {
					try {
						const commandArgs = bodyLower.trim().split(/\s+/);
						const command = Commands.resolveAlias(commandArgs[0].slice(1));
						if (command === "help") {
							let helpMessage: string;
							if (commandArgs[1] === "audio") {
								try {
									helpMessage = await helpAudioCommand(commandArgs[2]);
								} catch (error: any) {
									helpMessage = error.message || "❌ Error al obtener la ayuda de /audio.";
								}
							} else if (commandArgs[1] === "imagen") {
								try {
									helpMessage = await helpImagenCommand();
								} catch (error: any) {
									helpMessage = error.message || "❌ Error al obtener la ayuda de /imagen.";
								}
							} else {
								helpMessage = Commands.getInstance().help(userId);
							}
							await sock.sendMessage(replyJid, { text: helpMessage }, { quoted: msg });
							continue;
						}
						if (Commands.exists(command)) {
							Commands.hasPermission(userId, command);
							const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
							const quotedMessage = contextInfo?.quotedMessage;
							const quotedFromBot = baseJid(contextInfo?.participant) === baseJid(sock.user?.id);
							const result = await handleCommand(command, bodyLower, quotedMessage, quotedFromBot);
							console.log(`${userId}\n🔍 Comando ejecutado: ${command}`);
							try {
								if (result.type === "text") {
									await sock.sendMessage(
										replyJid,
										{ text: result.payload },
										{ quoted: msg }
									);
								} else if (result.type === "audio") {
									await sock.sendMessage(
										replyJid,
										{
											audio: result.payload.buffer,
											mimetype: "audio/ogg; codecs=opus",
											ptt: true,
										},
										{ quoted: msg }
									);
								} else if (result.type === "image") {
									await sock.sendMessage(
										replyJid,
										{
											image: result.payload.buffer,
											mimetype: result.payload.mimetype,
										},
										{ quoted: msg }
									);
								}
							} catch (sendError: any) {
								console.error("⚠️ Falló el envío de audio/imagen (conexión inestable):", sendError);
							}
						}
					} catch (error: any) {
						try {
							await sock.sendMessage(
								replyJid,
								{ text: error.message || "❌ Error al procesar el comando." },
								{ quoted: msg }
							);
						} catch (sendError: any) {
							console.error("⚠️ No se pudo avisar el error (conexión caída):", sendError);
						}
					}
				}
			} catch (error: any) {
				console.error("💥 Error no capturado:", error);
				console.error("Mensaje que causó el error:", body);
				try {
					await sock.sendMessage(
						replyJid,
						{ text: error.message || "❌ Ocurrió un error inesperado." },
						{ quoted: msg }
					);
				} catch {}
			}
		}
	});
}
