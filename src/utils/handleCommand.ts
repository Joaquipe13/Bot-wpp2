import { proto } from '@whiskeysockets/baileys';
import { audioCommand, pingCommand, repoCommand, sugerirCommand, sugerenciasCommand, chisteCommand, guardarChisteCommand, banCommand, unbanCommand, adminCommand, adminRemoveCommand, setToperoCommand, showAllTopsCommand, uploadFinalCommand, uploadAbsencesCommand, guardarAudioCommand, guardarImagenCommand, imagenCommand, editarAudioCommand, editarImagenCommand, crearAudioCommand, TopAntipalaCommand } from '../commands';
import { TopAntipala } from '../classes';

export type CommandResult =
	| { type: 'text'; payload: string }
	| { type: 'audio'; payload: { buffer: Buffer; mimetype: string; fileName: string } }
	| { type: 'image'; payload: { buffer: Buffer; mimetype: string } };

export async function handleCommand(
	command: string,
	body: string,
	quotedMessage?: proto.IMessage | null,
	quotedFromBot?: boolean,
	userId?: string,
	rawBody?: string,
	mentionedJid?: string
): Promise<CommandResult> {
	const topAntipala = TopAntipala.getInstance();
	try {
		switch (command) {
			case "ping":
				return { type: 'text', payload: pingCommand() };

			case "repo":
				return { type: 'text', payload: repoCommand() };

			case "sugerir":
				try {
					const texto = (rawBody || body).trim().replace(/^\S+\s*/, "");
					return { type: 'text', payload: sugerirCommand(userId || "desconocido", texto) };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al guardar la sugerencia.");
				}

			case "sugerencias":
				try {
					return { type: 'text', payload: sugerenciasCommand() };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al obtener las sugerencias.");
				}

			case "chiste":
				try {
					return { type: 'text', payload: await chisteCommand() };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al obtener el chiste.");
				}

			case "ban":
				try {
					if (!mentionedJid) {
						throw new Error("❌ Mencioná (@) a quién querés banear. Uso: /ban @contacto");
					}
					return { type: 'text', payload: await banCommand(userId || "", mentionedJid) };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al banear.");
				}

			case "unban":
				try {
					if (!mentionedJid) {
						throw new Error("❌ Mencioná (@) a quién querés desbanear. Uso: /unban @contacto");
					}
					return { type: 'text', payload: await unbanCommand(mentionedJid) };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al desbanear.");
				}

			case "admin":
				try {
					if (!mentionedJid) {
						throw new Error("❌ Mencioná (@) a un contacto. Uso: /admin @contacto o /admin remove @contacto");
					}
					const esRemove = body.trim().split(" ")[1] === "remove";
					return {
						type: 'text',
						payload: esRemove ? await adminRemoveCommand(mentionedJid) : await adminCommand(mentionedJid),
					};
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al modificar el rol de admin.");
				}

			case "set":
				try {
					if (!mentionedJid) {
						throw new Error("❌ Mencioná (@) a un contacto. Uso: /set [nombre_topero] @contacto");
					}
					const nombreTopero = body.trim().split(" ")[1];
					if (!nombreTopero) {
						throw new Error("❌ Uso: /set [nombre_topero] @contacto");
					}
					return { type: 'text', payload: await setToperoCommand(nombreTopero, mentionedJid) };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al vincular el topero.");
				}

			case "topdiario":
				try {
					return { type: 'text', payload: await showAllTopsCommand() };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al obtener el listado de tops.");
				}

			case "top":
				try {
					return { type: 'text', payload: await TopAntipalaCommand(body) };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al obtener el top.");
				}

			case "final":
				try {
					const reply = await uploadFinalCommand(body);
					const top = await topAntipala.getTopAntipala();
					return { type: 'text', payload: `${reply}\n${top}` };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al cargar un final.");
				}

			case "falta":
				try {
					return { type: 'text', payload: await uploadAbsencesCommand(body) };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al registrar la falta.");
				}

			case "audio":
				try {
					return { type: 'audio', payload: await audioCommand(body) };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al obtener el audio.");
				}

			case "guardar":
				try {
					if (body.trim().split(" ")[1] === "chiste") {
						const texto = (rawBody || body).trim().replace(/^\S+\s+\S+\s*/, "");
						return { type: 'text', payload: await guardarChisteCommand(texto) };
					}

					const audioMessage = quotedMessage?.audioMessage;
					const imageMessage = quotedMessage?.imageMessage;
					if (!audioMessage && !imageMessage) {
						throw new Error(
							"❌ Tenés que responder a un audio o una imagen para guardarlo.\nUso: /guardar [carpeta] [nombre] (audio) o /guardar [nombre] (imagen)"
						);
					}
					if (quotedFromBot) {
						throw new Error(
							"❌ Solo se pueden guardar audios/imágenes que mandó alguien del grupo, no los que mandó el bot."
						);
					}
					if (imageMessage) {
						const nombreImagen = body.trim().split(" ")[1];
						return {
							type: 'text',
							payload: await guardarImagenCommand(nombreImagen, imageMessage),
						};
					}
					const [, nombreCarpeta, nombreAudio] = body.trim().split(" ");
					return {
						type: 'text',
						payload: await guardarAudioCommand(nombreCarpeta, nombreAudio, audioMessage!),
					};
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al guardar.");
				}

			case "imagen":
				try {
					const nombreImagen = body.trim().split(" ")[1];
					return { type: 'image', payload: await imagenCommand(nombreImagen) };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al obtener la imagen.");
				}

			case "editar":
				try {
					const args = body.trim().split(" ");
					const tipo = args[1];
					if (tipo === "audio") {
						const [, , carpeta, nombreViejo, nombreNuevo] = args;
						return {
							type: 'text',
							payload: await editarAudioCommand(carpeta, nombreViejo, nombreNuevo),
						};
					}
					if (tipo === "imagen") {
						const [, , nombreViejo, nombreNuevo] = args;
						return {
							type: 'text',
							payload: await editarImagenCommand(nombreViejo, nombreNuevo),
						};
					}
					throw new Error(
						"❌ Uso: /editar audio [carpeta] [nombre_viejo] [nombre_nuevo]\no /editar imagen [nombre_viejo] [nombre_nuevo]"
					);
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al editar.");
				}

			case "crear":
				try {
					const args = body.trim().split(" ");
					const tipo = args[1];
					if (tipo === "audio") {
						return { type: 'text', payload: await crearAudioCommand(args[2]) };
					}
					throw new Error("❌ Uso: /crear audio [nombre_carpeta]");
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al crear.");
				}

			default:
				throw new Error("❌ Error al procesar el comando.");
		}
	} catch (error: any) {
		throw new Error(error.message || "❌ Error al procesar el comando.");
	}
}
