import { TIME_SLOTS, DAYS, DAY_LABELS } from "@/constants/time-slots";

export function AvailabilityGrid({ availability }: { availability: Record<string, string[]> }) {
  const hasAny = DAYS.some((day) => (availability[day] || []).length > 0);

  if (!hasAny) {
    return <p className="text-gray-500">Availability not specified</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left p-2"></th>
            {TIME_SLOTS.map((slot) => (
              <th key={slot} className="p-2 text-gray-500 font-medium text-center whitespace-nowrap">
                {slot.split(" (")[0]}
              </th>
            ))}
            <th className="p-2 text-gray-500 font-medium text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => {
            const times = availability[day] || [];
            const legacy = times.filter((t) => !(TIME_SLOTS as readonly string[]).includes(t));
            return (
              <tr key={day} className="border-t border-gray-100">
                <td className="p-2 font-medium text-gray-900">{DAY_LABELS[day]}</td>
                {TIME_SLOTS.map((slot) => (
                  <td key={slot} className="p-2 text-center">
                    {times.includes(slot) && (
                      <span className="inline-block w-3 h-3 rounded-full bg-primary-600" />
                    )}
                  </td>
                ))}
                <td className="p-2 text-xs text-gray-500">{legacy.join(", ")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
