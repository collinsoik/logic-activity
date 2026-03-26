export type GateType = 'AND' | 'OR' | 'NOT' | 'XOR';

export type InputLabel = 'A' | 'B' | 'C';

export interface Gate {
  id: string;
  type: GateType;
  x: number;
  y: number;
}

export interface Wire {
  id: string;
  fromPortId: string;
  toPortId: string;
  signal?: boolean;
}

export interface Port {
  id: string;
  nodeId: string;
  type: 'input' | 'output';
  index: number;
  x: number;
  y: number;
}

export interface Level {
  id: number;
  inputs: InputLabel[];
  expression: string;
  evaluate: (a: boolean, b: boolean, c: boolean) => boolean;
  expectedOutputs: boolean[];
}

export interface LevelProgress {
  completed: boolean;
  circuit?: { gates: Gate[]; wires: Wire[] };
}

export interface SimulationRow {
  inputs: boolean[];
  expected: boolean;
  actual: boolean | null;
}
