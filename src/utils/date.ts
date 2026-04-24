const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
	timeZone: "America/Sao_Paulo",
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
