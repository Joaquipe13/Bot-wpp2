export function normalizeJid(jid?: string | null): string {
	return (jid || "").split(":")[0].split("@")[0];
}
