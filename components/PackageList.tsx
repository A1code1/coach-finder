import type { CoachPackage } from "@/types/database";
import { cleanPackages, formatEuro, perSessionPrice, savingsPercent } from "@/lib/packages";

export function PackageList({ packages, hourlyRate }: { packages: CoachPackage[] | null | undefined; hourlyRate: number }) {
  const list = cleanPackages(packages);
  if (!list.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {list.map((pkg, i) => {
        const save = savingsPercent(pkg, hourlyRate);
        return (
          <div key={i} className="border border-gray-200 rounded-lg p-4 relative">
            {save > 0 && (
              <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                Save {save}%
              </span>
            )}
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              {pkg.kind === "bundle" ? "Session package" : "Group rate"}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {pkg.kind === "bundle" ? `${pkg.sessions} sessions` : `Groups of up to ${pkg.group_size}`}
            </p>
            {pkg.kind === "bundle" ? (
              <p className="text-gray-700">
                <span className="text-primary-600 font-bold">{formatEuro(pkg.price)}</span> total ·{" "}
                {formatEuro(Math.round(perSessionPrice(pkg) * 100) / 100)} per session
              </p>
            ) : (
              <p className="text-gray-700">
                <span className="text-primary-600 font-bold">{formatEuro(pkg.price)}</span> per person, per session
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
