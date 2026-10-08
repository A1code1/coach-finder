"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { getCoachField, type CoachField } from "@/lib/coachField";
import { fieldIcon } from "@/components/fieldIcon";

type MapCoach = { id: string; name: string; city: string; training_locations?: string[] | null };

// Map of search results: each coach is pinned at a football field in their city
// (coaches who share a field share a pin) and, for a city search, the search radius.
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

      const byField = new Map<string, { field: CoachField; list: MapCoach[] }>();
      coaches.forEach((coach) => {
        const field = getCoachField(coach);
        if (!field) return;
        const key = `${field.lat},${field.lng}`;
        const entry = byField.get(key) || { field, list: [] };
        entry.list.push(coach);
        byField.set(key, entry);
      });

      const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;");

      byField.forEach(({ field, list }) => {
        const marker = L.marker([field.lat, field.lng], { icon: fieldIcon(L, list.length) }).addTo(map!);
        const links = list
          .slice(0, 8)
          .map((c) => `<a href="/coach/${c.id}" style="color:#0369a1">${escape(c.name)}</a>`)
          .join("<br/>");
        const more = list.length > 8 ? `<br/>+${list.length - 8} more` : "";
        const place = field.name === field.city ? escape(field.city) : `${escape(field.name)}, ${escape(field.city)}`;
        marker.bindPopup(`<strong>${place}</strong><br/>${links}${more}`);
        bounds.extend([field.lat, field.lng]);
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
