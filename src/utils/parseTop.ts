import { parseDate } from "./parseDate";
import { removeAccents } from "./removeAccents";

const DIAS_SEMANA: Record<string, number> = {
	domingo: 0,
	lunes: 1,
	martes: 2,
	miercoles: 3,
	jueves: 4,
	viernes: 5,
	sabado: 6,
};

function medianoche(fecha: Date): Date {
	return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

// Día de la semana -> la ocurrencia más reciente (hoy incluido), nunca futura,
// porque esto siempre carga resultados de un día que ya pasó.
function fechaDeDiaSemana(nombreDia: string): Date {
	const objetivo = DIAS_SEMANA[nombreDia];
	const hoy = medianoche(new Date());
	const diff = (hoy.getDay() - objetivo + 7) % 7;
	hoy.setDate(hoy.getDate() - diff);
	return hoy;
}

function resolverFecha(descriptor: string): Date {
	const texto = descriptor.trim();

	if (texto === "") {
		return medianoche(new Date());
	}

	if (texto === "ayer") {
		const ayer = medianoche(new Date());
		ayer.setDate(ayer.getDate() - 1);
		return ayer;
	}

	if (texto in DIAS_SEMANA) {
		return fechaDeDiaSemana(texto);
	}

	const matchFecha = texto.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?$/);
	if (matchFecha) {
		const [, dia, mes, anio] = matchFecha;
		const anioFinal = anio || String(new Date().getFullYear());
		return parseDate(`${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${anioFinal}`);
	}

	throw new Error(
		'❌ No entendí a qué día se refiere. Usá "Top antipala del día", "...ayer", un día de la semana (ej: viernes), o una fecha (dd/mm o dd/mm/aaaa).'
	);
}

export function parseTop(body: string): { nombres: string[]; date_top: Date } {
	const lines = body.split("\n").map((line) => line.trim());
	const primeraLinea = removeAccents(lines[0].toLowerCase());

	const match = primeraLinea.match(/^top antipala del dia\s*(.*)$/);
	if (!match) {
		throw new Error('❌ Formato inválido. El mensaje tiene que empezar con "Top antipala del día".');
	}

	const date_top = resolverFecha(match[1]);

	const nombres: string[] = lines
		.slice(1)
		.map((line) => line.replace(/^\d+\s+/, "").trim())
		.filter((nombre) => nombre.length > 0);

	return { nombres, date_top };
}
