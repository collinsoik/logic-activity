'use client';

import { useRef, useCallback, useMemo, useEffect } from 'react';
import { Stage, Layer } from 'react-konva';
import { useCanvasSize } from '@/hooks/useCanvasSize';
import { useStore } from '@/store';
import GridLayer from './GridLayer';
import GatesLayer from './GatesLayer';
import WireSvgOverlay from '../wires/WireSvgOverlay';
import { evaluateCircuit, hasCycle } from '@/lib/circuit-eval';
import { useActiveInputs } from '@/hooks/useActiveInputs';
import { GATE_DEFINITIONS, getPortPositions } from '@/lib/gate-defs';
import { KonvaEventObject } from 'konva/lib/Node';

export default function CircuitCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useCanvasSize(containerRef);

  const gates = useStore((s) => s.gates);
  const wires = useStore((s) => s.wires);
  const switchValues = useStore((s) => s.switchValues);
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

  const inputs = useActiveInputs();

  // Switch positions at the bottom of the canvas
  const switchPositions = useMemo(() => {
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
  }, [inputs, width, height]);

  // Output node position (where wires attach, beneath the bulb)
  const outputPosition = useMemo(
    () => ({ x: width / 2, y: 110 }),
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
      className="relative w-full h-full overflow-hidden bg-background select-none"
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
      {inputs.map((label) => {
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
                backgroundColor: isOn ? '#22c55e33' : '#ef444433',
                borderColor: isOn ? '#22c55e' : '#ef4444',
                color: isOn ? '#22c55e' : '#ef4444',
              }}
            >
              {label}
            </div>
          </div>
        );
      })}

      {/* Output light bulb at top center */}
      {(() => {
        const outputWire = wires.find((w) => w.toPortId === 'output-in-0');
        const isOn = outputWire ? portValues.get(outputWire.fromPortId) === true : false;
        return (
          <div
            className="absolute flex flex-col items-center gap-1"
            style={{
              left: outputPosition.x - 22,
              top: outputPosition.y - 95,
              pointerEvents: 'auto',
            }}
          >
            {/* Bulb */}
            <div
              className="relative cursor-crosshair transition-all duration-300"
              style={{ width: 44, height: 56 }}
            >
              <svg width={44} height={56} viewBox="0 0 44 56">
                {/* Glow behind bulb (only when on) */}
                {isOn && (
                  <circle cx={22} cy={22} r={22} fill="#22c55e" opacity={0.15} />
                )}
                {/* Bulb glass */}
                <path
                  d={`M 14 34 Q 14 22 10 18 Q 6 12 10 6 Q 14 0 22 0 Q 30 0 34 6 Q 38 12 34 18 Q 30 22 30 34 Z`}
                  fill={isOn ? '#22c55e' : '#1e293b'}
                  stroke={isOn ? '#4ade80' : '#475569'}
                  strokeWidth={1.5}
                  style={{ transition: 'fill 0.3s, stroke 0.3s' }}
                />
                {isOn && (
                  <path
                    d={`M 14 34 Q 14 22 10 18 Q 6 12 10 6 Q 14 0 22 0 Q 30 0 34 6 Q 38 12 34 18 Q 30 22 30 34 Z`}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth={2}
                    filter="url(#bulbGlow)"
                  />
                )}
                {/* Base / screw */}
                <rect x={14} y={34} width={16} height={4} rx={1} fill="#94a3b8" />
                <rect x={15} y={38} width={14} height={3} rx={1} fill="#64748b" />
                <rect x={16} y={41} width={12} height={3} rx={1} fill="#94a3b8" />
                <rect x={17} y={44} width={10} height={2} rx={1} fill="#64748b" />
                {/* Filament lines when off */}
                {!isOn && (
                  <>
                    <line x1={18} y1={28} x2={18} y2={16} stroke="#475569" strokeWidth={1} />
                    <line x1={26} y1={28} x2={26} y2={16} stroke="#475569" strokeWidth={1} />
                    <path d="M 18 16 Q 22 10 26 16" fill="none" stroke="#475569" strokeWidth={1} />
                  </>
                )}
                {/* Glow filter */}
                <defs>
                  <filter id="bulbGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </svg>
            </div>
            <span className="text-[10px] font-mono font-bold" style={{ color: isOn ? '#22c55e' : '#64748b' }}>
              OUTPUT
            </span>
            {/* Connection node beneath the bulb */}
            <div
              className="w-[16px] h-[16px] rounded-full border-2 cursor-crosshair transition-all hover:scale-125"
              style={{
                backgroundColor: isOn ? '#22c55e' : '#64748b',
                borderColor: isOn ? '#4ade80' : '#94a3b8',
                boxShadow: isOn ? '0 0 6px #22c55e' : 'none',
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                handlePortMouseDown('output-in-0', outputPosition.x, outputPosition.y);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                handlePortMouseUp('output-in-0');
              }}
            />
          </div>
        );
      })()}
    </div>
  );
}
