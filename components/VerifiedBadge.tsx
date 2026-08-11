export function VerifiedBadge({ className = "" }: { className?: string }) {
  return (
    <span
      title="Verified — reviewed and approved by the Coach Finder team"
      aria-label="Verified coach"
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
    >
      <svg className="w-4 h-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 1.5l2.16 1.4 2.55-.32 1.09 2.35 2.35 1.1-.32 2.55L19.23 10l-1.4 2.16.32 2.55-2.35 1.09-1.1 2.35-2.55-.32L10 19.23l-2.16-1.4-2.55.32-1.09-2.35-2.35-1.1.32-2.55L.77 10l1.4-2.16-.32-2.55 2.35-1.09 1.1-2.35 2.55.32L10 1.5zm3.03 6.53a.75.75 0 0 0-1.06-1.06L9 9.94 7.53 8.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}
