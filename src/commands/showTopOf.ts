import  {TopAntipala}  from "../classes";

export async function showTopOfCommand(date:string): Promise<string> {
	const topAntipala = TopAntipala.getInstance();
	try {
		const top = await topAntipala.getTopAntipalaByDate(date);
		if (!top) {
			throw new Error("❌ No hubo top.");
		}
		return top;
	} catch (error:any) {
		throw new Error(error.message || "❌ Error al obtener el top para esa fecha.");
	}
}
