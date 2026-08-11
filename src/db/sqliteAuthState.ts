import Database from "better-sqlite3";
import {
	proto,
	initAuthCreds,
	BufferJSON,
	AuthenticationState,
} from "@whiskeysockets/baileys";

/**
 * Guarda las credenciales de sesión de WhatsApp (Baileys) en SQLite en vez de
 * archivos sueltos, para que sobrevivan reinicios/reubicaciones del contenedor
 * usando el mismo volumen que ya persiste la base de datos.
 */
export function useSqliteAuthState(db: Database.Database): {
	state: AuthenticationState;
	saveCreds: () => Promise<void>;
	clearAuthState: () => void;
} {
	const getStmt = db.prepare("SELECT value FROM auth_state WHERE key = ?");
	const setStmt = db.prepare(
		"INSERT INTO auth_state (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value"
	);
	const delStmt = db.prepare("DELETE FROM auth_state WHERE key = ?");
	const clearStmt = db.prepare("DELETE FROM auth_state");

	const readData = <T>(key: string): T | null => {
		const row = getStmt.get(key) as { value: string } | undefined;
		if (!row) return null;
		return JSON.parse(row.value, BufferJSON.reviver);
	};

	const writeData = (key: string, data: unknown): void => {
		setStmt.run(key, JSON.stringify(data, BufferJSON.replacer));
	};

	const removeData = (key: string): void => {
		delStmt.run(key);
	};

	const creds = readData<AuthenticationState["creds"]>("creds") || initAuthCreds();

	return {
		state: {
			creds,
			keys: {
				get: async (type, ids) => {
					const data: { [id: string]: any } = {};
					for (const id of ids) {
						let value = readData<any>(`${type}-${id}`);
						if (type === "app-state-sync-key" && value) {
							value = proto.Message.AppStateSyncKeyData.fromObject(value);
						}
						data[id] = value;
					}
					return data;
				},
				set: async (data) => {
					for (const category in data) {
						for (const id in data[category as keyof typeof data]) {
							const value = (data as any)[category][id];
							const key = `${category}-${id}`;
							if (value) {
								writeData(key, value);
							} else {
								removeData(key);
							}
						}
					}
				},
			},
		},
		saveCreds: async () => {
			writeData("creds", creds);
		},
		clearAuthState: () => {
			clearStmt.run();
		},
	};
}
