function excelTimeToMinutes(value: any): number | null {
  if (typeof value === "number") {
    return Math.round(value * 24 * 60);
  }

  if (typeof value === "string") {
    const parts = value.split(":");
    if (parts.length !== 2) return null;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (isNaN(hours) || isNaN(minutes)) return null;
    return hours * 60 + minutes;
  }

  return null;
}

export function calculateWorkedHours(
  inTime?: any,
  outTime?: any
): number {
  const inMinutes = excelTimeToMinutes(inTime);
  const outMinutes = excelTimeToMinutes(outTime);

  if (inMinutes === null || outMinutes === null) return 0;

  const diff = outMinutes - inMinutes;
  return diff > 0 ? diff / 60 : 0;
}

export function excelTimeToString(value: any): string | null {
  if (typeof value === "number") {
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, "0");
    const minutes = (totalMinutes % 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}
