export function getLocalDateInputValue(date = new Date()): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateOnlyAsLocalDate(dateOnly: string): Date {
  const [year, month, day] = dateOnly.split("-").map((part) => Number(part));

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return new Date(dateOnly);
  }

  // Midday avoids DST midnight edge cases.
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function formatDateOnly(
  dateOnly: string,
  options: Intl.DateTimeFormatOptions,
  locale = "en-US"
): string {
  const parsed = parseDateOnlyAsLocalDate(dateOnly);
  if (Number.isNaN(parsed.getTime())) {
    return dateOnly;
  }

  return parsed.toLocaleDateString(locale, options);
}
