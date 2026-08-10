import {TopAntipala, TopDiario, Topero} from "../classes";
import { parseTop } from "../utils";



export async function topDiarioCommand(body:string, topAntipala:TopAntipala): Promise<void> {

    try {
		const { nombres, date_top } = parseTop(body);
		const toperos: Array<Topero> = await topAntipala.validarUsuariosExistentes(nombres);
		const topDiario = new TopDiario(date_top, toperos);
        await topDiario.save();
    } catch (error:any) {
        throw new Error(error.message);
    }    
    
};