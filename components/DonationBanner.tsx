"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDonation, getDonationTotal } from "@/lib/donations";

export function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}

function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <path strokeLinecap="round" d="M12 11v6" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Home page banner showing how much the Kids Fund has donated so far.
export function DonationBanner() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    getDonationTotal().then(setTotal);
  }, []);

  if (total == null) return null;

  return (
    <div className="bg-primary-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <HeartIcon className="w-6 h-6 text-accent-400 shrink-0" />
        <p className="text-sm sm:text-base flex-1">
          <span className="font-bold text-lg sm:text-xl mr-1">{formatDonation(total)}</span>
          donated so far to help kids who can&apos;t afford a coach.{" "}
          <span className="text-primary-100/80">Every session booked here adds €1.</span>
        </p>
        <Link
          href="/donations"
          aria-label="How our donations work"
          title="How our donations work"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm text-primary-100 hover:text-white"
        >
          <InfoIcon className="w-5 h-5" />
          <span className="hidden sm:inline">How it works</span>
        </Link>
      </div>
    </div>
  );
}
