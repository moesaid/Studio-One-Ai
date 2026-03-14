export function StudioOneLogo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sLogoG" x1="8" y1="8" x2="56" y2="56">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      {/* Outer lens barrel */}
      <circle cx="32" cy="32" r="28" stroke="url(#sLogoG)" strokeWidth="2" />
      {/* Inner lens ring */}
      <circle cx="32" cy="32" r="19" stroke="url(#sLogoG)" strokeWidth="1.5" opacity="0.4" />
      {/* Aperture accent arcs */}
      <path d="M32 13C32 13 44 18 44 32" stroke="url(#sLogoG)" strokeWidth="1" strokeLinecap="round" opacity="0.25" />
      <path d="M51 32C51 32 46 44 32 44" stroke="url(#sLogoG)" strokeWidth="1" strokeLinecap="round" opacity="0.25" />
      <path d="M32 51C32 51 20 46 20 32" stroke="url(#sLogoG)" strokeWidth="1" strokeLinecap="round" opacity="0.25" />
      {/* Bold "1" in center */}
      <text x="32" y="40" textAnchor="middle" fill="url(#sLogoG)" fontSize="22" fontWeight="800" fontFamily="system-ui, sans-serif">1</text>
    </svg>
  );
}
