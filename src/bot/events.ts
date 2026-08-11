import { WASocket, proto, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { topDiarioCommand } from "../commands";
import { TopAntipala, Commands } from "../classes";
import { handleCommand } from "../utils";

const topAntipala = TopAntipala.getInstance();

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

export async function registerSocketEvents(
	sock: WASocket,
	reconnect: () => Promise<void>,
	clearAuthState: () => void
): Promise<void> {
	sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
		if (qr) {
			qrcode.generate(qr, { small: true });
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
						await sock.sendMessage(
							replyJid,
							{ text: error.message || "❌ Error al procesar el top." },
							{ quoted: msg }
						);
					}
					continue;
				}

				if (bodyLower.startsWith("/")) {
					try {
						const command = bodyLower.split(" ")[0].slice(1);
						if (command === "help") {
							const helpMessage = Commands.getInstance().help(userId);
							await sock.sendMessage(replyJid, { text: helpMessage }, { quoted: msg });
							continue;
						}
						if (Commands.exists(command)) {
							Commands.hasPermission(userId, command);
							const result = await handleCommand(command, bodyLower);
							console.log(`${userId}\n🔍 Comando ejecutado: ${command}`);
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
							}
						}
					} catch (error: any) {
						await sock.sendMessage(
							replyJid,
							{ text: error.message || "❌ Error al procesar el comando." },
							{ quoted: msg }
						);
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
