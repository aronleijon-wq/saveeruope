import { cn } from "@/lib/utils";
import { starPoints } from "@/lib/stars";

const stars = Array.from({ length: 12 }, (_, i) => {
  const angle = (i * Math.PI) / 6;
  return starPoints(50 + 44 * Math.sin(angle), 50 - 44 * Math.cos(angle), 2.6);
});

// The twelve EU stars on their own, for slowly rotating decoration.
export const StarRing = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" aria-hidden="true" className={cn("block", className)}>
    {stars.map((points, i) => (
      <polygon key={i} points={points} fill="currentColor" />
    ))}
  </svg>
);
