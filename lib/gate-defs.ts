import { GateType } from './types';
import { GATE_WIDTH, GATE_HEIGHT } from '@/config/constants';

export interface GateDefinition {
  type: GateType;
  label: string;
  inputCount: number;
  outputCount: number;
  description: string;
}

export const GATE_DEFINITIONS: Record<GateType, GateDefinition> = {
  AND: {
    type: 'AND',
    label: 'AND',
    inputCount: 2,
    outputCount: 1,
    description: 'Output is 1 only when both inputs are 1',
  },
  OR: {
    type: 'OR',
    label: 'OR',
    inputCount: 2,
    outputCount: 1,
    description: 'Output is 1 when at least one input is 1',
  },
  NOT: {
    type: 'NOT',
    label: 'NOT',
    inputCount: 1,
    outputCount: 1,
    description: 'Output is the inverse of the input',
  },
  XOR: {
    type: 'XOR',
    label: 'XOR',
    inputCount: 2,
    outputCount: 1,
    description: 'Output is 1 when inputs differ',
  },
};

// Ports oriented for bottom-to-top flow:
// Inputs on the bottom edge, output on the top edge
export function getPortPositions(
  gateId: string,
  gateType: GateType,
  gateX: number,
  gateY: number
) {
  const def = GATE_DEFINITIONS[gateType];
  const ports: { id: string; nodeId: string; type: 'input' | 'output'; index: number; x: number; y: number }[] = [];

  // Input ports along the bottom edge
  for (let i = 0; i < def.inputCount; i++) {
    const xOffset =
      def.inputCount === 1
        ? GATE_WIDTH * 0.5
        : GATE_WIDTH * (0.3 + i * 0.4);
    ports.push({
      id: `${gateId}-in-${i}`,
      nodeId: gateId,
      type: 'input',
      index: i,
      x: gateX + xOffset,
      y: gateY + GATE_HEIGHT,
    });
  }

  // Output port at the top center
  ports.push({
    id: `${gateId}-out-0`,
    nodeId: gateId,
    type: 'output',
    index: 0,
    x: gateX + GATE_WIDTH * 0.5,
    y: gateY,
  });

  return ports;
}
