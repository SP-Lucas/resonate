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

const healthConfig: Record<Health, { dot: string; label: string; ring: string }> = {
  good: {
    dot: 'bg-[#00D4AA]',
    label: 'Healthy',
    ring: 'shadow-[0_0_8px_rgba(0,212,170,0.35)]',
  },
  warning: {
    dot: 'bg-[#F59E0B]',
    label: 'Warning',
    ring: 'shadow-[0_0_8px_rgba(245,158,11,0.35)]',
  },
  critical: {
    dot: 'bg-[#EF4444]',
    label: 'Critical',
    ring: 'shadow-[0_0_8px_rgba(239,68,68,0.45)]',
  },
};

export function ModuleCard({ name, icon, metric, health, path, color = '#00D4AA' }: ModuleCardProps) {
  const { dot, label, ring } = healthConfig[health];

  return (
    <Link href={path} className="group block">
      <div
        className={`
          relative bg-[#0A1225] border border-[#0F2040] rounded-xl p-5
          transition-all duration-200
          hover:border-[#00D4AA]/40 hover:shadow-[0_0_20px_rgba(0,212,170,0.08)]
          ${health === 'critical' ? 'hover:border-[#EF4444]/40' : ''}
        `}
      >
        {/* Top row: icon + health indicator */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg text-xl"
            style={{ backgroundColor: `${color}15` }}
          >
            {icon}
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${dot} ${ring}`} />
            <span className="text-xs font-mono text-[#94A3B8]" style={{ fontFamily: 'Space Mono, monospace' }}>
              {label}
            </span>
          </div>
        </div>

        {/* Module name */}
        <div className="mb-1">
          <h3 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#00D4AA] transition-colors duration-200">
            {name}
          </h3>
        </div>

        {/* Key metric */}
        <p
          className="text-xs text-[#94A3B8] mb-4 leading-relaxed"
          style={{ fontFamily: 'Space Mono, monospace' }}
        >
          {metric}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-1 text-xs text-[#475569] group-hover:text-[#00D4AA] transition-colors duration-200">
          <span>View Module</span>
          <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200">→</span>
        </div>

        {/* Accent line on hover */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }}
        />
      </div>
    </Link>
  );
}
