'use client';

import Link from 'next/link';

type Health = 'good' | 'warning' | 'critical';

interface ModuleCardProps {
  name: string;
  icon: string;
  metric: string;
  health: Health;
  path: string;
  color?: string;
}

const healthConfig: Record<Health, { dot: string; label: string; ring: string; glow: string }> = {
  good: {
    dot: 'bg-[#00D4AA]',
    label: 'Healthy',
    ring: 'shadow-[0_0_8px_rgba(0,212,170,0.35)]',
    glow: 'rgba(0,212,170,0.6)',
  },
  warning: {
    dot: 'bg-[#F59E0B]',
    label: 'Warning',
    ring: 'shadow-[0_0_8px_rgba(245,158,11,0.35)]',
    glow: 'rgba(0,212,170,0.6)',
  },
  critical: {
    dot: 'bg-[#EF4444]',
    label: 'Critical',
    ring: 'shadow-[0_0_8px_rgba(239,68,68,0.45)]',
    glow: 'rgba(0,212,170,0.6)',
  },
};

// Deterministic sparkline data per module name
function getSparklineData(name: string): number[] {
  const seeds: Record<string, number[]> = {
    'Service Desk':  [62, 78, 55, 90, 71],
    'NetOps':        [45, 60, 80, 65, 88],
    'Finance':       [70, 65, 82, 75, 92],
    'Procurement':   [50, 68, 60, 77, 63],
    'CRM':           [80, 72, 68, 85, 78],
    'Contracts':     [55, 40, 65, 50, 58],
    'Security':      [88, 91, 85, 94, 90],
  };
  return seeds[name] ?? [60, 70, 65, 80, 75];
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const barW = 5;
  const gap = 3;
  const totalW = data.length * barW + (data.length - 1) * gap;

  return (
    <svg
      width={totalW}
      height={height}
      viewBox={`0 0 ${totalW} ${height}`}
      aria-hidden="true"
      className="opacity-60 group-hover:opacity-100 transition-opacity duration-200"
    >
      {data.map((v, i) => {
        const barH = Math.max(3, ((v - min) / range) * (height - 4) + 2);
        const x = i * (barW + gap);
        const y = height - barH;
        const isLast = i === data.length - 1;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            rx={1.5}
            fill={isLast ? color : `${color}55`}
          />
        );
      })}
    </svg>
  );
}

export function ModuleCard({ name, icon, metric, health, path, color = '#00D4AA' }: ModuleCardProps) {
  const { dot, label, ring } = healthConfig[health];
  const sparkData = getSparklineData(name);
  const isCritical = health === 'critical';

  return (
    <Link href={path} className="group block">
      {/* Gradient border wrapper */}
      <div
        className="relative rounded-xl p-[1px] transition-all duration-300 group-hover:shadow-[0_0_24px_rgba(0,212,170,0.15)]"
        style={{
          background: 'transparent',
        }}
      >
        {/* Animated gradient border on hover via pseudo-layer */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${color}80 0%, ${color}20 50%, ${color}80 100%)`,
            padding: '1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
          aria-hidden="true"
        />

        <div
          className={`
            relative bg-[#0A1225] border rounded-xl p-5
            transition-all duration-300
            ${isCritical
              ? 'border-[#EF4444]/30 group-hover:border-[#EF4444]/60 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]'
              : 'border-[#0F2040] group-hover:border-[#00D4AA]/40 group-hover:shadow-[0_0_20px_rgba(0,212,170,0.08)]'}
          `}
        >
          {/* Top row: icon + health indicator */}
          <div className="flex items-start justify-between mb-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg text-xl transition-transform duration-200 group-hover:scale-105"
              style={{ backgroundColor: `${color}18` }}
            >
              {icon}
            </div>
            <div className="flex items-center gap-1.5">
              {/* Pulsing dot for critical */}
              <div className="relative flex items-center justify-center">
                {isCritical && (
                  <span
                    className="absolute inline-flex w-3 h-3 rounded-full animate-ping"
                    style={{ backgroundColor: '#EF444450' }}
                  />
                )}
                <div className={`w-2 h-2 rounded-full ${dot} ${ring}`} />
              </div>
              <span className="text-xs text-[#94A3B8]" style={{ fontFamily: 'Space Mono, monospace' }}>
                {label}
              </span>
            </div>
          </div>

          {/* Module name */}
          <div className="mb-1">
            <h3
              className="text-sm font-semibold text-[#F1F5F9] transition-colors duration-200"
              style={{ color: undefined }}
            >
              <span className="group-hover:text-[#00D4AA] transition-colors duration-200">{name}</span>
            </h3>
          </div>

          {/* Key metric */}
          <p
            className="text-xs text-[#94A3B8] mb-3 leading-relaxed"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {metric}
          </p>

          {/* Sparkline + CTA row */}
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-1 text-xs text-[#475569] group-hover:text-[#00D4AA] transition-colors duration-200">
              <span>View Module</span>
              <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200">→</span>
            </div>
            <Sparkline data={sparkData} color={color} />
          </div>

          {/* Accent gradient line on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}
          />
        </div>
      </div>
    </Link>
  );
}
