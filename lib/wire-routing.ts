export function computeWirePath(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): string {
  // Vertical flow: wires go from bottom (outputs/switches) to top (inputs/output bulb)
  const dy = Math.abs(toY - fromY);
  const offset = Math.max(50, dy * 0.5);

  const cp1x = fromX;
  const cp1y = fromY - offset;
  const cp2x = toX;
  const cp2y = toY + offset;

  return `M ${fromX} ${fromY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toX} ${toY}`;
}
