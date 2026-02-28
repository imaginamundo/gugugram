const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDate(date: Date) {
	return dateFormatter.format(date);
}

export function formatToISO(date: Date) {
  return date.toISOString();
}
