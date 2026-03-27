import { useStore } from '@/store';
import { LEVELS } from '@/lib/levels';
import { InputLabel } from '@/lib/types';

// Stable references to avoid infinite re-renders in Zustand selectors
const INPUTS_1: InputLabel[] = ['A'];
const INPUTS_2: InputLabel[] = ['A', 'B'];
const INPUTS_3: InputLabel[] = ['A', 'B', 'C'];
const VERSUS_INPUTS = { 1: INPUTS_1, 2: INPUTS_2, 3: INPUTS_3 } as const;

export function useActiveInputs(): InputLabel[] {
  return useStore((s) => {
    if (s.appMode === 'levels') {
      return LEVELS.find((l) => l.id === s.currentLevelId)!.inputs;
    }
    if (s.versusPhase === 'guess' && s.versusChallenge) {
      return s.versusChallenge.inputs;
    }
    return VERSUS_INPUTS[s.versusInputCount];
  });
}
