'use client';

import { useState } from 'react';
import {
  SECURITY_POSTURE_SCORE,
  POSTURE_TREND_DELTA,
  POSTURE_CATEGORIES,
  ZERO_TRUST_METRICS,
  ACTIVE_SESSIONS,
  AUDIT_LOG,
  COMPLIANCE_FRAMEWORKS,
  VULN_SCAN,
  ENCRYPTION_STATUS,
} from '@/lib/mock-data/security';

// ── Helpers ───────────────────────────────────────────────────────────────────

function riskColor(score: number): string {
  if (score >= 70) return '#EF4444';
  if (score >= 40) return '#F59E0B';
  if (score >= 20) return '#818CF8';
  return '#00D4AA';
}

function progressColor(pct: number): string {
  if (pct >= 90) return '#00D4AA';
  if (pct >= 70) return '#F59E0B';
  return '#EF4444';
}

function AuditResultBadge({ result }: { result: string }) {
  const styles: Record<string, { color: string; bg: string }> = {
    Success: { color: '#00D4AA', bg: '#00D4AA18' },
    Failure: { color: '#EF4444', bg: '#EF444418' },
    Blocked: { color: '#F59E0B', bg: '#F59E0B18' },
  };
  const s = styles[result] ?? styles.Success;
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-bold"
      style={{ color: s.color, backgroundColor: s.bg, fontFamily: "'Space Mono', monospace" }}
    >
      {result}
    </span>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const color = severity === 'Critical' ? '#EF4444' : severity === 'Warning' ? '#F59E0B' : '#475569';
  return <span className="w-2 h-2 rounded-full flex-shrink-0 inline-block" style={{ backgroundColor: color }} />;
}

// ── Posture Score Ring ────────────────────────────────────────────────────────

function PostureRing({ score }: { score: number }) {
  const r = 68;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference * (1 - score / 100);
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0F2040" strokeWidth="10" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#00D4AA"
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 10} textAnchor="middle" fill="#F1F5F9" fontSize="32" fontWeight="bold" fontFamily="'Space Mono', monospace">
        {score}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#475569" fontSize="11" fontFamily="'Space Mono', monospace">
        / 100
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#00D4AA" fontSize="10" fontFamily="'Space Mono', monospace">
        SECURE
      </text>
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  const [terminatedSessions, setTerminatedSessions] = useState<Set<string>>(new Set());
  const [scanRunning, setScanRunning] = useState(false);

  function handleTerminate(id: string) {
    setTerminatedSessions((prev) => new Set(prev).add(id));
  }

  function handleScan() {
    setScanRunning(true);
    setTimeout(() => setScanRunning(false), 3000);
  }

  const activeSessions = ACTIVE_SESSIONS.filter((s) => !terminatedSessions.has(s.id));

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#070D1A', color: '#F1F5F9' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Security & Compliance
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#475569' }}>
            Zero Trust Architecture · AES-256 · TLS 1.3 · HashiCorp Vault · SOC 2 Type II In Progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-2 rounded-lg border text-xs font-bold"
            style={{ backgroundColor: '#00D4AA15', borderColor: '#00D4AA40', color: '#00D4AA', fontFamily: "'Space Mono', monospace" }}
          >
            ✓ Zero Trust Active
          </div>
          <div
            className="px-3 py-2 rounded-lg border text-xs font-bold"
            style={{ backgroundColor: '#818CF815', borderColor: '#818CF840', color: '#818CF8', fontFamily: "'Space Mono', monospace" }}
          >
            SOC 2 Type II — In Progress
          </div>
        </div>
      </div>

      {/* Top row: Posture + Zero Trust + Encryption */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Security Posture Score */}
        <div
          className="col-span-4 rounded-lg border p-5"
          style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
        >
          <p className="text-sm font-semibold mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Security Posture Score
          </p>
          <div className="flex items-center gap-5">
            <PostureRing score={SECURITY_POSTURE_SCORE} />
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: '#00D4AA', fontFamily: "'Space Mono', monospace" }}>
                  ↑ {POSTURE_TREND_DELTA}
                </span>
              </div>
              <div className="flex flex-col gap-2.5">
                {POSTURE_CATEGORIES.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs" style={{ color: '#94A3B8' }}>{cat.name}</span>
                      <span className="text-xs font-bold" style={{ color: progressColor(cat.score), fontFamily: "'Space Mono', monospace" }}>
                        {cat.score}
                        <span style={{ color: cat.trend === 'up' ? '#00D4AA' : cat.trend === 'down' ? '#EF4444' : '#475569', marginLeft: 3 }}>
                          {cat.trend === 'up' ? '↑' : cat.trend === 'down' ? '↓' : '—'}
                        </span>
                      </span>
                    </div>
                    <div className="h-1 rounded-full" style={{ backgroundColor: '#0F2040' }}>
                      <div className="h-1 rounded-full" style={{ width: `${cat.score}%`, backgroundColor: progressColor(cat.score) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Zero Trust Status */}
        <div
          className="col-span-4 rounded-lg border p-5"
          style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
        >
          <p className="text-sm font-semibold mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Zero Trust Status
          </p>
          <div className="flex flex-col gap-3">
            {ZERO_TRUST_METRICS.map((m) => (
              <div
                key={m.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg border"
                style={{ backgroundColor: '#060D1A', borderColor: '#0F2040' }}
              >
                <div>
                  <p className="text-xs font-medium" style={{ color: '#F1F5F9' }}>{m.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>{m.detail}</p>
                </div>
                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: m.status === 'good' ? '#00D4AA' : m.status === 'warn' ? '#F59E0B' : '#EF4444',
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {typeof m.value === 'number' ? m.value + (m.unit ?? '') : m.value}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: m.status === 'good' ? '#00D4AA' : m.status === 'warn' ? '#F59E0B' : '#EF4444' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Encryption Status + Vuln Scanner */}
        <div className="col-span-4 flex flex-col gap-4">
          <div
            className="rounded-lg border p-4"
            style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
          >
            <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Data Encryption
            </p>
            <div className="flex flex-col gap-2">
              {ENCRYPTION_STATUS.map((e) => (
                <div key={e.label} className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: '#0F2040' }}>
                  <div>
                    <p className="text-xs font-medium" style={{ color: '#F1F5F9' }}>{e.label}</p>
                    <p className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>{e.standard}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#00D4AA', fontFamily: "'Space Mono', monospace" }}>
                    ✓ Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vuln Scanner */}
          <div
            className="rounded-lg border p-4 flex-1"
            style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Vulnerability Scanner
              </p>
              <button
                onClick={handleScan}
                className="px-2.5 py-1 rounded text-xs font-bold transition-all"
                style={{
                  backgroundColor: scanRunning ? '#00D4AA20' : '#0D6EFD20',
                  color: scanRunning ? '#00D4AA' : '#0D6EFD',
                  border: `1px solid ${scanRunning ? '#00D4AA40' : '#0D6EFD40'}`,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {scanRunning ? '◎ Scanning...' : '▶ Run Scan'}
              </button>
            </div>
            <p className="text-xs mb-3" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
              Last: {VULN_SCAN.lastScan} · {VULN_SCAN.duration} · {VULN_SCAN.totalHosts} hosts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Critical', count: VULN_SCAN.critical, color: '#EF4444' },
                { label: 'High', count: VULN_SCAN.high, color: '#F59E0B' },
                { label: 'Medium', count: VULN_SCAN.medium, color: '#0D6EFD' },
                { label: 'Low', count: VULN_SCAN.low, color: '#475569' },
              ].map((v) => (
                <div
                  key={v.label}
                  className="rounded-lg px-3 py-2 text-center border"
                  style={{ backgroundColor: v.color + '12', borderColor: v.color + '30' }}
                >
                  <p className="text-xl font-bold" style={{ color: v.color, fontFamily: "'Space Mono', monospace" }}>
                    {v.count}
                  </p>
                  <p className="text-xs" style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}>
                    {v.label}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: '#00D4AA', fontFamily: "'Space Mono', monospace" }}>
              ✓ {VULN_SCAN.patchedLast7Days} patched in last 7 days
            </p>
          </div>
        </div>
      </div>

      {/* Second row: Active Sessions + Audit Log */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Active Sessions */}
        <div
          className="col-span-7 rounded-lg border overflow-hidden"
          style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#0F2040' }}>
            <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Active Sessions
            </p>
            <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
              {activeSessions.length} sessions · {activeSessions.filter((s) => s.status === 'Suspicious').length} suspicious
            </span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid #0F2040' }}>
                {['User', 'Role', 'Location / IP', 'Device', 'Activity', 'Risk', 'Action'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium uppercase tracking-wider" style={{ color: '#475569', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((s) => (
                <tr
                  key={s.id}
                  className="hover:bg-white/[0.02] transition-colors"
                  style={{
                    borderBottom: '1px solid #0F204060',
                    backgroundColor: s.status === 'Suspicious' ? '#EF444408' : 'transparent',
                  }}
                >
                  <td className="px-3 py-2.5">
                    <p className="font-medium truncate max-w-[120px]" style={{ color: s.status === 'Suspicious' ? '#EF4444' : '#F1F5F9' }}>
                      {s.user.split('@')[0]}
                    </p>
                    <p style={{ color: '#475569', fontFamily: "'Space Mono', monospace', fontSize: '10px'", fontSize: '10px' }}>@{s.user.split('@')[1]}</p>
                  </td>
                  <td className="px-3 py-2.5 text-xs" style={{ color: '#94A3B8' }}>{s.role}</td>
                  <td className="px-3 py-2.5">
                    <p style={{ color: '#94A3B8' }}>{s.location}</p>
                    <p style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>{s.ip}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p style={{ color: '#94A3B8' }}>{s.device}</p>
                    <p style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>{s.os}</p>
                  </td>
                  <td className="px-3 py-2.5" style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}>
                    {s.lastActivity}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-xs font-bold"
                        style={{ color: riskColor(s.riskScore), fontFamily: "'Space Mono', monospace" }}
                      >
                        {s.riskScore}
                      </span>
                      <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: '#0F2040' }}>
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${s.riskScore}%`, backgroundColor: riskColor(s.riskScore) }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {s.riskScore >= 40 ? (
                      <button
                        onClick={() => handleTerminate(s.id)}
                        className="px-2 py-1 rounded text-xs font-bold transition-all hover:opacity-90"
                        style={{
                          backgroundColor: '#EF444420',
                          color: '#EF4444',
                          border: '1px solid #EF444440',
                          fontFamily: "'Space Mono', monospace",
                        }}
                      >
                        Terminate
                      </button>
                    ) : (
                      <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Log */}
        <div
          className="col-span-5 rounded-lg border overflow-hidden"
          style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#0F2040' }}>
            <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Audit Log
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#00D4AA' }} />
              <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                immutable · tamper-evident
              </span>
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
            {AUDIT_LOG.map((entry) => (
              <div
                key={entry.id}
                className="px-4 py-2.5 border-b hover:bg-white/[0.02] transition-colors"
                style={{ borderColor: '#0F204060' }}
              >
                <div className="flex items-start gap-2">
                  <SeverityDot severity={entry.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold" style={{ color: '#F1F5F9', fontFamily: "'Space Mono', monospace" }}>
                        {entry.action}
                      </span>
                      <AuditResultBadge result={entry.result} />
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#94A3B8' }}>
                      {entry.actor} → {entry.resource}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                        {entry.timestamp}
                      </span>
                      <span className="text-xs" style={{ color: '#475569' }}>·</span>
                      <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                        {entry.ip}
                      </span>
                      <span className="text-xs" style={{ color: '#475569' }}>·</span>
                      <span className="text-xs" style={{ color: '#475569' }}>
                        {entry.actorRole}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div
        className="rounded-lg border p-5"
        style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Compliance Frameworks
          </p>
          <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
            5 frameworks tracked
          </span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {COMPLIANCE_FRAMEWORKS.map((fw) => (
            <div
              key={fw.name}
              className="rounded-lg border p-4"
              style={{ backgroundColor: '#060D1A', borderColor: progressColor(fw.progress) + '40' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-lg font-black"
                  style={{ color: progressColor(fw.progress), fontFamily: "'Space Mono', monospace" }}
                >
                  {fw.name}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{
                    color: fw.status === 'Certified' ? '#00D4AA' : fw.status === 'In Progress' ? '#818CF8' : '#F59E0B',
                    backgroundColor: fw.status === 'Certified' ? '#00D4AA18' : fw.status === 'In Progress' ? '#818CF818' : '#F59E0B18',
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {fw.status}
                </span>
              </div>
              <p className="text-xs mb-3" style={{ color: '#475569' }}>{fw.fullName}</p>
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: '#94A3B8' }}>Progress</span>
                  <span className="text-xs font-bold" style={{ color: progressColor(fw.progress), fontFamily: "'Space Mono', monospace" }}>
                    {fw.progress}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: '#0F2040' }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${fw.progress}%`, backgroundColor: progressColor(fw.progress) }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs mb-3" style={{ fontFamily: "'Space Mono', monospace" }}>
                <span style={{ color: '#00D4AA' }}>✓ {fw.controls.passed}</span>
                {fw.controls.failing > 0 && (
                  <span style={{ color: '#EF4444' }}>✗ {fw.controls.failing}</span>
                )}
                <span style={{ color: '#475569' }}>/ {fw.controls.total}</span>
              </div>
              <div
                className="rounded px-2 py-1.5 border"
                style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
              >
                <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>{fw.nextAction}</p>
                <p className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                  Due: {fw.nextActionDue}
                </p>
              </div>
              {fw.certExpiry && (
                <p className="text-xs mt-2 text-center" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                  Expires: {fw.certExpiry}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-4 px-4 py-2 rounded-lg border flex items-center justify-between"
        style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
      >
        <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
          RZ Security Platform · Zero Trust · AES-256 · TLS 1.3 · HashiCorp Vault · Immutable Audit Trail
        </span>
        <span className="text-xs" style={{ color: '#00D4AA', fontFamily: "'Space Mono', monospace" }}>
          ✓ Posture score: {SECURITY_POSTURE_SCORE}/100 · {POSTURE_TREND_DELTA}
        </span>
      </div>
    </div>
  );
}
