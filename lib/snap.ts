import { Gate } from './types';
import { GRID_SIZE, MIN_GATE_DISTANCE } from '@/config/constants';

export function snapToGrid(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.round(x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(y / GRID_SIZE) * GRID_SIZE,
  };
}

export function enforceMinDistance(
  newX: number,
  newY: number,
  existingGates: Gate[],
  excludeId?: string
): { x: number; y: number } {
  let { x, y } = snapToGrid(newX, newY);

  for (const gate of existingGates) {
    if (gate.id === excludeId) continue;

    const dx = x - gate.x;
    const dy = y - gate.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < MIN_GATE_DISTANCE && dist > 0) {
      const angle = Math.atan2(dy, dx);
      x = gate.x + Math.cos(angle) * MIN_GATE_DISTANCE;
      y = gate.y + Math.sin(angle) * MIN_GATE_DISTANCE;
      const snapped = snapToGrid(x, y);
      x = snapped.x;
      y = snapped.y;
    }
  }

  return { x, y };
}
