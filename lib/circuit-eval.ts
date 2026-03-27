import { Gate, Wire, InputLabel } from './types';
import { GATE_DEFINITIONS, getPortPositions } from './gate-defs';

interface EvalContext {
  gates: Gate[];
  wires: Wire[];
  switchValues: { A: boolean; B: boolean; C: boolean };
}

export function evaluateCircuit(ctx: EvalContext): {
  output: boolean | null;
  portValues: Map<string, boolean>;
} {
  const { gates, wires, switchValues } = ctx;
  const portValues = new Map<string, boolean>();

  // Seed switch output values
  portValues.set('switch-A-out-0', switchValues.A);
  portValues.set('switch-B-out-0', switchValues.B);
  portValues.set('switch-C-out-0', switchValues.C);

  // Build wire lookup: toPortId -> fromPortId
  const wireByTarget = new Map<string, string>();
  for (const wire of wires) {
    wireByTarget.set(wire.toPortId, wire.fromPortId);
  }

  // Build gate dependency counts
  const gateInputCounts = new Map<string, number>();
  const gateResolvedInputs = new Map<string, number>();

  for (const gate of gates) {
    const def = GATE_DEFINITIONS[gate.type];
    let neededInputs = 0;

    for (let i = 0; i < def.inputCount; i++) {
      const inputPortId = `${gate.id}-in-${i}`;
      if (wireByTarget.has(inputPortId)) {
        neededInputs++;
      }
    }

    gateInputCounts.set(gate.id, neededInputs);
    gateResolvedInputs.set(gate.id, 0);
  }

  // BFS queue: start with gates whose inputs are all already resolved
  const queue: string[] = [];

  // Check which gate inputs are already resolved (connected to switches)
  for (const gate of gates) {
    const def = GATE_DEFINITIONS[gate.type];
    let resolved = 0;

    for (let i = 0; i < def.inputCount; i++) {
      const inputPortId = `${gate.id}-in-${i}`;
      const sourcePortId = wireByTarget.get(inputPortId);
      if (sourcePortId && portValues.has(sourcePortId)) {
        portValues.set(inputPortId, portValues.get(sourcePortId)!);
        resolved++;
      }
    }

    gateResolvedInputs.set(gate.id, resolved);
    const needed = gateInputCounts.get(gate.id)!;
    if (needed > 0 && resolved >= needed) {
      queue.push(gate.id);
    }
  }

  // Process gates in topological order
  const processed = new Set<string>();

  while (queue.length > 0) {
    const gateId = queue.shift()!;
    if (processed.has(gateId)) continue;
    processed.add(gateId);

    const gate = gates.find((g) => g.id === gateId);
    if (!gate) continue;

    const def = GATE_DEFINITIONS[gate.type];

    // Gather input values
    const inputs: boolean[] = [];
    let allInputsResolved = true;

    for (let i = 0; i < def.inputCount; i++) {
      const inputPortId = `${gate.id}-in-${i}`;
      const sourcePortId = wireByTarget.get(inputPortId);
      if (sourcePortId && portValues.has(sourcePortId)) {
        portValues.set(inputPortId, portValues.get(sourcePortId)!);
        inputs.push(portValues.get(sourcePortId)!);
      } else {
        allInputsResolved = false;
        break;
      }
    }

    if (!allInputsResolved) continue;

    // Evaluate gate
    let output: boolean;
    switch (gate.type) {
      case 'AND':
        output = inputs[0] && inputs[1];
        break;
      case 'OR':
        output = inputs[0] || inputs[1];
        break;
      case 'XOR':
        output = inputs[0] !== inputs[1];
        break;
      case 'NOT':
        output = !inputs[0];
        break;
    }

    const outputPortId = `${gate.id}-out-0`;
    portValues.set(outputPortId, output);

    // Propagate to downstream gates
    for (const wire of wires) {
      if (wire.fromPortId === outputPortId) {
        const targetPortId = wire.toPortId;
        portValues.set(targetPortId, output);

        // Find the gate that owns this target port
        for (const g of gates) {
          const ports = getPortPositions(g.id, g.type, g.x, g.y);
          const isOwner = ports.some(
            (p) => p.id === targetPortId && p.type === 'input'
          );
          if (isOwner && !processed.has(g.id)) {
            const prev = gateResolvedInputs.get(g.id) ?? 0;
            gateResolvedInputs.set(g.id, prev + 1);
            const needed = gateInputCounts.get(g.id)!;
            if (prev + 1 >= needed) {
              queue.push(g.id);
            }
          }
        }
      }
    }
  }

  // Read final output
  const outputSourcePort = wireByTarget.get('output-in-0');
  const outputValue = outputSourcePort
    ? portValues.get(outputSourcePort) ?? null
    : null;

  return { output: outputValue, portValues };
}

export function hasCycle(
  gates: Gate[],
  wires: Wire[],
  newFromPortId: string,
  newToPortId: string
): boolean {
  // Build adjacency: gateId -> set of downstream gateIds
  const adj = new Map<string, Set<string>>();

  const getGateIdFromPort = (portId: string): string | null => {
    const parts = portId.split('-');
    if (parts[0] === 'switch' || parts[0] === 'output') return null;
    // Port ID format: "{gateId}-in-{index}" or "{gateId}-out-0"
    // gateId might contain dashes, so find the last -in- or -out-
    const inIdx = portId.lastIndexOf('-in-');
    const outIdx = portId.lastIndexOf('-out-');
    if (inIdx !== -1) return portId.substring(0, inIdx);
    if (outIdx !== -1) return portId.substring(0, outIdx);
    return null;
  };

  for (const gate of gates) {
    adj.set(gate.id, new Set());
  }

  const allWires = [...wires, { fromPortId: newFromPortId, toPortId: newToPortId }];

  for (const wire of allWires) {
    const fromGate = getGateIdFromPort(wire.fromPortId);
    const toGate = getGateIdFromPort(wire.toPortId);
    if (fromGate && toGate && fromGate !== toGate) {
      if (!adj.has(fromGate)) adj.set(fromGate, new Set());
      adj.get(fromGate)!.add(toGate);
    }
  }

  // DFS cycle detection
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(node: string): boolean {
    visited.add(node);
    inStack.add(node);

    for (const neighbor of adj.get(node) ?? []) {
      if (inStack.has(neighbor)) return true;
      if (!visited.has(neighbor) && dfs(neighbor)) return true;
    }

    inStack.delete(node);
    return false;
  }

  for (const gateId of adj.keys()) {
    if (!visited.has(gateId) && dfs(gateId)) return true;
  }

  return false;
}

export function isCircuitComplete(
  gates: Gate[],
  wires: Wire[],
  inputs: InputLabel[]
): { complete: boolean; reason?: string } {
  if (gates.length === 0) {
    return { complete: false, reason: 'No gates placed' };
  }

  const hasOutput = wires.some((w) => w.toPortId === 'output-in-0');
  if (!hasOutput) {
    return { complete: false, reason: 'Output bulb is not connected' };
  }

  const count = Math.pow(2, inputs.length);
  for (let i = 0; i < count; i++) {
    const bits = inputs.map((_, idx) => !!(i & (1 << (inputs.length - 1 - idx))));
    const switchValues = {
      A: bits[0] ?? false,
      B: bits[1] ?? false,
      C: bits[2] ?? false,
    };
    const { output } = evaluateCircuit({ gates, wires, switchValues });
    if (output === null) {
      return { complete: false, reason: 'Some gates have unconnected inputs' };
    }
  }

  return { complete: true };
}

export function generateTruthTableFromCircuit(
  gates: Gate[],
  wires: Wire[],
  inputs: InputLabel[]
): boolean[] | null {
  const count = Math.pow(2, inputs.length);
  const outputs: boolean[] = [];

  for (let i = 0; i < count; i++) {
    const bits = inputs.map((_, idx) => !!(i & (1 << (inputs.length - 1 - idx))));
    const switchValues = {
      A: bits[0] ?? false,
      B: bits[1] ?? false,
      C: bits[2] ?? false,
    };
    const { output } = evaluateCircuit({ gates, wires, switchValues });
    if (output === null) return null;
    outputs.push(output);
  }

  return outputs;
}
