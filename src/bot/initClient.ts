import makeWASocket, {
	useMultiFileAuthState,
	fetchLatestBaileysVersion,
	WASocket,
} from "@whiskeysockets/baileys";
import P from "pino";

export async function createSocket(): Promise<WASocket> {
	const { state, saveCreds } = await useMultiFileAuthState("./session");
	const { version } = await fetchLatestBaileysVersion();

	const sock = makeWASocket({
		version,
		auth: state,
		logger: P({ level: "silent" }),
		browser: ["Bot-wpp", "Chrome", "1.0.0"],
	});

	sock.ev.on("creds.update", saveCreds);

	return sock;
}
