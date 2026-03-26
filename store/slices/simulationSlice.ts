import { StateCreator } from 'zustand';
import { SimulationRow } from '@/lib/types';

export interface SimulationSlice {
  switchValues: { A: boolean; B: boolean; C: boolean };
  isRunning: boolean;
  currentRunRow: number | null;
  results: SimulationRow[];
  toggleSwitch: (key: 'A' | 'B' | 'C') => void;
  setSwitchValues: (values: { A: boolean; B: boolean; C: boolean }) => void;
  setIsRunning: (running: boolean) => void;
  setCurrentRunRow: (row: number | null) => void;
  setResults: (results: SimulationRow[]) => void;
  resetResults: () => void;
}

export const createSimulationSlice: StateCreator<
  SimulationSlice,
  [],
  [],
  SimulationSlice
> = (set) => ({
  switchValues: { A: false, B: false, C: false },
  isRunning: false,
  currentRunRow: null,
  results: [],

  toggleSwitch: (key) => {
    set((state) => ({
      switchValues: {
        ...state.switchValues,
        [key]: !state.switchValues[key],
      },
    }));
  },

  setSwitchValues: (values) => {
    set({ switchValues: values });
  },

  setIsRunning: (running) => {
    set({ isRunning: running });
  },

  setCurrentRunRow: (row) => {
    set({ currentRunRow: row });
  },

  setResults: (results) => {
    set({ results });
  },

  resetResults: () => {
    set({ results: [], currentRunRow: null });
  },
});
