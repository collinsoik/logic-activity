'use client';

import { Line } from 'react-konva';
import { GRID_SIZE, COLORS } from '@/config/constants';

interface GridLayerProps {
  width: number;
  height: number;
}

export default function GridLayer({ width, height }: GridLayerProps) {
  const lines = [];

  // Vertical lines
  for (let x = 0; x <= width; x += GRID_SIZE) {
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={COLORS.gridDot}
        strokeWidth={0.5}
        opacity={0.3}
      />
    );
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += GRID_SIZE) {
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke={COLORS.gridDot}
        strokeWidth={0.5}
        opacity={0.3}
      />
    );
  }

  return <>{lines}</>;
}
