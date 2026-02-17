/**
 * Formatter singleton de moeda (BRL sem decimais).
 * Compartilhado entre PublicVehicleCard e PublicVehicleDetails.
 */
export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}
