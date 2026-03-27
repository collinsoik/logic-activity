import { StateCreator } from 'zustand';
import { VersusChallenge } from '@/lib/types';
import type { AppStore } from '@/store';

export type VersusPhase = 'idle' | 'build' | 'guess';

export interface VersusSlice {
  appMode: 'levels' | 'versus';
  versusPhase: VersusPhase;
  versusInputCount: 1 | 2 | 3;
  versusChallenge: VersusChallenge | null;
  stopwatchStartTime: number | null;
  stopwatchElapsed: number | null;

  enterVersusMode: () => void;
  exitVersusMode: () => void;
  setVersusInputCount: (count: 1 | 2 | 3) => void;
  startBuildPhase: () => void;
  finishBuildPhase: (challenge: VersusChallenge) => void;
  startGuessPhase: () => void;
  stopStopwatch: (elapsed: number) => void;
  resetVersus: () => void;
}

export const createVersusSlice: StateCreator<
  AppStore,
  [],
  [],
  VersusSlice
> = (set, get) => ({
  appMode: 'levels',
  versusPhase: 'idle',
  versusInputCount: 2,
  versusChallenge: null,
  stopwatchStartTime: null,
  stopwatchElapsed: null,

  enterVersusMode: () => {
    get().clearCircuit();
    get().resetResults();
    set({
      appMode: 'versus',
      versusPhase: 'idle',
      versusChallenge: null,
      stopwatchStartTime: null,
      stopwatchElapsed: null,
    });
  },

  exitVersusMode: () => {
    get().clearCircuit();
    get().resetResults();
    set({
      appMode: 'levels',
      versusPhase: 'idle',
      versusChallenge: null,
      stopwatchStartTime: null,
      stopwatchElapsed: null,
    });
  },

  setVersusInputCount: (count) => {
    set({ versusInputCount: count });
  },

  startBuildPhase: () => {
    get().clearCircuit();
    get().resetResults();
    get().setSwitchValues({ A: false, B: false, C: false });
    set({ versusPhase: 'build', versusChallenge: null, stopwatchStartTime: null, stopwatchElapsed: null });
  },

  finishBuildPhase: (challenge) => {
    set({ versusChallenge: challenge });
  },

  startGuessPhase: () => {
    get().clearCircuit();
    get().resetResults();
    get().setSwitchValues({ A: false, B: false, C: false });
    set({
      versusPhase: 'guess',
      stopwatchStartTime: Date.now(),
      stopwatchElapsed: null,
    });
  },

  stopStopwatch: (elapsed) => {
    set({ stopwatchElapsed: elapsed });
  },

  resetVersus: () => {
    get().clearCircuit();
    get().resetResults();
    get().setSwitchValues({ A: false, B: false, C: false });
    set({
      versusPhase: 'idle',
      versusChallenge: null,
      stopwatchStartTime: null,
      stopwatchElapsed: null,
    });
  },
});
