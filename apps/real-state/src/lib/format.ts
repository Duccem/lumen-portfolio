const euro = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("en-IE");

export const formatPrice = (value: number) => euro.format(value);
export const formatNumber = (value: number) => num.format(value);

/** €2.45m / €895k style, for tight labels. */
export function formatShort(value: number) {
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2).replace(/0$/, "")}m`;
  return `€${Math.round(value / 1_000)}k`;
}

/** Monthly payment on an annuity loan. */
export function monthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (principal <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}
