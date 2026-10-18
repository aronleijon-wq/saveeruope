import { cn } from "@/lib/utils";
import { starPoints } from "@/lib/stars";

// Inline SVG flags. Emoji flags render as letters ("SE", "FR") on Windows, so we draw them ourselves.

export type FlagCode = "eu" | "se" | "fr" | "de" | "it" | "ch" | "at" | "nl" | "dk" | "be" | "gb" | "es" | "pl";

const vertical = (a: string, b: string, c: string) => (
  <>
    <rect width="1" height="2" fill={a} />
    <rect x="1" width="1" height="2" fill={b} />
    <rect x="2" width="1" height="2" fill={c} />
  </>
);

const horizontal = (a: string, b: string, c: string) => (
  <>
    <rect width="3" height="0.667" fill={a} />
    <rect y="0.667" width="3" height="0.667" fill={b} />
    <rect y="1.333" width="3" height="0.667" fill={c} />
  </>
);

const euStars = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * Math.PI) / 6;
  return starPoints(1.5 + 0.667 * Math.sin(angle), 1 - 0.667 * Math.cos(angle), 0.111);
});

const flags: Record<FlagCode, { viewBox: string; label: string; body: JSX.Element }> = {
  eu: {
    viewBox: "0 0 3 2",
    label: "European Union",
    body: (
      <>
        <rect width="3" height="2" fill="#003399" />
        {euStars.map((points, i) => (
          <polygon key={i} points={points} fill="#FFCC00" />
        ))}
      </>
    ),
  },
  se: {
    viewBox: "0 0 16 10",
    label: "Sweden",
    body: (
      <>
        <rect width="16" height="10" fill="#006AA7" />
        <rect x="5" width="2" height="10" fill="#FECC00" />
        <rect y="4" width="16" height="2" fill="#FECC00" />
      </>
    ),
  },
  dk: {
    viewBox: "0 0 37 28",
    label: "Denmark",
    body: (
      <>
        <rect width="37" height="28" fill="#C8102E" />
        <rect x="12" width="4" height="28" fill="#fff" />
        <rect y="12" width="37" height="4" fill="#fff" />
      </>
    ),
  },
  fr: { viewBox: "0 0 3 2", label: "France", body: vertical("#0055A4", "#fff", "#EF4135") },
  it: { viewBox: "0 0 3 2", label: "Italy", body: vertical("#009246", "#fff", "#CE2B37") },
  be: { viewBox: "0 0 3 2", label: "Belgium", body: vertical("#000", "#FDDA24", "#EF3340") },
  de: { viewBox: "0 0 3 2", label: "Germany", body: horizontal("#000", "#DD0000", "#FFCE00") },
  at: { viewBox: "0 0 3 2", label: "Austria", body: horizontal("#ED2939", "#fff", "#ED2939") },
  nl: { viewBox: "0 0 3 2", label: "Netherlands", body: horizontal("#AE1C28", "#fff", "#21468B") },
  pl: {
    viewBox: "0 0 8 5",
    label: "Poland",
    body: (
      <>
        <rect width="8" height="2.5" fill="#fff" />
        <rect y="2.5" width="8" height="2.5" fill="#DC143C" />
      </>
    ),
  },
  es: {
    viewBox: "0 0 3 2",
    label: "Spain",
    body: (
      <>
        <rect width="3" height="2" fill="#AA151B" />
        <rect y="0.5" width="3" height="1" fill="#F1BF00" />
      </>
    ),
  },
  ch: {
    viewBox: "0 0 32 32",
    label: "Switzerland",
    body: (
      <>
        <rect width="32" height="32" fill="#DA291C" />
        <rect x="13" y="6" width="6" height="20" fill="#fff" />
        <rect x="6" y="13" width="20" height="6" fill="#fff" />
      </>
    ),
  },
  gb: {
    viewBox: "0 0 60 30",
    label: "United Kingdom",
    body: (
      <>
        <clipPath id="flag-gb-t">
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#flag-gb-t)" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </>
    ),
  },
};

interface Props {
  code: FlagCode;
  className?: string;
}

export const Flag = ({ code, className }: Props) => {
  const flag = flags[code];
  return (
    <svg
      viewBox={flag.viewBox}
      role="img"
      aria-label={flag.label}
      preserveAspectRatio="xMidYMid slice"
      className={cn("block overflow-hidden", className)}
    >
      {flag.body}
    </svg>
  );
};
