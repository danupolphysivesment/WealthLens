export const money = (x: number, d = 0) =>
  x == null || isNaN(x)
    ? "—"
    : x.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: d });

export const moneyShort = (x: number) => {
  if (x == null || isNaN(x)) return "—";
  const a = Math.abs(x);
  if (a >= 1e9) return `$${(x / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `$${(x / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `$${(x / 1e3).toFixed(0)}K`;
  return `$${x.toFixed(0)}`;
};

export const pct = (x: number, d = 1) =>
  x == null || isNaN(x) ? "—" : `${(x * 100).toFixed(d)}%`;

export const signedPct = (x: number, d = 1) =>
  `${x >= 0 ? "+" : ""}${(x * 100).toFixed(d)}%`;

export const num = (x: number, d = 2) => (x == null || isNaN(x) ? "—" : x.toFixed(d));
