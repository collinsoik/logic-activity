export function computeWirePath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): string {
  const dx = Math.abs(toX - fromX);
  const offset = Math.max(50, dx * 0.5);

  const cp1x = fromX + offset;
  const cp1y = fromY;
  const cp2x = toX - offset;
  const cp2y = toY;

  return `M ${fromX} ${fromY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toX} ${toY}`;
}
