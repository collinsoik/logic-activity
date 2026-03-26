'use client';

interface LedProps {
  on: boolean | null;
  size?: number;
  className?: string;
}

export default function Led({ on, size = 12, className = '' }: LedProps) {
  const isOn = on === true;
  return (
    <div
      className={`rounded-full border border-white/20 transition-all duration-200 ${className}`}
      style={{
        width: size,
        height: size,
        background: on === null ? '#1e293b' : isOn ? '#22c55e' : '#ef4444',
        boxShadow: isOn
          ? '0 0 6px #22c55e, 0 0 12px #22c55e'
          : on === false
            ? '0 0 6px #ef4444, 0 0 12px #ef4444'
            : 'none',
      }}
    />
  );
}
