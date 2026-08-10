import { parseDate } from "./parseDate";

export function parseTop(body: string): { nombres: string[]; date_top: Date }   {
  const lines = body.split("\n").map((line) => line.trim());
      const dateRegex = /Top antipala del dia (\d{2}\/\d{2}\/\d{4})/i;
      const match = lines[0].match(dateRegex);

      if (!match) {
        throw new Error("❌ Formato de fecha inválido. Usá: dd/mm/aaaa");
      }

      const [dia, mes, anio] = match[1].split("/");
      const date_top = parseDate(`${dia}/${mes}/${anio}`);

      const nombres: string[] = lines
        .slice(1)
        .map((line) => line.replace(/^\d+\s+/, "").trim())
        .filter((nombre) => nombre.length > 0);
    return { nombres, date_top };
}