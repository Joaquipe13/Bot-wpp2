"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
class Commands {
    constructor() { }
    static getInstance() {
        if (!Commands.instance) {
            Commands.instance = new Commands();
        }
        return Commands.instance;
    }
    static exists(cmd) {
        if (cmd in Commands.commands)
            return true;
        throw new Error(`El comando '/${cmd}' no existe.\n\nUse '/help' para ver la lista de comandos disponibles.`);
    }
    static hasPermission(userId, cmd = "") {
        const type = Commands.commands[cmd];
        if (type === 'admin' || cmd === "") {
            if (!Commands.adminUsers.includes(userId)) {
                throw new Error(`No tienes permisos para ejecutar el comando ${cmd}.\n\nUse '/help' para ver la lista de comandos disponibles.`);
            }
        }
        return true;
    }
    help(userId) {
        const isAdmin = Commands.adminUsers.includes(userId);
        return 'Comandos disponibles:\n\n' +
            Object.entries(Commands.commands)
                .filter(([_, type]) => type === 'common' || isAdmin)
                .map(([cmd, type]) => `/${cmd}${type === 'admin' ? ' (admin)' : ''}`)
                .join(', ');
    }
    getAll() {
        return Object.keys(Commands.commands);
    }
}
exports.Commands = Commands;
Commands.commands = {
    //help: 'common',
    //ping: 'common',
    //topdiario: 'common',
    play: 'common',
    //final: 'admin',
    //top: 'common',
};
Commands.adminUsers = ['222359231398085'];
