import { StateCreator } from 'zustand';
import { GateType } from '@/lib/types';

export interface UiSlice {
  selectedGateId: string | null;
  selectedWireId: string | null;
  draggingWireFrom: string | null;
  draggingWireTo: { x: number; y: number } | null;
  draggedGateType: GateType | null;
  selectGate: (id: string | null) => void;
  selectWire: (id: string | null) => void;
  startWireDrag: (portId: string) => void;
  updateWireDrag: (x: number, y: number) => void;
  endWireDrag: () => void;
  setDraggedGateType: (type: GateType | null) => void;
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set) => ({
  selectedGateId: null,
  selectedWireId: null,
  draggingWireFrom: null,
  draggingWireTo: null,
  draggedGateType: null,

  selectGate: (id) => {
    set({ selectedGateId: id, selectedWireId: null });
  },

  selectWire: (id) => {
    set({ selectedWireId: id, selectedGateId: null });
  },

  startWireDrag: (portId) => {
    set({ draggingWireFrom: portId, draggingWireTo: null });
  },

  updateWireDrag: (x, y) => {
    set({ draggingWireTo: { x, y } });
  },

  endWireDrag: () => {
    set({ draggingWireFrom: null, draggingWireTo: null });
  },

  setDraggedGateType: (type) => {
    set({ draggedGateType: type });
  },
});
