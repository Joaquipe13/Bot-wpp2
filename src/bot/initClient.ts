import makeWASocket, {
	fetchLatestBaileysVersion,
	WASocket,
} from "@whiskeysockets/baileys";
import P from "pino";
import DatabaseManager from "../db/database";
import { useSqliteAuthState } from "../db/sqliteAuthState";

export async function createSocket(): Promise<{
	sock: WASocket;
	clearAuthState: () => void;
}> {
	const db = DatabaseManager.getInstance().getDB();
	const { state, saveCreds, clearAuthState } = useSqliteAuthState(db);
	const { version } = await fetchLatestBaileysVersion();

	const sock = makeWASocket({
		version,
		auth: state,
		logger: P({ level: "silent" }),
		browser: ["Bot-wpp", "Chrome", "1.0.0"],
	});

	sock.ev.on("creds.update", saveCreds);

	return { sock, clearAuthState };
}
