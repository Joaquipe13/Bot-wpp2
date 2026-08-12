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
	// Dueños fijos del bot, definidos en código (no en la DB) para que siempre
	// haya alguien capaz de otorgar el primer admin aunque la tabla toperos esté vacía.
	// El owner es superior a admin: puede dar/quitar admin y banear admins.
	private static readonly owners: string[] = ["222359231398085"];
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

	public static exists(cmd: string): boolean {
		if (cmd in Commands.commands) return true;
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
