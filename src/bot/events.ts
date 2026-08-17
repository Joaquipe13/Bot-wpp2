import { WASocket, proto, DisconnectReason } from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "path";
import { topDiarioCommand, helpAudioCommand, helpImagenCommand, statsToperoCommand } from "../commands";
import { TopAntipala, Commands, Topero, ComandoUso, Reconexion } from "../classes";
import { handleCommand, normalizeJid, removeAccents } from "../utils";
import { DB_PATH } from "../db/database";
import { usuarioExcedeLimite, botSuperoLimiteGlobal, registrarMensajeEnviado, delayHumano } from "./rateLimiter";

const topAntipala = TopAntipala.getInstance();
const QR_PATH = path.join(path.dirname(DB_PATH), "qr.png");

// Backoff de reconexión: WhatsApp banea temporalmente cuentas que reconectan
// en loop instantáneo al perder la conexión, así que antes de cada intento se
// espera cada vez más. Este contador vive a nivel de módulo (no dentro de
// registerSocketEvents) para que persista entre sockets sucesivos dentro del
// mismo proceso, ya que se vuelve a llamar en cada reconexión.
const RECONNECT_BASE_DELAY_MS = 5_000; // 5s en el primer intento
const RECONNECT_MAX_DELAY_MS = 5 * 60_000; // tope de 5 min mientras se duplica
const RECONNECT_LONG_DELAY_MS = 30 * 60_000; // 30 min pasados los 10 intentos
const RECONNECT_LONG_DELAY_THRESHOLD = 10;

const BAN_WAIT_MS = 8 * 60 * 60_000; // 8h si WhatsApp devuelve un código de ban
const DAILY_LIMIT_WAIT_MS = 2 * 60 * 60_000; // 2h si ya hubo demasiadas reconexiones hoy
const DAILY_LIMIT_THRESHOLD = 5; // más de esto en 24hs dispara el modo espera

let intentosReconexionFallidos = 0;

function calcularDelayReconexion(): number {
	intentosReconexionFallidos++;
	if (intentosReconexionFallidos > RECONNECT_LONG_DELAY_THRESHOLD) {
		return RECONNECT_LONG_DELAY_MS;
	}
	return Math.min(
		RECONNECT_BASE_DELAY_MS * 2 ** (intentosReconexionFallidos - 1),
		RECONNECT_MAX_DELAY_MS
	);
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMessageText(msg: proto.IWebMessageInfo): string {
	return (
		msg.message?.conversation ||
		msg.message?.extendedTextMessage?.text ||
		msg.message?.imageMessage?.caption ||
		""
	).trim();
}

function getSenderId(msg: proto.IWebMessageInfo): string {
	return normalizeJid(msg.key?.participant || msg.key?.remoteJid);
}

// Wrapper de sock.sendMessage que además cuenta el envío para el rate limit
// global (botSuperoLimiteGlobal) — todo lo que el bot manda tiene que pasar
// por acá para que ese conteo sea real.
type MensajeContenido = Parameters<WASocket["sendMessage"]>[1];
type MensajeOpciones = Parameters<WASocket["sendMessage"]>[2];

async function enviarMensaje(
	sock: WASocket,
	jid: string,
	content: MensajeContenido,
	options?: MensajeOpciones
): Promise<void> {
	await sock.sendMessage(jid, content, options);
	registrarMensajeEnviado();
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
			Reconexion.registrar(code != null ? String(code) : "desconocido");

			if (code === DisconnectReason.loggedOut) {
				console.error("❌ Sesión cerrada desde el celular. Generando nuevo QR...");
				clearAuthState();
			}

			// 401 (loggedOut) y 403 (forbidden) son las señales más cercanas a un ban
			// que expone Baileys. Nada de reintentar rápido acá: se espera 8hs antes
			// de volver a golpear los servidores de WhatsApp.
			if (code === DisconnectReason.loggedOut || code === DisconnectReason.forbidden) {
				console.error(
					`🚫 Código ${code} recibido (posible ban/sesión inválida). Esperando 8hs antes de reintentar...`
				);
				intentosReconexionFallidos = 0;
				await sleep(BAN_WAIT_MS);
				await reconnect();
				return;
			}

			const reconexionesHoy = Reconexion.contarUltimas24h();
			if (reconexionesHoy > DAILY_LIMIT_THRESHOLD) {
				console.warn(
					`⚠️ ${reconexionesHoy} reconexiones en las últimas 24hs. Esperando 2hs antes de reintentar...`
				);
				await sleep(DAILY_LIMIT_WAIT_MS);
				await reconnect();
				return;
			}

			const delay = calcularDelayReconexion();
			console.warn(
				`⚠️ Desconectado (intento ${intentosReconexionFallidos}). Reconectando en ${Math.round(delay / 1000)}s...`
			);
			await sleep(delay);
			await reconnect();
		} else if (connection === "open") {
			intentosReconexionFallidos = 0;
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
			// "top antipala del dia" también dispara con tilde ("día"); se compara
			// sin acentos para no tener que repetir el chequeo dos veces.
			const bodySinAcentos = removeAccents(bodyLower);
			const userId = getSenderId(msg);
			const replyJid = msg.key.remoteJid!;

			try {
				const remitente = await Topero.findByJid(userId);
				if (remitente?.banned) {
					if (bodyLower.startsWith("/") || bodySinAcentos.startsWith("top antipala del dia")) {
						try {
							await enviarMensaje(
								sock,
								replyJid,
								{ text: "🚫 Estás baneado y no podés usar el bot." },
								{ quoted: msg }
							);
						} catch (sendError: any) {
							console.error("⚠️ No se pudo avisar el baneo (conexión caída):", sendError);
						}
					}
					continue;
				}

				if (botSuperoLimiteGlobal()) {
					console.warn("⚠️ Rate limit global: el bot ya mandó más de 10 mensajes en el último minuto, se ignora este mensaje.");
					continue;
				}

				/* 
				if (/^hola\b/i.test(bodyLower)) {
					try {
						const nombre = await Commands.displayName(userId);
						const saludo = nombre ? `Hola ${nombre}!` : "Hola!";
						await sock.sendMessage(replyJid, { text: saludo }, { quoted: msg });
					} catch (error: any) {
						console.error("⚠️ Error al saludar:", error);
					}
					continue;
				} 
				*/

				if (bodySinAcentos.startsWith("top antipala del dia")) {
					try {
						if (await Commands.hasPermission(userId)) {
							await topDiarioCommand(bodyLower, topAntipala);
							const reply = await topAntipala.getTopAntipala();
							console.log("📊 Top Antipala del día registrado.");
							await enviarMensaje(sock, replyJid, { text: reply }, { quoted: msg });
						}
					} catch (error: any) {
						try {
							await enviarMensaje(
								sock,
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
						if (usuarioExcedeLimite(userId)) {
							console.warn(`⚠️ Rate limit: ${userId} superó 3 comandos en 10s, se ignora.`);
							continue;
						}
						// Delay aleatorio para no responder a velocidad de máquina.
						await sleep(delayHumano());

						const commandArgs = bodyLower.trim().split(/\s+/);
						const command = Commands.resolveAlias(commandArgs[0].slice(1));
						if (command === "help") {
							ComandoUso.registrar(userId, replyJid, "help");
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
							} else if (commandArgs[1]) {
								const otroComando = Commands.resolveAlias(commandArgs[1]);
								try {
									Commands.exists(otroComando);
									helpMessage = Commands.getUsage(otroComando);
								} catch (error: any) {
									helpMessage = error.message || `❌ Error al obtener la ayuda de /${otroComando}.`;
								}
							} else {
								helpMessage = await Commands.getInstance().help(userId);
							}
							await enviarMensaje(sock, replyJid, { text: helpMessage }, { quoted: msg });
							continue;
						}
						if (Commands.isRegistered(command)) {
							await Commands.hasPermission(userId, command);
							const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
							const quotedMessage = contextInfo?.quotedMessage;
							const quotedFromBot = normalizeJid(contextInfo?.participant) === normalizeJid(sock.user?.id);
							const mentionedJid = normalizeJid(contextInfo?.mentionedJid?.[0]);
							const result = await handleCommand(command, bodyLower, quotedMessage, quotedFromBot, userId, body, mentionedJid);
							ComandoUso.registrar(userId, replyJid, command);
							const ahora = new Date();
							const hora = `${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`;
							const nombreTopero = await Commands.displayName(userId);
							console.log(`${hora} ${userId}${nombreTopero ? ` [${nombreTopero}]` : ""} {${replyJid}}\n🔍 Comando ejecutado: ${command}`);
							try {
								if (result.type === "text") {
									await enviarMensaje(
										sock,
										replyJid,
										{ text: result.payload },
										{ quoted: msg }
									);
								} else if (result.type === "audio") {
									await enviarMensaje(
										sock,
										replyJid,
										{
											audio: result.payload.buffer,
											mimetype: "audio/ogg; codecs=opus",
											ptt: true,
										},
										{ quoted: msg }
									);
								} else if (result.type === "image") {
									await enviarMensaje(
										sock,
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
						} else {
							// No es un comando registrado: puede ser el nombre de un topero
							// (ej: /choco), consultando sus estadísticas de uso en este grupo.
							const stats = await statsToperoCommand(command, replyJid);
							if (stats === null) {
								Commands.exists(command);
							} else {
								await enviarMensaje(sock, replyJid, { text: stats }, { quoted: msg });
							}
						}
					} catch (error: any) {
						try {
							await enviarMensaje(
								sock,
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
					await enviarMensaje(
						sock,
						replyJid,
						{ text: error.message || "❌ Ocurrió un error inesperado." },
						{ quoted: msg }
					);
				} catch {}
			}
		}
	});
}
