'use client';

import { useState, useEffect, useRef } from 'react';
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

// ── Animated Posture Score Ring ───────────────────────────────────────────────

function PostureRing({ score }: { score: number }) {
  const r = 68;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r;
  const [animatedOffset, setAnimatedOffset] = useState(circumference); // start at 0 fill

  useEffect(() => {
    const target = circumference * (1 - score / 100);
    const t = setTimeout(() => setAnimatedOffset(target), 100);
    return () => clearTimeout(t);
  }, [score, circumference]);

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
        strokeDashoffset={animatedOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
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

// ── Compliance framework controls expansion ───────────────────────────────────

interface ControlItem {
  name: string;
  pass: boolean;
}

function getControls(fwName: string): ControlItem[] {
  const map: Record<string, ControlItem[]> = {
    'SOC 2': [
      { name: 'CC6.1 — Logical Access Controls', pass: true },
      { name: 'CC6.2 — Authentication & MFA', pass: true },
      { name: 'CC6.3 — Role-based Authorization', pass: true },
      { name: 'CC6.6 — Network Boundary Controls', pass: false },
      { name: 'CC7.1 — System Monitoring & Alerts', pass: true },
      { name: 'CC9.2 — Risk Mitigation Activities', pass: false },
    ],
    'ISO 27001': [
      { name: 'A.5.1 — Information Security Policies', pass: true },
      { name: 'A.8.2 — Information Classification', pass: true },
      { name: 'A.9.4 — System Access Control', pass: true },
      { name: 'A.12.6 — Technical Vulnerability Mgmt', pass: false },
      { name: 'A.16.1 — Incident Mgmt Procedures', pass: true },
      { name: 'A.18.1 — Compliance with Legal Reqs', pass: true },
    ],
    HIPAA: [
      { name: '164.308(a)(1) — Risk Analysis', pass: true },
      { name: '164.308(a)(3) — Workforce Access Mgmt', pass: true },
      { name: '164.312(a)(1) — Access Control', pass: true },
      { name: '164.312(b) — Audit Controls', pass: true },
      { name: '164.312(e)(1) — Transmission Security', pass: true },
      { name: '164.314(a) — BA Agreement Requirements', pass: true },
    ],
    'PCI DSS': [
      { name: 'Req 1 — Network Security Controls', pass: true },
      { name: 'Req 3 — Protect Stored Account Data', pass: true },
      { name: 'Req 6.4 — Public-facing Web Apps', pass: false },
      { name: 'Req 8 — Identify Users & Authenticate', pass: true },
      { name: 'Req 10.7 — Audit Log Failures', pass: false },
      { name: 'Req 12 — Org Security Policy', pass: true },
    ],
    GDPR: [
      { name: 'Art. 5 — Data Processing Principles', pass: true },
      { name: 'Art. 25 — Privacy by Design', pass: true },
      { name: 'Art. 32 — Security of Processing', pass: true },
      { name: 'Art. 33 — Breach Notification', pass: true },
      { name: 'Art. 35 — DPIA Requirements', pass: false },
      { name: 'Art. 44 — Data Transfer Restrictions', pass: true },
    ],
  };
  return map[fwName] ?? [];
}

function ComplianceCard({ fw }: { fw: typeof COMPLIANCE_FRAMEWORKS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const controls = getControls(fw.name);

  return (
    <div
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
        className="rounded px-2 py-1.5 border mb-3"
        style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
      >
        <p className="text-xs font-medium" style={{ color: '#94A3B8' }}>{fw.nextAction}</p>
        <p className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
          Due: {fw.nextActionDue}
        </p>
      </div>
      {fw.certExpiry && (
        <p className="text-xs mb-2 text-center" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
          Expires: {fw.certExpiry}
        </p>
      )}

      {/* View Controls button */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full py-1.5 rounded text-xs font-bold transition-all"
        style={{
          backgroundColor: expanded ? '#818CF820' : '#0F2040',
          color: expanded ? '#818CF8' : '#475569',
          border: `1px solid ${expanded ? '#818CF840' : '#1E3A5F'}`,
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {expanded ? '▲ Hide Controls' : '▼ View Controls'}
      </button>

      {/* Expanded control items */}
      {expanded && (
        <div className="mt-3 flex flex-col gap-1.5">
          {controls.map((ctrl) => (
            <div
              key={ctrl.name}
              className="flex items-start gap-2 rounded px-2 py-1.5"
              style={{ backgroundColor: '#0A1225', border: `1px solid ${ctrl.pass ? '#00D4AA20' : '#EF444420'}` }}
            >
              <span
                className="text-xs font-bold flex-shrink-0 mt-0.5"
                style={{ color: ctrl.pass ? '#00D4AA' : '#EF4444', fontFamily: "'Space Mono', monospace" }}
              >
                {ctrl.pass ? '✓' : '✗'}
              </span>
              <span className="text-xs" style={{ color: ctrl.pass ? '#94A3B8' : '#F87171', lineHeight: 1.4 }}>
                {ctrl.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Session row with terminate animation ──────────────────────────────────────

function SessionRow({
  s,
  onTerminated,
}: {
  s: typeof ACTIVE_SESSIONS[0];
  onTerminated: (id: string) => void;
}) {
  const [terminating, setTerminating] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  function handleTerminate() {
    setTerminating(true);
    setTimeout(() => {
      setTerminating(false);
      setFadeOut(true);
      setTimeout(() => onTerminated(s.id), 400);
    }, 500);
  }

  return (
    <tr
      className="hover:bg-white/[0.02] transition-all"
      style={{
        borderBottom: '1px solid #0F204060',
        backgroundColor: fadeOut
          ? '#EF444420'
          : s.status === 'Suspicious'
          ? '#EF444408'
          : 'transparent',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.4s ease, background-color 0.3s ease',
      }}
    >
      <td className="px-3 py-2.5">
        <p className="font-medium truncate max-w-[120px] text-xs" style={{ color: s.status === 'Suspicious' ? '#EF4444' : '#F1F5F9' }}>
          {s.user.split('@')[0]}
        </p>
        <p style={{ color: '#475569', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>@{s.user.split('@')[1]}</p>
      </td>
      <td className="px-3 py-2.5 text-xs" style={{ color: '#94A3B8' }}>{s.role}</td>
      <td className="px-3 py-2.5 text-xs">
        <p style={{ color: '#94A3B8' }}>{s.location}</p>
        <p style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>{s.ip}</p>
      </td>
      <td className="px-3 py-2.5 text-xs">
        <p style={{ color: '#94A3B8' }}>{s.device}</p>
        <p style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>{s.os}</p>
      </td>
      <td className="px-3 py-2.5 text-xs" style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}>
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
            onClick={handleTerminate}
            disabled={terminating || fadeOut}
            className="px-2 py-1 rounded text-xs font-bold transition-all hover:opacity-90 flex items-center gap-1.5"
            style={{
              backgroundColor: '#EF444420',
              color: '#EF4444',
              border: '1px solid #EF444440',
              fontFamily: "'Space Mono', monospace",
              minWidth: '76px',
              justifyContent: 'center',
            }}
          >
            {terminating ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    border: '2px solid #EF444460',
                    borderTopColor: '#EF4444',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }}
                />
                <span>Wait...</span>
              </>
            ) : (
              'Terminate'
            )}
          </button>
        ) : (
          <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>—</span>
        )}
      </td>
    </tr>
  );
}

// ── Scan phase config ─────────────────────────────────────────────────────────

const SCAN_PHASES = [
  { label: 'Initializing...', duration: 700 },
  { label: 'Scanning endpoints...', duration: 1400 },
  { label: 'Analyzing results...', duration: 1200 },
  { label: 'Complete', duration: 700 },
];

// ── Blinking cursor component ─────────────────────────────────────────────────

function BlinkingCursor() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ color: '#00D4AA', opacity: visible ? 1 : 0, transition: 'opacity 0.1s', fontFamily: "'Space Mono', monospace" }}>
      █
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SPIN_STYLE = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slide-in-bottom {
  from { transform: translateY(12px); opacity: 0; }
  to   { transform: translateY(0);   opacity: 1; }
}
`;

export default function SecurityPage() {
  const [terminatedSessions, setTerminatedSessions] = useState<Set<string>>(new Set());
  const [scanPhase, setScanPhase] = useState<string | null>(null);
  const [scanCritical, setScanCritical] = useState(VULN_SCAN.critical);
  const styleInjected = useRef(false);

  useEffect(() => {
    if (styleInjected.current) return;
    styleInjected.current = true;
    const el = document.createElement('style');
    el.textContent = SPIN_STYLE;
    document.head.appendChild(el);
  }, []);

  function handleTerminate(id: string) {
    setTerminatedSessions((prev) => new Set(prev).add(id));
  }

  function handleTerminateAllHighRisk() {
    const highRisk = ACTIVE_SESSIONS.filter((s) => s.riskScore >= 70).map((s) => s.id);
    setTerminatedSessions((prev) => {
      const next = new Set(prev);
      highRisk.forEach((id) => next.add(id));
      return next;
    });
  }

  function handleScan() {
    if (scanPhase !== null) return;
    let phaseIdx = 0;

    function nextPhase() {
      if (phaseIdx >= SCAN_PHASES.length) {
        setScanPhase(null);
        return;
      }
      const phase = SCAN_PHASES[phaseIdx];
      setScanPhase(phase.label);

      // change critical count mid-scan for visual drama
      if (phase.label === 'Analyzing results...') {
        setScanCritical(Math.max(0, VULN_SCAN.critical - 1));
      }

      phaseIdx++;
      setTimeout(nextPhase, phase.duration);
    }

    nextPhase();
  }

  const activeSessions = ACTIVE_SESSIONS.filter((s) => !terminatedSessions.has(s.id));
  const highRiskVisible = activeSessions.filter((s) => s.riskScore >= 70).length;

  const scanRunning = scanPhase !== null && scanPhase !== 'Complete';
  const scanComplete = scanPhase === 'Complete';

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#070D1A', color: '#F1F5F9' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Security &amp; Compliance
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
                disabled={scanRunning}
                className="px-2.5 py-1 rounded text-xs font-bold transition-all"
                style={{
                  backgroundColor: scanComplete ? '#00D4AA20' : scanRunning ? '#F59E0B20' : '#0D6EFD20',
                  color: scanComplete ? '#00D4AA' : scanRunning ? '#F59E0B' : '#0D6EFD',
                  border: `1px solid ${scanComplete ? '#00D4AA40' : scanRunning ? '#F59E0B40' : '#0D6EFD40'}`,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {scanPhase !== null ? (scanComplete ? '✓ Complete' : `◎ ${scanPhase}`) : '▶ Run Scan'}
              </button>
            </div>
            <p className="text-xs mb-3" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
              Last: {VULN_SCAN.lastScan} · {VULN_SCAN.duration} · {VULN_SCAN.totalHosts} hosts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Critical', count: scanCritical, color: '#EF4444' },
                { label: 'High', count: VULN_SCAN.high, color: '#F59E0B' },
                { label: 'Medium', count: VULN_SCAN.medium, color: '#0D6EFD' },
                { label: 'Low', count: VULN_SCAN.low, color: '#475569' },
              ].map((v) => (
                <div
                  key={v.label}
                  className="rounded-lg px-3 py-2 text-center border"
                  style={{ backgroundColor: v.color + '12', borderColor: v.color + '30' }}
                >
                  <p
                    className="text-xl font-bold"
                    style={{
                      color: v.color,
                      fontFamily: "'Space Mono', monospace",
                      transition: 'color 0.3s',
                    }}
                  >
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
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                {activeSessions.length} sessions · {activeSessions.filter((s) => s.status === 'Suspicious').length} suspicious
              </span>
              {highRiskVisible > 0 && (
                <button
                  onClick={handleTerminateAllHighRisk}
                  className="px-2.5 py-1 rounded text-xs font-bold transition-all"
                  style={{
                    backgroundColor: '#EF444420',
                    color: '#EF4444',
                    border: '1px solid #EF444440',
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  ✕ Terminate All High Risk
                </button>
              )}
            </div>
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
                <SessionRow key={s.id} s={s} onTerminated={handleTerminate} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Log — terminal style */}
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
            {AUDIT_LOG.map((entry, idx) => {
              const isLast = idx === AUDIT_LOG.length - 1;
              return (
                <div
                  key={entry.id}
                  className="px-4 py-2.5 border-b hover:bg-white/[0.02] transition-colors"
                  style={{
                    borderColor: '#0F204060',
                    animation: 'slide-in-bottom 0.35s ease both',
                    animationDelay: `${idx * 40}ms`,
                  }}
                >
                  <div className="flex items-start gap-2">
                    <SeverityDot severity={entry.severity} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold" style={{ color: '#F1F5F9', fontFamily: "'Space Mono', monospace" }}>
                          {entry.action}
                          {isLast && <BlinkingCursor />}
                        </span>
                        <AuditResultBadge result={entry.result} />
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}>
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
              );
            })}
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
            5 frameworks tracked · click View Controls for details
          </span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {COMPLIANCE_FRAMEWORKS.map((fw) => (
            <ComplianceCard key={fw.name} fw={fw} />
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
