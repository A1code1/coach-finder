"use client";

import { MAX_PACKAGES } from "@/lib/packages";

export type PackageDraft = { kind: "bundle" | "group"; count: string; price: string };

const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500";

export function PackagesEditor({
  value,
  onChange,
}: {
  value: PackageDraft[];
  onChange: (next: PackageDraft[]) => void;
}) {
  const update = (index: number, patch: Partial<PackageDraft>) =>
    onChange(value.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Packages & group rates (optional)</label>
      <p className="text-xs text-gray-500 mb-3">
        Offer a discount for booking several sessions, or a per-person price for small groups.
      </p>

      <div className="space-y-3">
        {value.map((pkg, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-3">
            <div className="flex gap-2 mb-3">
              {(["bundle", "group"] as const).map((kind) => (
                <button
                  type="button"
                  key={kind}
                  onClick={() => update(i, { kind })}
                  className={`px-3 py-1 rounded-full text-sm border transition ${
                    pkg.kind === kind
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  {kind === "bundle" ? "Session package" : "Group rate"}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="ml-auto text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-xs text-gray-600 mb-1">
                  {pkg.kind === "bundle" ? "Number of sessions" : "Max group size"}
                </span>
                <input
                  type="number"
                  min={2}
                  max={pkg.kind === "bundle" ? 50 : 30}
                  value={pkg.count}
                  onChange={(e) => update(i, { count: e.target.value })}
                  placeholder={pkg.kind === "bundle" ? "5" : "4"}
                  className={inputClass}
                />
              </div>
              <div>
                <span className="block text-xs text-gray-600 mb-1">
                  {pkg.kind === "bundle" ? "Total price (€)" : "Price per person, per session (€)"}
                </span>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  value={pkg.price}
                  onChange={(e) => update(i, { price: e.target.value })}
                  placeholder={pkg.kind === "bundle" ? "200" : "15"}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {value.length < MAX_PACKAGES && (
        <button
          type="button"
          onClick={() => onChange([...value, { kind: "bundle", count: "", price: "" }])}
          className="mt-3 text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          + Add a package or group rate
        </button>
      )}
    </div>
  );
}
