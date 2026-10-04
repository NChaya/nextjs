type LogoProps = {
  className?: string;
};

export function LogoMark({ className = "h-10 w-10" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="ShareWise logo mark"
    >
      <rect width="48" height="48" rx="12" fill="#4f46e5" />
      <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
        <line x1="17" y1="25" x2="31" y2="17" />
        <line x1="17" y1="25" x2="31" y2="33" />
      </g>
      <circle cx="16" cy="25" r="5.5" fill="#ffffff" />
      <circle cx="32" cy="16" r="5" fill="#fbbf24" />
      <circle cx="32" cy="34" r="5" fill="#34d399" />
    </svg>
  );
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark className="h-14 w-14 sm:h-20 sm:w-20" />
      <span className="text-5xl font-semibold tracking-tight sm:text-7xl">
        <span className="text-indigo-600">Share</span>
        <span className="text-zinc-800">Wise</span>
      </span>
    </div>
  );
}
