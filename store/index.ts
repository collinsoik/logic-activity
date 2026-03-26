import { create } from 'zustand';
import { CircuitSlice, createCircuitSlice } from './slices/circuitSlice';
import {
  SimulationSlice,
  createSimulationSlice,
} from './slices/simulationSlice';
import { LevelSlice, createLevelSlice } from './slices/levelSlice';
import { UiSlice, createUiSlice } from './slices/uiSlice';

export type AppStore = CircuitSlice & SimulationSlice & LevelSlice & UiSlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createCircuitSlice(...a),
  ...createSimulationSlice(...a),
  ...createLevelSlice(...a),
  ...createUiSlice(...a),
}));
