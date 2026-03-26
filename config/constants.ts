export const GRID_SIZE = 20;
export const MIN_GATE_DISTANCE = 120;
export const GATE_WIDTH = 100;
export const GATE_HEIGHT = 80;
export const PORT_RADIUS = 8;
export const PORT_HIT_RADIUS = 15;

export const COLORS = {
  grid: '#1e293b',
  gridDot: '#334155',
  gateBody: '#1e293b',
  gateStroke: '#475569',
  gateText: '#e2e8f0',
  portFill: '#64748b',
  portStroke: '#94a3b8',
  portHoverValid: '#22c55e',
  portHoverInvalid: '#ef4444',
  wireOn: '#22c55e',
  wireOff: '#64748b',
  wireDrag: '#3b82f6',
  wireDragInvalid: '#ef4444',
  selectedStroke: '#3b82f6',
  ledOn: '#22c55e',
  ledOff: '#374151',
  switchOn: '#22c55e',
  switchOff: '#64748b',
};

export const SIMULATION_DELAY_MS = 400;

export const SWITCH_PORT_IDS = {
  A: 'switch-A-out-0',
  B: 'switch-B-out-0',
  C: 'switch-C-out-0',
} as const;

export const OUTPUT_PORT_ID = 'output-in-0';
