'use client';

export function RZStatusBadge() {
  return (
    <div
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg border"
      style={{
        backgroundColor: '#0A1225',
        borderColor: '#00D4AA33',
      }}
    >
      <div className="relative flex items-center justify-center w-2 h-2 flex-shrink-0">
        <span
          className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
          style={{ backgroundColor: '#00D4AA' }}
        />
        <span
          className="relative inline-flex rounded-full w-2 h-2"
          style={{ backgroundColor: '#00D4AA' }}
        />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className="text-xs font-bold tracking-wider"
          style={{ fontFamily: "'Space Mono', monospace", color: '#00D4AA' }}
        >
          RZ AI
        </span>
        <span
          className="text-xs mt-0.5"
          style={{ color: '#475569', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}
        >
          autonomous · 8s avg
        </span>
      </div>
    </div>
  );
}
