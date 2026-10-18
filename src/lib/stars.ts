// Points for a five-pointed star polygon centred on (cx, cy) with outer radius r.
export const starPoints = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : r * 0.382;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  }).join(" ");
