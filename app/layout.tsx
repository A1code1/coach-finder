import type { Metadata } from "next";
import "./globals.css";
import { HeaderNav } from "@/components/HeaderNav";

export const metadata: Metadata = {
  title: "Coach Finder - Find Football Coaches in the Netherlands",
  description: "Discover and connect with experienced football coaches in your area.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="bg-dark-surface border-b border-primary-700 border-opacity-20">
          <nav className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">💪 Coach Finder</h1>
            <HeaderNav />
          </nav>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
        <footer className="bg-dark-surface border-t border-primary-700 border-opacity-20 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-8 text-center text-dark-textSecondary text-sm">
            <p>&copy; 2026 Coach Finder. All rights reserved. | Peak Performance Coaching Network</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
