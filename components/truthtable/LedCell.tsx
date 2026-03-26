'use client';

import Led from '../shared/Led';

interface LedCellProps {
  value: boolean | null;
}

export default function LedCell({ value }: LedCellProps) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <Led on={value} size={10} />
      <span className="text-[10px] font-mono text-foreground/50 w-3">
        {value === null ? '-' : value ? '1' : '0'}
      </span>
    </div>
  );
}
