import { proto } from '@whiskeysockets/baileys';
import { audioCommand, pingCommand, showAllTopsCommand, uploadFinalCommand, uploadAbsencesCommand, guardarAudioCommand, guardarImagenCommand, imagenCommand, editarAudioCommand, editarImagenCommand, crearAudioCommand, TopAntipalaCommand } from '../commands';
import { TopAntipala } from '../classes';

export type CommandResult =
	| { type: 'text'; payload: string }
	| { type: 'audio'; payload: { buffer: Buffer; mimetype: string; fileName: string } }
	| { type: 'image'; payload: { buffer: Buffer; mimetype: string } };

export async function handleCommand(
	command: string,
	body: string,
	quotedMessage?: proto.IMessage | null,
	quotedFromBot?: boolean
): Promise<CommandResult> {
	const topAntipala = TopAntipala.getInstance();
	try {
		switch (command) {
			case "ping":
				return { type: 'text', payload: pingCommand() };

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
