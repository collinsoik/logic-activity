'use client';

import { useRef, useCallback, useMemo, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useCanvasSize } from '@/hooks/useCanvasSize';
import { useStore } from '@/store';
import GridLayer from './GridLayer';
import GatesLayer from './GatesLayer';
import WireSvgOverlay from '../wires/WireSvgOverlay';
import { evaluateCircuit } from '@/lib/circuit-eval';
import { LEVELS } from '@/lib/levels';
import { hasCycle } from '@/lib/circuit-eval';
import { GATE_DEFINITIONS, getPortPositions } from '@/lib/gate-defs';
import { KonvaEventObject } from 'konva/lib/Node';

export default function CircuitCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useCanvasSize(containerRef);

  const gates = useStore((s) => s.gates);
  const wires = useStore((s) => s.wires);
  const switchValues = useStore((s) => s.switchValues);
  const currentLevelId = useStore((s) => s.currentLevelId);
  const addGate = useStore((s) => s.addGate);
  const addWire = useStore((s) => s.addWire);
  const selectGate = useStore((s) => s.selectGate);
  const selectWire = useStore((s) => s.selectWire);
  const removeGate = useStore((s) => s.removeGate);
  const removeWire = useStore((s) => s.removeWire);
  const selectedGateId = useStore((s) => s.selectedGateId);
  const selectedWireId = useStore((s) => s.selectedWireId);

  const draggingWireFrom = useStore((s) => s.draggingWireFrom);
  const startWireDrag = useStore((s) => s.startWireDrag);
  const updateWireDrag = useStore((s) => s.updateWireDrag);
  const endWireDrag = useStore((s) => s.endWireDrag);

  const level = LEVELS.find((l) => l.id === currentLevelId)!;

  // Switch positions at the bottom of the canvas
  const switchPositions = useMemo(() => {
    const inputs = level.inputs;
    const spacing = width / (inputs.length + 1);
    const y = height - 30;
    const positions: Record<string, { x: number; y: number }> = {};
    inputs.forEach((label, i) => {
      positions[`switch-${label}-out-0`] = {
        x: spacing * (i + 1),
        y,
      };
    });
    return positions;
  }, [level.inputs, width, height]);

  // Output position at the right side of the canvas
  const outputPosition = useMemo(
    () => ({ x: width - 40, y: height / 2 }),
    [width, height]
  );

  // Evaluate circuit
  const { portValues } = useMemo(
    () => evaluateCircuit({ gates, wires, switchValues }),
    [gates, wires, switchValues]
  );

  // Handle drop from palette
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const gateType = e.dataTransfer.getData('gateType');
      if (!gateType) return;

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addGate(gateType as 'AND' | 'OR' | 'NOT' | 'XOR', x, y);
    },
    [addGate]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Port interactions for wiring
  const handlePortMouseDown = useCallback(
    (portId: string, x: number, y: number) => {
      // Only allow dragging from output ports or switch outputs
      if (portId.includes('-out-') || portId.startsWith('switch-')) {
        startWireDrag(portId);
      } else {
        // Dragging from an input port — find existing wire connected to this input and start from its source
        const existingWire = wires.find((w) => w.toPortId === portId);
        if (existingWire) {
          removeWire(existingWire.id);
          startWireDrag(existingWire.fromPortId);
        }
      }
    },
    [startWireDrag, wires, removeWire]
  );

  const handlePortMouseUp = useCallback(
    (portId: string) => {
      if (!draggingWireFrom) return;

      // Validate connection
      const fromId = draggingWireFrom;
      const toId = portId;

      // Must connect output → input
      const isFromOutput =
        fromId.includes('-out-') || fromId.startsWith('switch-');
      const isToInput = toId.includes('-in-');

      if (!isFromOutput || !isToInput) {
        endWireDrag();
        return;
      }

      // Can't connect to same gate
      const fromGateId = fromId.split('-out-')[0];
      const toGateId = toId.split('-in-')[0];
      if (
        fromGateId === toGateId &&
        !fromId.startsWith('switch-') &&
        toId !== 'output-in-0'
      ) {
        endWireDrag();
        return;
      }

      // Check if input already has a wire
      const existingWire = wires.find((w) => w.toPortId === toId);
      if (existingWire) {
        removeWire(existingWire.id);
      }

      // Check for cycles
      if (hasCycle(gates, wires.filter((w) => w.id !== existingWire?.id), fromId, toId)) {
        endWireDrag();
        return;
      }

      addWire(fromId, toId);
      endWireDrag();
    },
    [draggingWireFrom, gates, wires, addWire, removeWire, endWireDrag]
  );

  // Mouse move for wire dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingWireFrom) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      updateWireDrag(e.clientX - rect.left, e.clientY - rect.top);
    },
    [draggingWireFrom, updateWireDrag]
  );

  const handleMouseUp = useCallback(() => {
    if (draggingWireFrom) {
      endWireDrag();
    }
  }, [draggingWireFrom, endWireDrag]);

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        selectGate(null);
        selectWire(null);
      }
    },
    [selectGate, selectWire]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedGateId) {
          removeGate(selectedGateId);
          selectGate(null);
        } else if (selectedWireId) {
          removeWire(selectedWireId);
          selectWire(null);
        }
      }
      if (e.key === 'Escape') {
        endWireDrag();
        selectGate(null);
        selectWire(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedGateId,
    selectedWireId,
    removeGate,
    removeWire,
    selectGate,
    selectWire,
    endWireDrag,
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-background"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Stage
        width={width}
        height={height}
        onClick={handleStageClick}
      >
        <Layer>
          <GridLayer width={width} height={height} />
        </Layer>
        <GatesLayer
          portValues={portValues}
          onPortMouseDown={handlePortMouseDown}
          onPortMouseUp={handlePortMouseUp}
        />
      </Stage>

      <WireSvgOverlay
        width={width}
        height={height}
        portValues={portValues}
        switchPositions={switchPositions}
        outputPosition={outputPosition}
      />

      {/* Switch connection points rendered on canvas */}
      {level.inputs.map((label) => {
        const pos = switchPositions[`switch-${label}-out-0`];
        if (!pos) return null;
        const isOn = switchValues[label];
        return (
          <div
            key={label}
            className="absolute flex flex-col items-center"
            style={{
              left: pos.x - 15,
              top: pos.y - 15,
              pointerEvents: 'auto',
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;
              handlePortMouseDown(
                `switch-${label}-out-0`,
                pos.x,
                pos.y
              );
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              handlePortMouseUp(`switch-${label}-out-0`);
            }}
          >
            <div
              className="w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-crosshair transition-all"
              style={{
                backgroundColor: isOn ? '#22c55e33' : '#37415133',
                borderColor: isOn ? '#22c55e' : '#64748b',
                color: isOn ? '#22c55e' : '#94a3b8',
              }}
            >
              {label}
            </div>
          </div>
        );
      })}

      {/* Output connection point */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: outputPosition.x - 15,
          top: outputPosition.y - 15,
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handlePortMouseDown('output-in-0', outputPosition.x, outputPosition.y);
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          handlePortMouseUp('output-in-0');
        }}
      >
        <div
          className="w-[30px] h-[30px] rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-crosshair transition-all"
          style={{
            backgroundColor:
              portValues.get(
                wires.find((w) => w.toPortId === 'output-in-0')?.fromPortId ?? ''
              ) === true
                ? '#22c55e33'
                : '#37415133',
            borderColor:
              portValues.get(
                wires.find((w) => w.toPortId === 'output-in-0')?.fromPortId ?? ''
              ) === true
                ? '#22c55e'
                : '#64748b',
            color: '#94a3b8',
          }}
        >
          Q
        </div>
      </div>
    </div>
  );
}
