export function businessYear(date: Date) {
  const timeZone = process.env.IRP_BUSINESS_TIME_ZONE?.trim() || "America/Lima";
  return new Intl.DateTimeFormat("en", { year: "numeric", timeZone }).format(date);
}
