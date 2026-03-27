'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: 40, fontFamily: 'monospace', color: '#fff', background: '#111' }}>
      <h2>Something went wrong</h2>
      <pre style={{ whiteSpace: 'pre-wrap', color: '#f87171', marginTop: 16 }}>
        {error.message}
      </pre>
      <pre style={{ whiteSpace: 'pre-wrap', color: '#94a3b8', marginTop: 8, fontSize: 12 }}>
        {error.stack}
      </pre>
      <button
        onClick={reset}
        style={{ marginTop: 20, padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
      >
        Try again
      </button>
    </div>
  );
}
