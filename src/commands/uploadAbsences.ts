import { Topero } from "../classes";
import { Falta } from "../classes/falta";
import { parseDate } from "../utils";

export async function uploadAbsencesCommand(body:string): Promise<string> {
	try {
		const match = body.match(
			/^\/falta\s+(.+?)\s+clases:(\d+)\s+horas:(\d+)\s+fecha:(\d{2}\/\d{2}\/\d{4})$/i
		);
		if (!match) {
			throw new Error("❌ Formato inválido. Usá:\n/falta <nombre> clases:<número> horas:<número> fecha:dd/mm/aaaa");
		}
		const [, nombre, clases, horas, dateStr] = match;
			const absences_classes:number = parseInt(clases, 10);
			const absences_hours:number = parseInt(horas, 10);
			const absence_date:Date = parseDate(dateStr)
		const topero = await Topero.findByName(nombre.trim());
		if (!topero) {
			throw new Error(`❌ No se encontró el topero ${nombre.trim()}.`);
		}
		const falta = new Falta(absence_date, topero.id, absences_hours, absences_classes);
		await falta.save();
		return `Muy antipala lo tuyo ${topero.name}`;
	}catch (error: any) {
		throw new Error(error.message || "❌ Error al registrar la falta.");
	}
}