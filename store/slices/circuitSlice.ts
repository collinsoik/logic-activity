import { StateCreator } from 'zustand';
import { Gate, Wire, GateType } from '@/lib/types';
import { snapToGrid, enforceMinDistance } from '@/lib/snap';

export interface CircuitSlice {
  gates: Gate[];
  wires: Wire[];
  addGate: (type: GateType, x: number, y: number) => string;
  moveGate: (id: string, x: number, y: number) => void;
  removeGate: (id: string) => void;
  addWire: (fromPortId: string, toPortId: string) => string;
  removeWire: (id: string) => void;
  clearCircuit: () => void;
  loadCircuit: (gates: Gate[], wires: Wire[]) => void;
}

export const createCircuitSlice: StateCreator<CircuitSlice, [], [], CircuitSlice> = (
  set,
  get
) => ({
  gates: [],
  wires: [],

  addGate: (type, x, y) => {
    const id = `gate-${crypto.randomUUID().slice(0, 8)}`;
    const pos = enforceMinDistance(x, y, get().gates);
    const gate: Gate = { id, type, x: pos.x, y: pos.y };
    set((state) => ({ gates: [...state.gates, gate] }));
    return id;
  },

  moveGate: (id, x, y) => {
    const pos = enforceMinDistance(x, y, get().gates, id);
    set((state) => ({
      gates: state.gates.map((g) =>
        g.id === id ? { ...g, x: pos.x, y: pos.y } : g
      ),
    }));
  },

  removeGate: (id) => {
    set((state) => ({
      gates: state.gates.filter((g) => g.id !== id),
      wires: state.wires.filter(
        (w) =>
          !w.fromPortId.startsWith(id + '-') &&
          !w.toPortId.startsWith(id + '-')
      ),
    }));
  },

  addWire: (fromPortId, toPortId) => {
    const id = `wire-${crypto.randomUUID().slice(0, 8)}`;
    const wire: Wire = { id, fromPortId, toPortId };
    set((state) => ({ wires: [...state.wires, wire] }));
    return id;
  },

  removeWire: (id) => {
    set((state) => ({
      wires: state.wires.filter((w) => w.id !== id),
    }));
  },

  clearCircuit: () => {
    set({ gates: [], wires: [] });
  },

  loadCircuit: (gates, wires) => {
    set({ gates, wires });
  },
});
