const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const moneyWhole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const formatMoney = (n: number) => (Number.isInteger(n) ? moneyWhole.format(n) : money.format(n));

const day = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

export const formatDay = (d: Date | number) => day.format(d);
export const formatTime = (d: Date | number) => time.format(d);
export const formatDayTime = (d: Date | number) => `${day.format(d)}, ${time.format(d)}`;

/** "in 2 h 10 min", "25 min ago" */
export function formatRelative(target: number, now: number) {
  const diff = Math.round((target - now) / 60000);
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const span = h >= 24 ? `${Math.round(h / 24)} d` : h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
  if (abs < 1) return "now";
  return diff > 0 ? `in ${span}` : `${span} ago`;
}
