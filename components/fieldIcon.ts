import type * as Leaflet from "leaflet";

// A map pin drawn as a small football pitch, with a badge when several coaches
// share the field.
export function fieldIcon(L: typeof Leaflet, count = 1) {
  const badge =
    count > 1
      ? `<span style="position:absolute;top:-6px;right:-8px;background:#0f172a;color:#fff;border:2px solid #fff;border-radius:9999px;font:700 11px/1 system-ui,sans-serif;padding:3px 5px">${count}</span>`
      : "";
  return L.divIcon({
    className: "field-pin",
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
    html: `<div style="position:relative;width:34px;height:44px">
      <svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true">
        <path d="M17 43c0 0 15-15.2 15-26A15 15 0 0 0 2 17c0 10.8 15 26 15 26z" fill="#15803d" stroke="#fff" stroke-width="2"/>
        <rect x="8.5" y="9" width="17" height="16" rx="1.5" fill="#22c55e" stroke="#fff" stroke-width="1.4"/>
        <line x1="8.5" y1="17" x2="25.5" y2="17" stroke="#fff" stroke-width="1.2"/>
        <circle cx="17" cy="17" r="3" fill="none" stroke="#fff" stroke-width="1.2"/>
        <rect x="13" y="9" width="8" height="3" fill="none" stroke="#fff" stroke-width="1.1"/>
        <rect x="13" y="22" width="8" height="3" fill="none" stroke="#fff" stroke-width="1.1"/>
      </svg>${badge}
    </div>`,
  });
}
