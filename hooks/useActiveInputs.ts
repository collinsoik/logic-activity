import { useStore } from '@/store';
import { LEVELS } from '@/lib/levels';
import { InputLabel } from '@/lib/types';

const ALL_INPUTS: InputLabel[] = ['A', 'B', 'C'];

export function useActiveInputs(): InputLabel[] {
  return useStore((s) => {
    if (s.appMode === 'levels') {
      return LEVELS.find((l) => l.id === s.currentLevelId)!.inputs;
    }
    if (s.versusPhase === 'guess' && s.versusChallenge) {
      return s.versusChallenge.inputs;
    }
    return ALL_INPUTS.slice(0, s.versusInputCount);
  });
}
