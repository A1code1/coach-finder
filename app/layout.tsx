import type { Metadata, Viewport } from "next";
import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";
import { HeaderNav } from "@/components/HeaderNav";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const heading = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const body = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coach Finder - Find Football Coaches in the Netherlands",
  description: "Discover and connect with experienced, verified football coaches in your area.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

function LogoMark() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0f172a" />
      <path
        d="M9 20.5 14 11l3 6 3-4 3 7.5"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <ServiceWorkerRegister />
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-heading text-xl font-bold text-primary-900">Coach Finder</span>
            </a>
            <HeaderNav />
          </nav>
        </header>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
            <p>&copy; 2026 Coach Finder. All rights reserved. | Trusted football coaching in the Netherlands.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
