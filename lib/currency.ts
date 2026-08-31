export function formatPEN(value: number) {
  return "S/ " + new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 }).format(value);
}

