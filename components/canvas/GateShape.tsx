'use client';

import { Group, Rect, Text, Circle, Shape } from 'react-konva';
import { Gate, Port } from '@/lib/types';
import { GATE_WIDTH, GATE_HEIGHT, PORT_RADIUS, COLORS } from '@/config/constants';
import { GATE_DEFINITIONS, getPortPositions } from '@/lib/gate-defs';
import { useStore } from '@/store';
import { snapToGrid } from '@/lib/snap';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';

interface GateShapeProps {
  gate: Gate;
  portValues: Map<string, boolean>;
  onPortMouseDown: (portId: string, x: number, y: number) => void;
  onPortMouseUp: (portId: string) => void;
}

// Gates drawn facing upward: inputs at bottom, output at top
function GateBody({ gate }: { gate: Gate }) {
  const { type } = gate;

  return (
    <Shape
      sceneFunc={(context: Konva.Context, shape: Konva.Shape) => {
        const w = GATE_WIDTH;
        const h = GATE_HEIGHT;
        context.beginPath();

        if (type === 'AND') {
          // Flat bottom, curved top
          context.moveTo(0, h);
          context.lineTo(0, h * 0.5);
          context.arc(w / 2, h * 0.5, w / 2, Math.PI, 0, false);
          context.lineTo(w, h);
          context.closePath();
        } else if (type === 'OR') {
          // Curved bottom (concave), pointed top
          context.moveTo(0, h);
          context.quadraticCurveTo(0, h * 0.4, w / 2, 0);
          context.quadraticCurveTo(w, h * 0.4, w, h);
          context.quadraticCurveTo(w / 2, h * 0.8, 0, h);
        } else if (type === 'NOT') {
          // Triangle pointing up with bubble at top
          context.moveTo(0, h);
          context.lineTo(w / 2, h * 0.25);
          context.lineTo(w, h);
          context.closePath();
          // Bubble at top
          context.moveTo(w / 2 + 5, h * 0.2);
          context.arc(w / 2, h * 0.15, 5, 0, Math.PI * 2, false);
        } else if (type === 'XOR') {
          // Extra curve at bottom
          context.moveTo(0, h + 6);
          context.quadraticCurveTo(w / 2, h * 0.85, w, h + 6);
          // Main body
          context.moveTo(0, h);
          context.quadraticCurveTo(0, h * 0.4, w / 2, 0);
          context.quadraticCurveTo(w, h * 0.4, w, h);
          context.quadraticCurveTo(w / 2, h * 0.8, 0, h);
        }

        context.fillStrokeShape(shape);
      }}
      fill={COLORS.gateBody}
      stroke={COLORS.gateStroke}
      strokeWidth={2}
    />
  );
}

export default function GateShape({
  gate,
  portValues,
  onPortMouseDown,
  onPortMouseUp,
}: GateShapeProps) {
  const def = GATE_DEFINITIONS[gate.type];
  const moveGate = useStore((s) => s.moveGate);
  const selectGate = useStore((s) => s.selectGate);
  const selectedGateId = useStore((s) => s.selectedGateId);
  const isSelected = selectedGateId === gate.id;

  const ports = getPortPositions(gate.id, gate.type, 0, 0);

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const pos = snapToGrid(e.target.x(), e.target.y());
    moveGate(gate.id, pos.x, pos.y);
    e.target.position({ x: pos.x, y: pos.y });
  };

  return (
    <Group
      x={gate.x}
      y={gate.y}
      draggable
      onDragEnd={handleDragEnd}
      onClick={() => selectGate(gate.id)}
      onTap={() => selectGate(gate.id)}
    >
      {isSelected && (
        <Rect
          x={-4}
          y={-4}
          width={GATE_WIDTH + 8}
          height={GATE_HEIGHT + 8}
          stroke={COLORS.selectedStroke}
          strokeWidth={2}
          cornerRadius={4}
          dash={[4, 4]}
        />
      )}

      <GateBody gate={gate} />

      <Text
        x={0}
        y={GATE_HEIGHT * 0.45}
        width={GATE_WIDTH}
        text={def.label}
        fontSize={12}
        fontStyle="bold"
        fill={COLORS.gateText}
        align="center"
      />

      {ports.map((port) => {
        const val = portValues.get(
          `${gate.id}-${port.type === 'input' ? 'in' : 'out'}-${port.index}`
        );
        const isActive = val === true;

        return (
          <Circle
            key={port.id}
            x={port.x}
            y={port.y}
            radius={PORT_RADIUS}
            fill={isActive ? COLORS.wireOn : COLORS.portFill}
            stroke={COLORS.portStroke}
            strokeWidth={1.5}
            onMouseDown={(e) => {
              e.cancelBubble = true;
              const stage = e.target.getStage();
              const pos = stage?.getPointerPosition();
              if (pos) {
                onPortMouseDown(
                  `${gate.id}-${port.type === 'input' ? 'in' : 'out'}-${port.index}`,
                  gate.x + port.x,
                  gate.y + port.y
                );
              }
            }}
            onMouseUp={(e) => {
              e.cancelBubble = true;
              onPortMouseUp(
                `${gate.id}-${port.type === 'input' ? 'in' : 'out'}-${port.index}`
              );
            }}
            onMouseEnter={(e) => {
              const target = e.target as Konva.Circle;
              target.to({ scaleX: 1.3, scaleY: 1.3, duration: 0.1 });
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = 'crosshair';
            }}
            onMouseLeave={(e) => {
              const target = e.target as Konva.Circle;
              target.to({ scaleX: 1, scaleY: 1, duration: 0.1 });
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = 'default';
            }}
          />
        );
      })}
    </Group>
  );
}
