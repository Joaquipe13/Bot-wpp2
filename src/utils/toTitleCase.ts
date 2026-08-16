// Normaliza un nombre para mostrarlo: inicial en mayúscula por cada palabra
// (ej: "juan CABALLO" -> "Juan Caballo"). Es solo para salida/visualización;
// no toca cómo está guardado el nombre en la base.
export function toTitleCase(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
}
