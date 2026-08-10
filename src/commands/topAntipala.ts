import { TopAntipala } from "../classes";

export async function TopAntipalaCommand(body: string): Promise<string> {
	const topAntipala = TopAntipala.getInstance();
	try {
		const parts = body.trim().split(/\s+/);
		if (parts.length === 1) {
			return await topAntipala.getTopAntipala();
		} else{
			const period = parts[1].trim();
			const match = period.match(/^(\d{4})-(1|2)$/);
			if (!match) {
				throw new Error(`❌ Formato inválido. Usá: /top o /top AAAA-C`);
			}
			return await topAntipala.getTopAntipala(period);
		} 
	} catch (err: any) {
		throw new Error(err.message || "❌ Error al obtener el Top Antipala.");
	}
}