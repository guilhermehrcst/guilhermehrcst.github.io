// Dates as a Brazilian reader writes them ("11 de outubro de 2026"), from ISO dates (YYYY-MM-DD).
const format = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export const formatDate = (iso: string): string => format.format(new Date(`${iso}T00:00:00Z`));
