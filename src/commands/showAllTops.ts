
import  {TopAntipala}  from "../classes";


export async function showAllTopsCommand(): Promise<string> {
    try {
		const topAntipala = TopAntipala.getInstance();
        const topList = await topAntipala.getTopsList();
		return topList;
    } catch (error:any) {
        throw new Error(error.message);
    }    
};

