import DatabaseManager from "./db/database";
import dotenv from "dotenv";
import { createSocket, registerSocketEvents } from "./bot";

dotenv.config();

process.on("unhandledRejection", (reason) => {
	console.error("⚠️ unhandledRejection (el bot sigue corriendo):", reason);
});

process.on("uncaughtException", (error) => {
	console.error("⚠️ uncaughtException (el bot sigue corriendo):", error);
});

async function main() {
	DatabaseManager.getInstance();
	console.log("✅ Base de datos lista y bot inicializado");

	async function startBot() {
		try {
			const { sock, clearAuthState } = await createSocket();
			await registerSocketEvents(sock, startBot, clearAuthState);
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
