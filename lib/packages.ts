import type { CoachPackage } from "@/types/database";

export const MAX_PACKAGES = 4;

// Keeps only well-formed packages (the column is free-form JSON).
export function cleanPackages(raw: unknown): CoachPackage[] {
  if (!Array.isArray(raw)) return [];
  const out: CoachPackage[] = [];
  for (const p of raw) {
    const price = Number(p?.price);
    if (!(price > 0 && price <= 5000)) continue;
    if (p?.kind === "bundle") {
      const sessions = Math.round(Number(p.sessions));
      if (sessions >= 2 && sessions <= 50) out.push({ kind: "bundle", sessions, price });
    } else if (p?.kind === "group") {
      const groupSize = Math.round(Number(p.group_size));
      if (groupSize >= 2 && groupSize <= 30) out.push({ kind: "group", group_size: groupSize, price });
    }
  }
  return out.slice(0, MAX_PACKAGES);
}

export function perSessionPrice(pkg: CoachPackage) {
  return pkg.kind === "bundle" ? pkg.price / pkg.sessions : pkg.price;
}

// Percentage saved per session compared to the coach's normal hourly rate (0 if none).
export function savingsPercent(pkg: CoachPackage, hourlyRate: number) {
  if (!(hourlyRate > 0)) return 0;
  const pct = Math.round((1 - perSessionPrice(pkg) / hourlyRate) * 100);
  return pct > 0 ? pct : 0;
}

// Lowest per-session price across packages, if it beats the hourly rate.
export function lowestPackagePrice(packages: unknown, hourlyRate: number) {
  const prices = cleanPackages(packages).map(perSessionPrice);
  if (!prices.length) return null;
  const min = Math.min(...prices);
  return min < hourlyRate ? min : null;
}

export function formatEuro(amount: number) {
  return `€${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}
