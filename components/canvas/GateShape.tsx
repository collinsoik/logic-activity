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

function GateBody({ gate }: { gate: Gate }) {
  const { type } = gate;

  return (
    <Shape
      sceneFunc={(context: Konva.Context, shape: Konva.Shape) => {
        const w = GATE_WIDTH;
        const h = GATE_HEIGHT;
        context.beginPath();

        if (type === 'AND') {
          context.moveTo(0, 0);
          context.lineTo(w * 0.5, 0);
          context.arc(w * 0.5, h / 2, h / 2, -Math.PI / 2, Math.PI / 2, false);
          context.lineTo(0, h);
          context.closePath();
        } else if (type === 'OR') {
          context.moveTo(0, 0);
          context.quadraticCurveTo(w * 0.6, 0, w, h / 2);
          context.quadraticCurveTo(w * 0.6, h, 0, h);
          context.quadraticCurveTo(w * 0.2, h / 2, 0, 0);
        } else if (type === 'NOT') {
          context.moveTo(0, 0);
          context.lineTo(w * 0.75, h / 2);
          context.lineTo(0, h);
          context.closePath();
          // Bubble
          context.moveTo(w * 0.75 + 10, h / 2);
          context.arc(w * 0.75 + 5, h / 2, 5, 0, Math.PI * 2, false);
        } else if (type === 'XOR') {
          // Extra curve
          context.moveTo(-6, 0);
          context.quadraticCurveTo(w * 0.15, h / 2, -6, h);
          // Main body
          context.moveTo(0, 0);
          context.quadraticCurveTo(w * 0.6, 0, w, h / 2);
          context.quadraticCurveTo(w * 0.6, h, 0, h);
          context.quadraticCurveTo(w * 0.2, h / 2, 0, 0);
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
        y={GATE_HEIGHT / 2 - 6}
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
