'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  THREAT_FEED,
  COMPLIANCE_FRAMEWORKS,
  TOP_VULNERABILITIES,
  ENDPOINT_GRID,
  ALERT_SEVERITY_COUNTS,
  SOC_METRICS,
  type ThreatSeverity,
  type ThreatStatus,
  type VulnerabilityEntry,
} from '@/lib/mock-data/netops';

// ── Helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<ThreatSeverity, string> = {
  Critical: '#EF4444',
  High: '#F59E0B',
  Medium: '#0D6EFD',
  Low: '#475569',
};

const SEVERITY_BG: Record<ThreatSeverity, string> = {
  Critical: '#EF444420',
  High: '#F59E0B20',
  Medium: '#0D6EFD20',
  Low: '#47556920',
};

const ENDPOINT_STATUS_COLOR: Record<string, string> = {
  healthy: '#00D4AA',
  warning: '#F59E0B',
  critical: '#EF4444',
  offline: '#475569',
};

const COMPLIANCE_STATUS_COLOR: Record<string, string> = {
  compliant: '#00D4AA',
  partial: '#F59E0B',
  'at-risk': '#EF4444',
};

const PATCH_COLORS: Record<string, string> = {
  Patched: '#00D4AA',
  Pending: '#F59E0B',
  Critical: '#EF4444',
};

function mono(text: string | number) {
  return (
    <span style={{ fontFamily: "'Space Mono', monospace" }}>{text}</span>
  );
}

/** Returns a human-readable relative time string from a Date. */
function relativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 2) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div
      className="flex flex-col gap-1 px-5 py-4 rounded-lg border"
      style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
    >
      <span
        className="text-xs uppercase tracking-widest"
        style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}
      >
        {label}
      </span>
      <span
        className="text-2xl font-bold"
        style={{ color: '#F1F5F9', fontFamily: "'Space Mono', monospace" }}
      >
        {value}
      </span>
      {sub && (
        <span
          className="text-xs"
          style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}
        >
          {sub}
        </span>
      )}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: ThreatSeverity }) {
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-bold"
      style={{
        color: SEVERITY_COLORS[severity],
        backgroundColor: SEVERITY_BG[severity],
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: ThreatStatus }) {
  const isAuto = status === 'Auto-Remediated';
  const isWarn = status === 'Human Review Required';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
      style={{
        color: isAuto ? '#00D4AA' : isWarn ? '#F59E0B' : '#818CF8',
        backgroundColor: isAuto ? '#00D4AA18' : isWarn ? '#F59E0B18' : '#818CF818',
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {isAuto ? (
        <>
          {/* checkmark icon */}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Auto-Remediated
        </>
      ) : isWarn ? (
        <>
          {/* warning triangle icon */}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M5 1.5L9 8.5H1L5 1.5Z" stroke="#F59E0B" strokeWidth="1.2" strokeLinejoin="round" />
            <line x1="5" y1="4" x2="5" y2="6.5" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="5" cy="7.5" r="0.5" fill="#F59E0B" />
          </svg>
          Human Review
        </>
      ) : (
        <>◎ Investigating</>
      )}
    </span>
  );
}

function AlertDonut() {
  const { critical, high, medium, low } = ALERT_SEVERITY_COUNTS;
  const total = critical + high + medium + low;
  const segments = [
    { count: critical, color: '#EF4444', label: 'Critical' },
    { count: high, color: '#F59E0B', label: 'High' },
    { count: medium, color: '#0D6EFD', label: 'Medium' },
    { count: low, color: '#475569', label: 'Low' },
  ];
  const cx = 70;
  const cy = 70;
  const r = 50;
  const innerR = 30;
  let currentAngle = -Math.PI / 2;

  function describeArc(startAngle: number, endAngle: number) {
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const x3 = cx + innerR * Math.cos(endAngle);
    const y3 = cy + innerR * Math.sin(endAngle);
    const x4 = cx + innerR * Math.cos(startAngle);
    const y4 = cy + innerR * Math.sin(startAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }

  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {segments.map((seg) => {
          const slice = (seg.count / total) * 2 * Math.PI;
          const path = describeArc(currentAngle, currentAngle + slice);
          currentAngle += slice;
          return <path key={seg.label} d={path} fill={seg.color} opacity={0.9} />;
        })}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fill="#F1F5F9"
          fontSize="18"
          fontWeight="bold"
          fontFamily="'Space Mono', monospace"
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fill="#475569"
          fontSize="9"
          fontFamily="'Space Mono', monospace"
        >
          TOTAL
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span
              className="text-xs"
              style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}
            >
              {seg.label}
            </span>
            <span
              className="text-xs font-bold ml-auto pl-3"
              style={{ color: '#F1F5F9', fontFamily: "'Space Mono', monospace" }}
            >
              {seg.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveCounter() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s + 1) % 60), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: "'Space Mono', monospace", color: '#00D4AA' }}>
      {String(seconds).padStart(2, '0')}s
    </span>
  );
}

/** Simulated live response time badge: bounces between 7s–10s. */
function ResponseTimeBadge() {
  const [value, setValue] = useState(8);
  useEffect(() => {
    const t = setInterval(() => {
      // Pick a random value 7–10 biased toward 8
      const next = 7 + Math.round(Math.random() * 3);
      setValue(next);
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ color: '#F1F5F9', fontFamily: "'Space Mono', monospace" }}>
      {value}s avg
    </span>
  );
}

/** Compliance bars that animate from 0 to their value on mount. */
function CompliancePanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Small delay to let the DOM paint first so the transition fires
    const id = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className="rounded-lg border p-4 flex-1"
      style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
    >
      <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        Compliance Status
      </p>
      <div className="flex flex-col gap-2.5">
        {COMPLIANCE_FRAMEWORKS.map((fw) => (
          <div key={fw.name} className="flex items-center justify-between">
            <span
              className="text-xs font-medium"
              style={{ color: '#F1F5F9', minWidth: '80px' }}
            >
              {fw.name}
            </span>
            <div
              className="flex-1 mx-3 h-1.5 rounded-full"
              style={{ backgroundColor: '#0F2040' }}
            >
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: mounted ? `${fw.score}%` : '0%',
                  backgroundColor: COMPLIANCE_STATUS_COLOR[fw.status],
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
            <span
              className="text-xs font-bold w-10 text-right"
              style={{
                color: COMPLIANCE_STATUS_COLOR[fw.status],
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {fw.score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Attack surface grid with random dot pulses. */
function AttackSurfaceGrid() {
  const [pulsingIdx, setPulsingIdx] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const idx = Math.floor(Math.random() * ENDPOINT_GRID.length);
      setPulsingIdx(idx);
      // After 600ms clear the pulse
      setTimeout(() => setPulsingIdx(null), 600);
    };
    // Fire every 2 seconds
    const t = setInterval(tick, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="col-span-5 rounded-lg border p-4"
      style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
    >
      <style>{`
        @keyframes dot-pulse {
          0%   { background-color: #F59E0B; transform: scale(1.4); }
          60%  { background-color: #F59E0B; transform: scale(1.4); }
          100% { background-color: inherit; transform: scale(1); }
        }
        .dot-pulsing {
          animation: dot-pulse 0.6s ease-out forwards;
        }
      `}</style>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Attack Surface Map
        </p>
        <div
          className="flex items-center gap-3 text-xs"
          style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}
        >
          {['healthy', 'warning', 'critical', 'offline'].map((s) => (
            <span key={s} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ENDPOINT_STATUS_COLOR[s] }} />
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
        {ENDPOINT_GRID.map((ep, i) => (
          <div
            key={ep.id}
            className={`rounded-sm aspect-square cursor-pointer hover:scale-125 transition-transform${pulsingIdx === i ? ' dot-pulsing' : ''}`}
            title={`${ep.hostname} — ${ep.status}`}
            style={{
              backgroundColor: pulsingIdx === i
                ? '#F59E0B'
                : ENDPOINT_STATUS_COLOR[ep.status] + '99',
            }}
          />
        ))}
      </div>
      <div
        className="mt-3 flex items-center justify-between text-xs"
        style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}
      >
        <span>100 endpoints across 10 clients</span>
        <span style={{ color: '#00D4AA' }}>
          {ENDPOINT_GRID.filter((e) => e.status === 'healthy').length} healthy
        </span>
      </div>
    </div>
  );
}

/** CVE table with "Patch All Critical" action. */
function CVETable({ onToast }: { onToast: (msg: string) => void }) {
  const [patchState, setPatchState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [patchedCves, setPatchedCves] = useState<Set<string>>(new Set());

  const criticalCves = TOP_VULNERABILITIES
    .filter((v) => v.patchStatus === 'Critical')
    .map((v) => v.cve);

  const handlePatchAll = useCallback(() => {
    if (patchState !== 'idle') return;
    setPatchState('loading');
    setTimeout(() => {
      setPatchState('done');
      setPatchedCves(new Set(criticalCves));
      onToast(`${criticalCves.length} critical patch${criticalCves.length !== 1 ? 'es' : ''} applied by RZ`);
    }, 2000);
  }, [patchState, criticalCves, onToast]);

  const effectivePatch = (v: VulnerabilityEntry): string => {
    if (patchedCves.has(v.cve)) return 'Patched';
    return v.patchStatus;
  };

  const effectiveColor = (v: VulnerabilityEntry): string => {
    if (patchedCves.has(v.cve)) return PATCH_COLORS['Patched'];
    return PATCH_COLORS[v.patchStatus];
  };

  const isLoading = (v: VulnerabilityEntry) =>
    patchState === 'loading' && v.patchStatus === 'Critical';

  return (
    <div
      className="col-span-7 rounded-lg border p-4"
      style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
    >
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-row td {
          background: linear-gradient(90deg, #0A1225 25%, #1a2d4a 50%, #0A1225 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite linear;
        }
      `}</style>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Top Vulnerabilities
        </p>
        {patchState !== 'done' && (
          <button
            onClick={handlePatchAll}
            disabled={patchState === 'loading'}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-opacity"
            style={{
              backgroundColor: patchState === 'loading' ? '#EF444430' : '#EF444420',
              color: patchState === 'loading' ? '#EF444480' : '#EF4444',
              border: '1px solid #EF444440',
              fontFamily: "'Space Mono', monospace",
              cursor: patchState === 'loading' ? 'not-allowed' : 'pointer',
              opacity: patchState === 'loading' ? 0.7 : 1,
            }}
          >
            {patchState === 'loading' ? (
              <>
                <svg className="animate-spin" width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1a4 4 0 1 1-4 4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Patching…
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v2M5 7v2M1 5h2M7 5h2M2.5 2.5l1.5 1.5M6 6l1.5 1.5M2.5 7.5L4 6M6 4l1.5-1.5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Patch All Critical
              </>
            )}
          </button>
        )}
        {patchState === 'done' && (
          <span
            className="px-3 py-1 rounded text-xs font-bold"
            style={{
              backgroundColor: '#00D4AA18',
              color: '#00D4AA',
              border: '1px solid #00D4AA30',
              fontFamily: "'Space Mono', monospace",
            }}
          >
            ✓ All Critical Patched
          </span>
        )}
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: '1px solid #0F2040' }}>
            {['CVE', 'Description', 'CVSS', 'Clients Affected', 'Patch Status'].map((h) => (
              <th
                key={h}
                className="pb-2 text-left font-medium uppercase tracking-wider"
                style={{
                  color: '#475569',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '10px',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TOP_VULNERABILITIES.map((v) => (
            <tr
              key={v.cve}
              className={isLoading(v) ? 'shimmer-row' : ''}
              style={{ borderBottom: '1px solid #0F204060' }}
            >
              <td
                className="py-2.5 pr-3"
                style={{
                  color: '#818CF8',
                  fontFamily: "'Space Mono', monospace",
                  whiteSpace: 'nowrap',
                }}
              >
                {v.cve}
              </td>
              <td className="py-2.5 pr-3" style={{ color: '#F1F5F9' }}>
                {v.description}
              </td>
              <td className="py-2.5 pr-3">
                <span
                  className="font-bold"
                  style={{
                    color:
                      v.cvss >= 9 ? '#EF4444' : v.cvss >= 7 ? '#F59E0B' : '#94A3B8',
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {v.cvss}
                </span>
              </td>
              <td
                className="py-2.5 pr-3"
                style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}
              >
                {v.affectedClients}
              </td>
              <td className="py-2.5">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold transition-colors duration-500"
                  style={{
                    color: effectiveColor(v),
                    backgroundColor: effectiveColor(v) + '20',
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {effectivePatch(v)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Toast notification component. */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const showId = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4s
    const hideId = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 4000);
    return () => {
      clearTimeout(showId);
      clearTimeout(hideId);
    };
  }, [onDone]);

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg"
      style={{
        backgroundColor: '#0A1225',
        borderColor: '#00D4AA40',
        fontFamily: "'Space Mono', monospace",
        fontSize: '12px',
        color: '#00D4AA',
        transform: visible ? 'translateY(0)' : 'translateY(-16px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease',
        minWidth: '280px',
        boxShadow: '0 4px 24px #00D4AA18',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#00D4AA" strokeWidth="1.4" />
        <path d="M4 7l2.5 2.5L10 4.5" stroke="#00D4AA" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  );
}

// ── Threat feed row types ─────────────────────────────────────────────────────

interface FeedRow {
  id: string;
  threatType: string;
  sourceIp: string;
  targetClient: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  arrivedAt: Date;
  isNew: boolean;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NetOpsPage() {
  // ── Threat feed state ──────────────────────────────────────────────────────
  const [feedRows, setFeedRows] = useState<FeedRow[]>(() =>
    THREAT_FEED.slice(0, 12).map((t, i) => ({
      ...t,
      arrivedAt: new Date(Date.now() - i * 3500),
      isNew: false,
    }))
  );

  // Track which row IDs are "new" for slide-in animation
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  // Tracks whether a Critical just arrived (for border flash)
  const [criticalFlash, setCriticalFlash] = useState(false);

  // Relative timestamps — tick every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Rotate feed every 3.5s — push a new row from THREAT_FEED to the top
  const feedIdxRef = useRef(0);
  useEffect(() => {
    const t = setInterval(() => {
      const src = THREAT_FEED[feedIdxRef.current % THREAT_FEED.length];
      feedIdxRef.current += 1;

      const newRow: FeedRow = {
        ...src,
        id: `${src.id}-${Date.now()}`,
        arrivedAt: new Date(),
        isNew: true,
      };

      setFeedRows((prev) => [newRow, ...prev.slice(0, 11)]);
      setNewIds((prev) => { const s = new Set(prev); s.add(newRow.id); return s; });

      if (src.severity === 'Critical') {
        setCriticalFlash(true);
        setTimeout(() => setCriticalFlash(false), 800);
      }

      // Remove from newIds after animation completes (500ms)
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(newRow.id);
          return next;
        });
      }, 600);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // ── Metrics bar state ──────────────────────────────────────────────────────
  const [threatsToday, setThreatsToday] = useState(SOC_METRICS.threatsToday);
  const [autoRemPct, setAutoRemPct] = useState(SOC_METRICS.autoRemediatedPct);
  const threatsTodayRef = useRef(threatsToday);
  threatsTodayRef.current = threatsToday;

  useEffect(() => {
    const scheduleNext = () => {
      const delay = 8000 + Math.random() * 7000; // 8–15 s
      return setTimeout(() => {
        setThreatsToday((n) => {
          const next = n + 1;
          // Recompute auto-remediated % (keep ratio roughly stable with small jitter)
          const newPct = Math.min(99, Math.round((next * SOC_METRICS.autoRemediatedPct) / SOC_METRICS.threatsToday));
          setAutoRemPct(newPct);
          return next;
        });
        timeoutRef.current = scheduleNext();
      }, delay);
    };
    const timeoutRef = { current: scheduleNext() };
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // ── Toast state ────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const handleToast = useCallback((msg: string) => setToast(msg), []);
  const handleToastDone = useCallback(() => setToast(null), []);

  // ── Styles for feed row slide-in ───────────────────────────────────────────
  const slideKeyframes = `
    @keyframes slide-in-top {
      from { transform: translateY(-20px); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }
  `;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#070D1A', color: '#F1F5F9' }}>
      <style>{slideKeyframes}</style>

      {/* Toast */}
      {toast && <Toast message={toast} onDone={handleToastDone} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            NetOps / SOC
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#475569' }}>
            Security Operations Center — Zero-Touch Autonomous Mode
          </p>
        </div>
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-lg border"
          style={{ backgroundColor: '#0A1225', borderColor: '#00D4AA40' }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: '#00D4AA' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: '#00D4AA' }}
            />
          </span>
          <span
            className="text-xs font-bold"
            style={{ fontFamily: "'Space Mono', monospace", color: '#00D4AA' }}
          >
            RZ SOC ACTIVE — ZERO-TOUCH MODE
          </span>
          <span
            className="text-xs"
            style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}
          >
            next action in <LiveCounter />
          </span>
        </div>
      </div>

      {/* Metrics bar */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <MetricCard
          label="Threats Today"
          value={threatsToday.toLocaleString()}
          sub="+14% from yesterday"
        />
        <MetricCard
          label="Auto-Remediated"
          value={`${autoRemPct}%`}
          sub={`${(Math.round((threatsToday * autoRemPct) / 100)).toLocaleString()} events handled`}
        />
        {/* Avg Response Time with live counter */}
        <div
          className="flex flex-col gap-1 px-5 py-4 rounded-lg border"
          style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
        >
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}
          >
            Avg Response Time
          </span>
          <span className="text-2xl font-bold">
            <ResponseTimeBadge />
          </span>
          <span
            className="text-xs"
            style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}
          >
            vs 45 min traditional
          </span>
        </div>
        <MetricCard
          label="Clients Monitored"
          value={SOC_METRICS.clientsMonitored}
          sub="All endpoints active"
        />
        <MetricCard
          label="Open Incidents"
          value={SOC_METRICS.openIncidents}
          sub="2 assigned, 1 pending"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Live Threat Feed */}
        <div
          className="col-span-8 rounded-lg border overflow-hidden transition-all duration-300"
          style={{
            backgroundColor: '#0A1225',
            borderColor: criticalFlash ? '#EF4444' : '#0F2040',
            boxShadow: criticalFlash ? '0 0 0 2px #EF444440' : 'none',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: '#0F2040' }}
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: '#EF4444' }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: '#EF4444' }}
                />
              </span>
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                LIVE THREAT FEED
              </span>
            </div>
            <span
              className="text-xs"
              style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}
            >
              auto-scrolling · real-time
            </span>
          </div>
          <div className="overflow-hidden" style={{ maxHeight: '380px' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid #0F2040' }}>
                  {['When', 'Threat Type', 'Source IP', 'Client', 'Severity', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left font-medium uppercase tracking-wider"
                      style={{
                        color: '#475569',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feedRows.map((t, i) => {
                  const isCritical = t.severity === 'Critical';
                  const isNewRow = newIds.has(t.id);
                  return (
                    <tr
                      key={t.id}
                      style={{
                        borderBottom: '1px solid #0F204060',
                        opacity: i === 0 ? 1 : 1 - i * 0.04,
                        backgroundColor: i === 0 ? '#0D1A30' : 'transparent',
                        animation: isNewRow ? 'slide-in-top 0.5s cubic-bezier(0.4,0,0.2,1) both' : undefined,
                        borderLeft: isCritical ? '3px solid #EF4444' : '3px solid transparent',
                      }}
                    >
                      <td
                        className="px-3 py-2"
                        style={{ color: '#00D4AA', fontFamily: "'Space Mono', monospace", whiteSpace: 'nowrap' }}
                      >
                        {relativeTime(t.arrivedAt)}
                      </td>
                      <td className="px-3 py-2 font-medium" style={{ color: '#F1F5F9' }}>
                        {t.threatType}
                      </td>
                      <td
                        className="px-3 py-2"
                        style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}
                      >
                        {t.sourceIp}
                      </td>
                      <td className="px-3 py-2" style={{ color: '#94A3B8' }}>
                        {t.targetClient}
                      </td>
                      <td className="px-3 py-2">
                        {isCritical ? (
                          <span
                            className="px-2 py-0.5 rounded text-xs font-bold"
                            style={{
                              color: '#EF4444',
                              backgroundColor: '#EF444420',
                              fontFamily: "'Space Mono', monospace",
                              animation: 'pulse-border 1.5s ease-in-out infinite',
                            }}
                          >
                            <style>{`
                              @keyframes pulse-border {
                                0%, 100% { box-shadow: 0 0 0 0 #EF444440; }
                                50%       { box-shadow: 0 0 0 3px #EF444420; }
                              }
                            `}</style>
                            Critical
                          </span>
                        ) : (
                          <SeverityBadge severity={t.severity} />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Severity + Compliance */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Donut */}
          <div
            className="rounded-lg border p-4"
            style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Alert Severity Distribution
            </p>
            <AlertDonut />
          </div>

          {/* Compliance — animated bars */}
          <CompliancePanel />
        </div>

        {/* Attack Surface Map */}
        <AttackSurfaceGrid />

        {/* Top Vulnerabilities */}
        <CVETable onToast={handleToast} />
      </div>

      {/* Footer */}
      <div
        className="mt-4 px-4 py-2 rounded-lg border flex items-center justify-between"
        style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
      >
        <span
          className="text-xs"
          style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}
        >
          RZ Security Engine v3.4.1 · 0.5 FTE oversight · $98K/yr vs $600K traditional
        </span>
        <span
          className="text-xs"
          style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}
        >
          Last sync: {mono('14:32:07')} · All systems nominal
        </span>
      </div>
    </div>
  );
}
