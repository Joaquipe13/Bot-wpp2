import { audioCommand, pingCommand, showAllTopsCommand, uploadFinalCommand, uploadAbsencesCommand } from '../commands';
import { TopAntipala } from '../classes';

export type CommandResult =
	| { type: 'text'; payload: string }
	| { type: 'audio'; payload: { buffer: Buffer; mimetype: string; fileName: string } };

export async function handleCommand(command: string, body: string): Promise<CommandResult> {
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
					return { type: 'text', payload: await topAntipala.getTopAntipala(body) };
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

			case "play":
				try {
					return { type: 'audio', payload: await audioCommand(body) };
				} catch (err: any) {
					throw new Error(err.message || "❌ Error al obtener el audio.");
				}

			default:
				throw new Error("❌ Error al procesar el comando.");
		}
	} catch (error: any) {
		throw new Error(error.message || "❌ Error al procesar el comando.");
	}
}
