"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import { fieldIcon } from "@/components/fieldIcon";
import type { CoachField } from "@/lib/coachField";

// Small map on a coach's profile with a pin at the football field they're shown at.
export function CoachFieldMap({ field }: { field: CoachField }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;
      map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([field.lat, field.lng], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      L.marker([field.lat, field.lng], { icon: fieldIcon(L), keyboard: false }).addTo(map);
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [field.lat, field.lng]);

  return (
    <div
      ref={containerRef}
      className="h-56 md:h-64 w-full rounded-xl border border-gray-200 overflow-hidden z-0"
      role="region"
      aria-label={`Map showing ${field.name}`}
    />
  );
}
