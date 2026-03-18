'use client';

type Severity = 'info' | 'warning' | 'critical';

interface AIInsightProps {
  insight: string;
  confidence: number;
  severity: Severity;
  action?: string;
  onAction?: () => void;
}

const severityConfig: Record<Severity, { badge: string; border: string; actionBg: string }> = {
  info: {
    badge: 'bg-[#0D6EFD]/15 text-[#6BA3FF] border border-[#0D6EFD]/25',
    border: 'border-l-[#0D6EFD]',
    actionBg: 'bg-[#0D6EFD]/10 hover:bg-[#0D6EFD]/20 text-[#6BA3FF]',
  },
  warning: {
    badge: 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/25',
    border: 'border-l-[#F59E0B]',
    actionBg: 'bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B]',
  },
  critical: {
    badge: 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25',
    border: 'border-l-[#EF4444]',
    actionBg: 'bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444]',
  },
};

const severityLabel: Record<Severity, string> = {
  info: 'INFO',
  warning: 'WARN',
  critical: 'CRITICAL',
};

export function AIInsight({ insight, confidence, severity, action, onAction }: AIInsightProps) {
  const { badge, border, actionBg } = severityConfig[severity];

  return (
    <div className={`flex gap-3 p-3.5 bg-[#060D1A] border border-[#0F2040] border-l-2 ${border} rounded-lg`}>
      {/* RZ AI Badge */}
      <div className="flex-shrink-0 mt-0.5">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#00D4AA]/10 border border-[#00D4AA]/20">
          <span className="text-[10px] font-bold text-[#00D4AA]" style={{ fontFamily: 'Space Mono, monospace' }}>
            RZ
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge}`} style={{ fontFamily: 'Space Mono, monospace' }}>
            {severityLabel[severity]}
          </span>
          <span
            className="text-[10px] text-[#475569]"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            {confidence}% confidence
          </span>
        </div>

        <p className="text-sm text-[#CBD5E1] leading-snug mb-2">{insight}</p>

        {action && (
          <button
            onClick={onAction}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors duration-150 ${actionBg}`}
          >
            {action}
          </button>
        )}
      </div>
    </div>
  );
}
