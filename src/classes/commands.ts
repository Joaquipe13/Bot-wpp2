import { Topero } from "./topero";

type PermissionLevel = "common" | "admin" | "owner";

export class Commands {
	private static instance: Commands;
	private static readonly commands: Record<string, PermissionLevel> = {
		help: "common",
		ping: "common",
		repo: "common",
		sugerir: "common",
		sugerencias: "admin",
		chiste: "common",
		topdiario: "common",
		audio: "common",
		guardar: "admin",
		imagen: "common",
		editar: "admin",
		crear: "admin",
		final: "admin",
		top: "common",
		ban: "admin",
		unban: "admin",
		admin: "owner",
		set: "admin",
	};
	private static readonly aliases: Record<string, string> = {
		a: "audio",
		i: "imagen",
		e: "editar",
		g: "guardar",
		h: "help",
		c: "crear",
	};
	// Se usa tanto para los errores de "uso incorrecto" como para /help [comando],
	// así el texto vive en un solo lugar y no se desincroniza entre los dos.
	private static readonly usage: Record<string, string> = {
		help: "/help [comando] — muestra cómo usar ese comando.\n/help audio [carpeta] — lista las carpetas o los audios disponibles.\n/help imagen — lista las imágenes disponibles.",
		ping: "/ping — revisa si el bot está vivo.",
		repo: "/repo — muestra el link al repositorio del bot y cómo contribuir.",
		sugerir: "/sugerir [sugerencia] — mandá una idea o sugerencia para el bot.",
		sugerencias: "/sugerencias — (admin) lista todas las sugerencias mandadas.",
		chiste: "/chiste — manda un chiste al azar.\n/guardar chiste [texto] — (admin) agrega un chiste nuevo.",
		topdiario: "/topdiario — muestra el historial completo de tops diarios cargados.",
		audio: "/audio [carpeta] [nombre] — manda un audio.\nSin nada: uno al azar. Con carpeta: al azar de esa carpeta. Con carpeta y nombre: ese audio puntual.\nUsá /help audio para ver las carpetas.",
		guardar:
			"/guardar [carpeta] [nombre] — (admin) respondiendo un audio, lo guarda.\n" +
			"/guardar [nombre] — (admin) respondiendo una imagen, la guarda (nombre opcional).\n" +
			"/guardar chiste [texto] — (admin) guarda un chiste nuevo.",
		imagen: "/imagen [nombre] — manda una imagen.\nSin nada: una al azar.\nUsá /help imagen para ver los nombres disponibles.",
		editar:
			"/editar audio [carpeta] [nombre_viejo] [nombre_nuevo] — (admin) renombra un audio.\n" +
			"/editar imagen [nombre_viejo] [nombre_nuevo] — (admin) renombra una imagen.",
		crear:
			"/crear audio [nombre_carpeta] — (admin) crea una carpeta de audios.\n" +
			"/crear topero [nombre] [@contacto opcional] — (admin) crea un topero, opcionalmente vinculado a un número.",
		final: "/final [nombre] materia:[texto] nota:[número] fecha:dd/mm/aaaa — (admin) carga un final rendido.",
		top: "/top [AAAA-C] — muestra el ranking del Top Antipala.\nSin nada: el período actual. Ejemplo: /top 2026-1",
		ban: "/ban @contacto — (admin) banea a un contacto; no puede usar el bot hasta que lo desbaneen.",
		unban: "/unban @contacto — (admin) desbanea a un contacto.",
		admin: "/admin @contacto — (owner) da rol de admin a un contacto.\n/admin remove @contacto — (owner) le quita el rol de admin.",
		set: "/set [nombre_topero] @contacto — (admin) vincula un número de teléfono a un topero que ya existe.",
	};
	// Dueños fijos del bot, definidos en código (no en la DB) para que siempre
	// haya alguien capaz de otorgar el primer admin aunque la tabla toperos esté vacía.
	// El owner es superior a admin: puede dar/quitar admin y banear admins.
	private static readonly owners: string[] = ["222359231398085"];
	// Nombre a mostrar para cada owner (no vive en toperos, así que se resuelve acá).
	private static readonly ownerNames: Record<string, string> = {
		"222359231398085": "Joaquin",
	};
	private constructor() {}

	public static getInstance(): Commands {
		if (!Commands.instance) {
			Commands.instance = new Commands();
		}
		return Commands.instance;
	}

	public static resolveAlias(cmd: string): string {
		return Commands.aliases[cmd] || cmd;
	}

	public static isOwner(userId: string): boolean {
		return Commands.owners.includes(userId);
	}

	// Nombre de "topero" para saludos/mensajes a partir de un jid: el owner
	// tiene nombre fijo en código (no está en la tabla toperos), y si no, se
	// busca el topero vinculado a ese número. Devuelve null si no hay nada.
	public static async displayName(userId: string): Promise<string | null> {
		if (Commands.ownerNames[userId]) return Commands.ownerNames[userId];
		const topero = await Topero.findByJid(userId);
		return topero ? topero.name : null;
	}

	// Se corre al iniciar el bot: cada owner con nombre definido en ownerNames
	// tiene que tener un topero vinculado a su número. Si ya hay uno vinculado
	// no se toca; si existe un topero con ese nombre pero sin jid, se vincula
	// (arregla el caso "Joaquin sin vincular"); si no existe ninguno, se crea.
	public static async ensureOwnerToperos(): Promise<void> {
		for (const [jid, name] of Object.entries(Commands.ownerNames)) {
			const yaVinculado = await Topero.findByJid(jid);
			if (yaVinculado) continue;

			const existente = await Topero.findByName(name);
			if (existente) {
				existente.setJid(jid);
				console.log(`🔗 Topero "${existente.name}" vinculado al owner.`);
				continue;
			}

			await Topero.create(name, jid);
			console.log(`✅ Topero "${name}" creado para el owner.`);
		}
	}

	public static getUsage(cmd: string): string {
		return Commands.usage[cmd] || `No hay ayuda específica para '/${cmd}'.`;
	}

	public static isRegistered(cmd: string): boolean {
		return cmd in Commands.commands;
	}

	public static exists(cmd: string): boolean {
		if (Commands.isRegistered(cmd)) return true;
		throw new Error(`El comando '/${cmd}' no existe.\n\nUse '/help' para ver la lista de comandos disponibles.`);
	}

	public static async hasPermission(userId: string, cmd: string = ""): Promise<boolean> {
		if (Commands.isOwner(userId)) return true;

		const topero = await Topero.findByJid(userId);
		if (topero?.banned) {
			throw new Error("🚫 Estás baneado y no podés usar el bot.");
		}

		const required = cmd === "" ? "admin" : Commands.commands[cmd];
		const isAdmin = topero?.role === "admin";

		if (required === "owner" || (required === "admin" && !isAdmin)) {
			throw new Error(`No tienes permisos para ejecutar el comando ${cmd}.\n\nUse '/help' para ver la lista de comandos disponibles.`);
		}
		return true;
	}

	public async help(userId: string): Promise<string> {
		const isOwner = Commands.isOwner(userId);
		let isAdmin = isOwner;
		if (!isAdmin) {
			const topero = await Topero.findByJid(userId);
			isAdmin = topero?.role === "admin";
		}
		return (
			"Comandos disponibles:\n\n" +
			Object.entries(Commands.commands)
				.filter(([, type]) => type === "common" || (type === "admin" && isAdmin) || (type === "owner" && isOwner))
				.map(([cmd, type]) => `/${cmd}${type !== "common" ? ` (${type})` : ""}`)
				.join(", ")
		);
	}

	public getAll(): string[] {
		return Object.keys(Commands.commands);
	}
}
