import { useId } from "react";

const STRIPES = [0, 45, 90, 135, 180, 225, 270, 315];

export function LogoMark({ size = 38, className }: { size?: number; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ring = `lr${uid}`;
  const face = `lf${uid}`;
  const glow = `lg${uid}`;
  return (
    <svg className={`logo-mark ${className ?? ""}`} width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id={ring} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3d9a" />
          <stop offset=".5" stopColor="#8b5cff" />
          <stop offset="1" stopColor="#22e1ff" />
        </linearGradient>
        <radialGradient id={face} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#1d1240" />
          <stop offset="1" stopColor="#07070f" />
        </radialGradient>
        <filter id={glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="24" cy="24" r="22.5" fill={`url(#${ring})`} />
      {STRIPES.map((angle) => (
        <rect key={angle} x="21" y="1.6" width="6" height="7.4" rx="1.4" fill="#fff" opacity=".92" transform={`rotate(${angle} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="15.6" fill={`url(#${face})`} />
      <circle cx="24" cy="24" r="13.4" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth=".9" strokeDasharray="2.2 2.4" />
      <path
        d="M17.6 31.4V16.6h3.3l6.9 9.4v-9.4h3.3v14.8h-3.2l-7-9.6v9.6z"
        fill={`url(#${ring})`}
        filter={`url(#${glow})`}
      />
      <circle cx="17" cy="13.4" r="1.1" fill="#fff" opacity=".9" />
    </svg>
  );
}

export function Logo({ size = 38 }: { size?: number }) {
  return (
    <>
      <LogoMark size={size} />
      <span className="logo-lockup">
        <span className="logo-word">
          <span className="logo-neon" data-text="NEON">NEON</span>
          <span className="logo-gift" data-text="GIFT">GIFT</span>
        </span>
        <span className="logo-tag">Physical cards</span>
      </span>
    </>
  );
}
