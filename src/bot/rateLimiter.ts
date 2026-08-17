// Estado en memoria (no necesita sobrevivir un reinicio: son ventanas cortas
// de segundos/minutos, a diferencia de las reconexiones que sí se llevan en SQLite).

const VENTANA_USUARIO_MS = 10_000;
const LIMITE_USUARIO = 3;

const VENTANA_GLOBAL_MS = 60_000;
const LIMITE_GLOBAL = 10;

const historialPorUsuario = new Map<string, number[]>();
let historialGlobal: number[] = [];

// true si este usuario ya mandó 3+ comandos en los últimos 10s (este intento
// no se cuenta si es rechazado, para no alargar el bloqueo de más).
export function usuarioExcedeLimite(jid: string): boolean {
	const ahora = Date.now();
	const historial = (historialPorUsuario.get(jid) || []).filter((t) => ahora - t < VENTANA_USUARIO_MS);

	if (historial.length >= LIMITE_USUARIO) {
		historialPorUsuario.set(jid, historial);
		return true;
	}

	historial.push(ahora);
	historialPorUsuario.set(jid, historial);
	return false;
}

export function registrarMensajeEnviado(): void {
	historialGlobal.push(Date.now());
}

// true si el bot ya mandó más de 10 mensajes (de cualquier tipo) en el último minuto.
export function botSuperoLimiteGlobal(): boolean {
	const ahora = Date.now();
	historialGlobal = historialGlobal.filter((t) => ahora - t < VENTANA_GLOBAL_MS);
	return historialGlobal.length > LIMITE_GLOBAL;
}

// Delay aleatorio de 1 a 3 segundos, para no responder a velocidad de máquina.
export function delayHumano(): number {
	return 1000 + Math.random() * 2000;
}
