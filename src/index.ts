import DatabaseManager from "./db/database";
import dotenv from "dotenv";
import { createSocket, registerSocketEvents } from "./bot";

dotenv.config();

async function main() {
	DatabaseManager.getInstance();
	console.log("✅ Base de datos lista y bot inicializado");

	async function startBot() {
		try {
			const sock = await createSocket();
			await registerSocketEvents(sock, startBot);
		} catch (error) {
			console.error("❌ Error al crear socket, reintentando en 5s...", error);
			setTimeout(startBot, 5000);
		}
	}

	await startBot();
}

main().catch((error) => {
	console.error("❌ Error al iniciar:", error);
	process.exit(1);
});
