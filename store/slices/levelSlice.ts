import { StateCreator } from 'zustand';
import { LevelProgress } from '@/lib/types';
import { LEVELS } from '@/lib/levels';

export interface LevelSlice {
  currentLevelId: number;
  progress: Record<number, LevelProgress>;
  setCurrentLevel: (id: number) => void;
  markLevelComplete: (id: number) => void;
  saveLevelCircuit: (id: number, gates: unknown[], wires: unknown[]) => void;
  loadProgress: () => void;
  nextLevel: () => void;
  prevLevel: () => void;
}

const STORAGE_KEY = 'logic-lab-progress';

function loadFromStorage(): Record<number, LevelProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

function saveToStorage(progress: Record<number, LevelProgress>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export const createLevelSlice: StateCreator<LevelSlice, [], [], LevelSlice> = (
  set,
  get
) => ({
  currentLevelId: 1,
  progress: {},

  setCurrentLevel: (id) => {
    if (id >= 1 && id <= LEVELS.length) {
      set({ currentLevelId: id });
    }
  },

  markLevelComplete: (id) => {
    set((state) => {
      const newProgress = {
        ...state.progress,
        [id]: { ...state.progress[id], completed: true },
      };
      saveToStorage(newProgress);
      return { progress: newProgress };
    });
  },

  saveLevelCircuit: (id, gates, wires) => {
    set((state) => {
      const newProgress = {
        ...state.progress,
        [id]: {
          ...state.progress[id],
          completed: state.progress[id]?.completed ?? false,
          circuit: { gates: gates as never[], wires: wires as never[] },
        },
      };
      saveToStorage(newProgress);
      return { progress: newProgress };
    });
  },

  loadProgress: () => {
    const progress = loadFromStorage();
    set({ progress });
  },

  nextLevel: () => {
    const { currentLevelId } = get();
    if (currentLevelId < LEVELS.length) {
      set({ currentLevelId: currentLevelId + 1 });
    }
  },

  prevLevel: () => {
    const { currentLevelId } = get();
    if (currentLevelId > 1) {
      set({ currentLevelId: currentLevelId - 1 });
    }
  },
});
