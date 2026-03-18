'use client';

import React from 'react';

interface SLATimerProps {
  seconds: number;
  totalSeconds: number;
  variant?: 'text' | 'ring';
  size?: 'sm' | 'md' | 'lg';
}

function fmtSLA(s: number): string {
  if (s <= 0) return 'BREACHED';
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function slaColor(s: number): string {
  if (s <= 0) return '#EF4444';
  if (s < 900) return '#EF4444';
  if (s < 2700) return '#F59E0B';
  return '#00D4AA';
}

function SLARing({ seconds, totalSeconds, ringSize = 52 }: { seconds: number; totalSeconds: number; ringSize?: number }) {
  const r = ringSize * 0.385;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, seconds / totalSeconds));
  const col = slaColor(seconds);
  const cx = ringSize / 2;

  return (
    <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="#0F2040"
        strokeWidth="3.5"
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={col}
        strokeWidth="3.5"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        style={{
          transformOrigin: 'center',
          transform: 'rotate(-90deg)',
          transition: 'stroke-dashoffset 1s linear',
        }}
      />
    </svg>
  );
}

export default function SLATimer({ seconds, totalSeconds, variant = 'text', size = 'md' }: SLATimerProps) {
  const col = slaColor(seconds);
  const label = fmtSLA(seconds);

  const fontSizeMap = { sm: 12, md: 17, lg: 28 };
  const fontSize = fontSizeMap[size];

  if (variant === 'ring') {
    const ringSizeMap = { sm: 40, md: 52, lg: 68 };
    const ringSize = ringSizeMap[size];

    return (
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <SLARing seconds={seconds} totalSeconds={totalSeconds} ringSize={ringSize} />
        <div style={{
          position: 'absolute',
          fontFamily: "'Space Mono', monospace",
          fontSize: size === 'lg' ? 11 : 8,
          fontWeight: 700,
          color: col,
          textAlign: 'center',
          lineHeight: 1,
          letterSpacing: -0.5,
        }}>
          {label === 'BREACHED' ? '!!!' : label}
        </div>
      </div>
    );
  }

  return (
    <span style={{
      fontFamily: "'Space Mono', monospace",
      fontSize,
      fontWeight: 700,
      color: col,
      letterSpacing: size === 'lg' ? -1 : 0,
    }}>
      {label}
    </span>
  );
}
