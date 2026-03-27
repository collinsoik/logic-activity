'use client';

import dynamic from 'next/dynamic';
import Toolbar from '@/components/controls/Toolbar';
import GatePalette from '@/components/sidebar/GatePalette';
import SwitchPanel from '@/components/switches/SwitchPanel';
import TruthTable from '@/components/truthtable/TruthTable';
import ModeSelector from '@/components/versus/ModeSelector';
import VersusOverlay from '@/components/versus/VersusOverlay';
import { useStore } from '@/store';
import { useEffect } from 'react';

const CircuitCanvas = dynamic(
  () => import('@/components/canvas/CircuitCanvas'),
  { ssr: false }
);

export default function Home() {
  const loadProgress = useStore((s) => s.loadProgress);
  const appMode = useStore((s) => s.appMode);
  const versusPhase = useStore((s) => s.versusPhase);
  const versusChallenge = useStore((s) => s.versusChallenge);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const showModeSelector = appMode === 'versus' && versusPhase === 'idle';
  const showHandoff = appMode === 'versus' && versusChallenge !== null && versusPhase === 'build';

  return (
    <div
      className="h-screen w-screen"
      style={{
        display: 'grid',
        gridTemplate: `
          "toolbar toolbar toolbar" 48px
          "table canvas palette" 1fr
          "switches switches switches" 100px
          / 220px 1fr 180px
        `,
      }}
    >
      <div style={{ gridArea: 'toolbar' }}>
        <Toolbar />
      </div>
      <div style={{ gridArea: 'table' }}>
        <TruthTable />
      </div>
      <div style={{ gridArea: 'canvas' }} className="relative">
        <CircuitCanvas />
        {showModeSelector && <ModeSelector />}
        {showHandoff && <VersusOverlay />}
      </div>
      <div style={{ gridArea: 'palette' }}>
        <GatePalette />
      </div>
      <div style={{ gridArea: 'switches' }}>
        <SwitchPanel />
      </div>
    </div>
  );
}
