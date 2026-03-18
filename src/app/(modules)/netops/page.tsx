'use client';

import { useState, useEffect } from 'react';
import {
  THREAT_FEED,
  COMPLIANCE_FRAMEWORKS,
  TOP_VULNERABILITIES,
  ENDPOINT_GRID,
  ALERT_SEVERITY_COUNTS,
  SOC_METRICS,
  type ThreatSeverity,
  type ThreatStatus,
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

// ── Sub-components ────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div
      className="flex flex-col gap-1 px-5 py-4 rounded-lg border"
      style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
    >
      <span className="text-xs uppercase tracking-widest" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
        {label}
      </span>
      <span className="text-2xl font-bold" style={{ color: '#F1F5F9', fontFamily: "'Space Mono', monospace" }}>
        {value}
      </span>
      {sub && (
        <span className="text-xs" style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}>
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
      className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
      style={{
        color: isAuto ? '#00D4AA' : isWarn ? '#F59E0B' : '#818CF8',
        backgroundColor: isAuto ? '#00D4AA18' : isWarn ? '#F59E0B18' : '#818CF818',
        fontFamily: "'Space Mono', monospace",
      }}
    >
      {isAuto ? '✓ Auto-Remediated' : isWarn ? '⚠ Human Review' : '◎ Investigating'}
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
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#F1F5F9" fontSize="18" fontWeight="bold" fontFamily="'Space Mono', monospace">
          {total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="'Space Mono', monospace">
          TOTAL
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-xs" style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}>
              {seg.label}
            </span>
            <span className="text-xs font-bold ml-auto pl-3" style={{ color: '#F1F5F9', fontFamily: "'Space Mono', monospace" }}>
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NetOpsPage() {
  const [feedOffset, setFeedOffset] = useState(0);
  const visibleThreats = [...THREAT_FEED.slice(feedOffset), ...THREAT_FEED.slice(0, feedOffset)];

  useEffect(() => {
    const t = setInterval(() => {
      setFeedOffset((o) => (o + 1) % THREAT_FEED.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#070D1A', color: '#F1F5F9' }}>
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
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#00D4AA' }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#00D4AA' }} />
          </span>
          <span className="text-xs font-bold" style={{ fontFamily: "'Space Mono', monospace", color: '#00D4AA' }}>
            RZ SOC ACTIVE — ZERO-TOUCH MODE
          </span>
          <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
            next action in <LiveCounter />
          </span>
        </div>
      </div>

      {/* Metrics bar */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <MetricCard label="Threats Today" value={SOC_METRICS.threatsToday.toLocaleString()} sub="+14% from yesterday" />
        <MetricCard label="Auto-Remediated" value={`${SOC_METRICS.autoRemediatedPct}%`} sub="4,006 events handled" />
        <MetricCard label="Avg Response Time" value={SOC_METRICS.avgResponseTime} sub="vs 45 min traditional" />
        <MetricCard label="Clients Monitored" value={SOC_METRICS.clientsMonitored} sub="All endpoints active" />
        <MetricCard label="Open Incidents" value={SOC_METRICS.openIncidents} sub="2 assigned, 1 pending" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Live Threat Feed */}
        <div
          className="col-span-8 rounded-lg border overflow-hidden"
          style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#0F2040' }}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#EF4444' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#EF4444' }} />
              </span>
              <span className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                LIVE THREAT FEED
              </span>
            </div>
            <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
              auto-scrolling · real-time
            </span>
          </div>
          <div className="overflow-hidden" style={{ maxHeight: '380px' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid #0F2040' }}>
                  {['Time', 'Threat Type', 'Source IP', 'Client', 'Severity', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-medium uppercase tracking-wider" style={{ color: '#475569', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleThreats.slice(0, 12).map((t, i) => (
                  <tr
                    key={t.id}
                    className="transition-all duration-500"
                    style={{
                      borderBottom: '1px solid #0F204060',
                      opacity: i === 0 ? 1 : 1 - i * 0.04,
                      backgroundColor: i === 0 ? '#0D1A30' : 'transparent',
                    }}
                  >
                    <td className="px-3 py-2" style={{ color: '#00D4AA', fontFamily: "'Space Mono', monospace" }}>{t.timestamp}</td>
                    <td className="px-3 py-2 font-medium" style={{ color: '#F1F5F9' }}>{t.threatType}</td>
                    <td className="px-3 py-2" style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}>{t.sourceIp}</td>
                    <td className="px-3 py-2" style={{ color: '#94A3B8' }}>{t.targetClient}</td>
                    <td className="px-3 py-2">
                      <SeverityBadge severity={t.severity} />
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                ))}
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
            <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Alert Severity Distribution
            </p>
            <AlertDonut />
          </div>

          {/* Compliance */}
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
                  <span className="text-xs font-medium" style={{ color: '#F1F5F9', minWidth: '80px' }}>
                    {fw.name}
                  </span>
                  <div className="flex-1 mx-3 h-1.5 rounded-full" style={{ backgroundColor: '#0F2040' }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${fw.score}%`, backgroundColor: COMPLIANCE_STATUS_COLOR[fw.status] }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold w-10 text-right"
                    style={{ color: COMPLIANCE_STATUS_COLOR[fw.status], fontFamily: "'Space Mono', monospace" }}
                  >
                    {fw.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attack Surface Map */}
        <div
          className="col-span-5 rounded-lg border p-4"
          style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Attack Surface Map
            </p>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
              {['healthy', 'warning', 'critical', 'offline'].map((s) => (
                <span key={s} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ENDPOINT_STATUS_COLOR[s] }} />
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
            {ENDPOINT_GRID.map((ep) => (
              <div
                key={ep.id}
                className="rounded-sm aspect-square cursor-pointer transition-transform hover:scale-125"
                title={`${ep.hostname} — ${ep.status}`}
                style={{ backgroundColor: ENDPOINT_STATUS_COLOR[ep.status] + '99' }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
            <span>100 endpoints across 10 clients</span>
            <span style={{ color: '#00D4AA' }}>
              {ENDPOINT_GRID.filter((e) => e.status === 'healthy').length} healthy
            </span>
          </div>
        </div>

        {/* Top Vulnerabilities */}
        <div
          className="col-span-7 rounded-lg border p-4"
          style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
        >
          <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Top Vulnerabilities
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid #0F2040' }}>
                {['CVE', 'Description', 'CVSS', 'Clients Affected', 'Patch Status'].map((h) => (
                  <th key={h} className="pb-2 text-left font-medium uppercase tracking-wider" style={{ color: '#475569', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_VULNERABILITIES.map((v) => (
                <tr key={v.cve} style={{ borderBottom: '1px solid #0F204060' }}>
                  <td className="py-2.5 pr-3" style={{ color: '#818CF8', fontFamily: "'Space Mono', monospace", whiteSpace: 'nowrap' }}>
                    {v.cve}
                  </td>
                  <td className="py-2.5 pr-3" style={{ color: '#F1F5F9' }}>{v.description}</td>
                  <td className="py-2.5 pr-3">
                    <span
                      className="font-bold"
                      style={{
                        color: v.cvss >= 9 ? '#EF4444' : v.cvss >= 7 ? '#F59E0B' : '#94A3B8',
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {v.cvss}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3" style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}>
                    {v.affectedClients}
                  </td>
                  <td className="py-2.5">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{
                        color: PATCH_COLORS[v.patchStatus],
                        backgroundColor: PATCH_COLORS[v.patchStatus] + '20',
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {v.patchStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-4 px-4 py-2 rounded-lg border flex items-center justify-between"
        style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
      >
        <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
          RZ Security Engine v3.4.1 · 0.5 FTE oversight · $98K/yr vs $600K traditional
        </span>
        <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
          Last sync: {mono('14:32:07')} · All systems nominal
        </span>
      </div>
    </div>
  );
}
