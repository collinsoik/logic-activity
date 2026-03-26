import { Level, InputLabel } from './types';

function generateExpectedOutputs(
  inputs: InputLabel[],
  evaluate: (a: boolean, b: boolean, c: boolean) => boolean
): boolean[] {
  const count = Math.pow(2, inputs.length);
  const results: boolean[] = [];

  for (let i = 0; i < count; i++) {
    const bits = inputs.map((_, idx) => !!(i & (1 << (inputs.length - 1 - idx))));
    const a = bits[0] ?? false;
    const b = bits[1] ?? false;
    const c = bits[2] ?? false;
    results.push(evaluate(a, b, c));
  }

  return results;
}

function createLevel(
  id: number,
  inputs: InputLabel[],
  expression: string,
  evaluate: (a: boolean, b: boolean, c: boolean) => boolean
): Level {
  return {
    id,
    inputs,
    expression,
    evaluate,
    expectedOutputs: generateExpectedOutputs(inputs, evaluate),
  };
}

export const LEVELS: Level[] = [
  createLevel(1, ['A', 'B'], 'A & B', (a, b) => a && b),
  createLevel(2, ['A', 'B'], 'A | B', (a, b) => a || b),
  createLevel(3, ['A', 'B'], 'A', (a) => a),
  createLevel(4, ['A', 'B'], '(!A) | B', (a, b) => !a || b),
  createLevel(5, ['A', 'B'], '!(A & B)', (a, b) => !(a && b)),
  createLevel(6, ['A', 'B', 'C'], 'A & B & C', (a, b, c) => a && b && c),
  createLevel(7, ['A', 'B', 'C'], 'A | B | C', (a, b, c) => a || b || c),
  createLevel(8, ['A', 'B', 'C'], '(A & C) | B', (a, b, c) => (a && c) || b),
  createLevel(9, ['A'], 'A | !A', (a) => a || !a),
  createLevel(10, ['A', 'B', 'C'], 'A | C', (a, _b, c) => a || c),
  createLevel(11, ['A', 'B', 'C'], '(!A) & B & C', (a, b, c) => !a && b && c),
  createLevel(12, ['A', 'B', 'C'], 'A ^ B', (a, b) => a !== b),
  createLevel(13, ['A', 'B', 'C'], 'A ^ B | C', (a, b, c) => (a !== b) || c),
  createLevel(14, ['A', 'B', 'C'], 'A & !C', (a, _b, c) => a && !c),
  createLevel(15, ['A', 'B', 'C'], 'A & (B ^ C)', (a, b, c) => a && (b !== c)),
  createLevel(16, ['A', 'B', 'C'], 'A ^ B ^ C', (a, b, c) => (a !== b) !== c),
  createLevel(17, ['A', 'B', 'C'], 'A ^ !B ^ C', (a, b, c) => (a !== !b) !== c),
];
