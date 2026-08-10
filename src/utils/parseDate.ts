export function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/');
  const fechaDate = new Date(+year, +month - 1, +day);

  if (isNaN(fechaDate.getTime())) {
    throw new Error("❌ Fecha inválida. Usá el formato dd/mm/aaaa.");
  }

  return fechaDate;
}
