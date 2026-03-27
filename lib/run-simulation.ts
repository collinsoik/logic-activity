import { evaluateCircuit } from './circuit-eval';
import { SimulationRow, InputLabel, Gate, Wire } from './types';
import { SIMULATION_DELAY_MS } from '@/config/constants';

interface SimulationActions {
  setSwitchValues: (values: { A: boolean; B: boolean; C: boolean }) => void;
  setCurrentRunRow: (row: number | null) => void;
  setResults: (results: SimulationRow[]) => void;
  setIsRunning: (running: boolean) => void;
  resetResults: () => void;
}

export async function runSimulation(
  gates: Gate[],
  wires: Wire[],
  inputs: InputLabel[],
  expectedOutputs: boolean[],
  actions: SimulationActions
): Promise<boolean> {
  const count = Math.pow(2, inputs.length);
  const rows: SimulationRow[] = [];

  actions.setIsRunning(true);
  actions.resetResults();

  for (let i = 0; i < count; i++) {
    const bits = inputs.map(
      (_, idx) => !!(i & (1 << (inputs.length - 1 - idx)))
    );
    const switchVals = {
      A: bits[0] ?? false,
      B: bits[1] ?? false,
      C: bits[2] ?? false,
    };

    actions.setSwitchValues(switchVals);
    actions.setCurrentRunRow(i);

    await new Promise((r) => setTimeout(r, SIMULATION_DELAY_MS));

    const { output } = evaluateCircuit({ gates, wires, switchValues: switchVals });

    rows.push({
      inputs: bits,
      expected: expectedOutputs[i],
      actual: output,
    });

    actions.setResults([...rows]);
  }

  const allCorrect = rows.every(
    (r) => r.actual !== null && r.actual === r.expected
  );

  actions.setIsRunning(false);
  actions.setCurrentRunRow(null);

  return allCorrect;
}
