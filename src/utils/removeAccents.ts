// Saca tildes/diacriticos para comparar texto sin depender de como lo haya
// escrito quien manda el mensaje ("dia" con o sin tilde, "miercoles" con o
// sin tilde, etc.). Construido con codepoints en vez de un literal \u para
// evitar ambiguedades de escaping.
const COMBINING_MARK_START = 0x300;
const COMBINING_MARK_END = 0x36f;
const DIACRITICS_REGEX = new RegExp(
	`[${String.fromCharCode(COMBINING_MARK_START)}-${String.fromCharCode(COMBINING_MARK_END)}]`,
	"g"
);

export function removeAccents(text: string): string {
	return text.normalize("NFD").replace(DIACRITICS_REGEX, "");
}
