/** Formatea un número como pesos colombianos: $1.250.000 */
export function formatCOP(value: number): string {
  return '$' + Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Convierte 2025-03-15 en 15/03/2025 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
