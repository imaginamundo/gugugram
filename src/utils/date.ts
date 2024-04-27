export function parseDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}
