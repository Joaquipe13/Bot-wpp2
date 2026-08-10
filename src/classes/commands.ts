export class Commands {
	private static instance: Commands;
	private static readonly commands: Record<string, 'common' | 'admin'> = {
		//help: 'common',
		//ping: 'common',
		//topdiario: 'common',
		play: 'common',
		//final: 'admin',
		//top: 'common',
	};
	private static readonly adminUsers: string[] = ['222359231398085'];
	private constructor() {}

	public static getInstance(): Commands {
		if (!Commands.instance) {
		Commands.instance = new Commands();
		}
		return Commands.instance;
	}

	public static exists(cmd: string): boolean {
		if(cmd in Commands.commands)  return true 
		throw new Error(`El comando '/${cmd}' no existe.\n\nUse '/help' para ver la lista de comandos disponibles.`);
	}
	
	public static hasPermission(userId: string, cmd: string = ""): boolean {
		const type = Commands.commands[cmd];
		if (type === 'admin' || cmd === "") {
			if (!Commands.adminUsers.includes(userId)) {
				throw new Error(`No tienes permisos para ejecutar el comando ${cmd}.\n\nUse '/help' para ver la lista de comandos disponibles.`);
			}
		}
		return true;
	}

	public help(userId: string): string {
		const isAdmin = Commands.adminUsers.includes(userId);
		return 'Comandos disponibles:\n\n' +
			Object.entries(Commands.commands)
			.filter(([_, type]) => type === 'common' || isAdmin)
			.map(([cmd, type]) => `/${cmd}${type === 'admin' ? ' (admin)' : ''}`)
			.join(', ');
	}


	public getAll(): string[] {
		return Object.keys(Commands.commands);
	}
}