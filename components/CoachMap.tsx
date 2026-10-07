"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { getCityByName } from "@/constants/dutch-cities";

type MapCoach = { id: string; name: string; city: string };

// Map of search results: one marker per city (sized by coach count) and, for a
// city search, the search radius. Coaches only have a city, not an exact address.
export function CoachMap({
  coaches,
  center,
  radiusKm,
}: {
  coaches: MapCoach[];
  center: { lat: number; lng: number } | null;
  radiusKm: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current, { scrollWheelZoom: false, attributionControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const byCity = new Map<string, MapCoach[]>();
      coaches.forEach((coach) => {
        const list = byCity.get(coach.city) || [];
        list.push(coach);
        byCity.set(coach.city, list);
      });

      const bounds = L.latLngBounds([]);

      if (center && radiusKm) {
        L.circle([center.lat, center.lng], {
          radius: radiusKm * 1000,
          color: "#0369a1",
          weight: 1.5,
          fillColor: "#0369a1",
          fillOpacity: 0.06,
        }).addTo(map);
        // circle.getBounds() needs a map view; compute from the center instead.
        bounds.extend(L.latLng(center.lat, center.lng).toBounds(radiusKm * 2000));
      }

      byCity.forEach((list, cityName) => {
        const city = getCityByName(cityName);
        if (!city) return;
        const marker = L.circleMarker([city.lat, city.lng], {
          radius: Math.min(8 + list.length * 2, 20),
          color: "#ffffff",
          weight: 2,
          fillColor: "#0f172a",
          fillOpacity: 0.9,
        }).addTo(map!);

        const links = list
          .slice(0, 8)
          .map((c) => `<a href="/coach/${c.id}" style="color:#0369a1">${c.name.replace(/</g, "&lt;")}</a>`)
          .join("<br/>");
        const more = list.length > 8 ? `<br/>+${list.length - 8} more` : "";
        marker.bindPopup(
          `<strong>${cityName}</strong> · ${list.length} coach${list.length !== 1 ? "es" : ""}<br/>${links}${more}`
        );
        marker.bindTooltip(String(list.length), { permanent: true, direction: "center", className: "coach-count" });
        bounds.extend([city.lat, city.lng]);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
      } else {
        map.setView([52.2, 5.3], 7);
      }
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [coaches, center?.lat, center?.lng, radiusKm]);

  return (
    <div
      ref={containerRef}
      className="h-72 md:h-80 w-full rounded-xl border border-gray-200 overflow-hidden z-0"
      role="region"
      aria-label="Map of coaches"
    />
  );
}
