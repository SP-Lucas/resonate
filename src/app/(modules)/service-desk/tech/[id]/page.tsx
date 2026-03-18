'use client';

import React, { useState, useEffect } from 'react';
import { MOCK_TECHS, MOCK_TICKETS, MOCK_QUEUE_STATS } from '@/lib/mock-data/service-desk';
import SLATimer, { slaColor } from '@/components/service-desk/SLATimer';

// ── Types ──────────────────────────────────────────────────────────────────

interface PageProps {
  params: { id: string };
}

type TechStatus = 'available' | 'busy' | 'wrapping' | 'break';

const STATUSES: Record<TechStatus, { label: string; color: string }> = {
  available: { label: 'Available',    color: '#00D4AA' },
  busy:      { label: 'Busy',         color: '#F59E0B' },
  wrapping:  { label: 'Wrapping Up',  color: '#818CF8' },
  break:     { label: 'On Break',     color: '#64748B' },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function priColor(p: number): string {
  if (p === 1) return '#EF4444';
  if (p === 2) return '#F59E0B';
  return '#3B82F6';
}

function priLabel(p: number): string {
  if (p === 1) return 'P1 CRITICAL';
  if (p === 2) return 'P2 HIGH';
  return 'P3 NORMAL';
}

// ── Sub-Components ─────────────────────────────────────────────────────────

function SLARing({ seconds, total }: { seconds: number; total: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, seconds / total));
  const col = slaColor(seconds);
  return (
    <svg width="52" height="52" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#0F2040" strokeWidth="3.5" />
      <circle
        cx="26" cy="26" r={r}
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

function SkillDots({ level }: { level: number }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          width: 7,
          height: 7,
          borderRadius: 2,
          background: i <= level ? '#00D4AA' : '#0F2040',
          boxShadow: i <= level ? '0 0 4px #00D4AA55' : 'none',
        }} />
      ))}
    </div>
  );
}

function StatBox({ label, value, color = '#94A3B8' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: '10px 12px', background: '#060D1A', border: '1px solid #0F2040', borderRadius: 8 }}>
      <div style={{ fontSize: 10, color: '#475569', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 as unknown as string }}>{label}</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 17, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function TechPage({ params }: PageProps) {
  const tech = MOCK_TECHS.find(t => t.id === params.id) ?? MOCK_TECHS[0];

  // Tickets assigned to this tech, ordered by priority then SLA
  const techTickets = MOCK_TICKETS
    .filter(t => t.assignedTo === tech.name)
    .sort((a, b) => a.priority - b.priority || a.slaSeconds - b.slaSeconds);

  const queueTickets = MOCK_TICKETS
    .filter(t => !t.assignedTo || t.assignedTo !== tech.name)
    .sort((a, b) => a.priority - b.priority || a.slaSeconds - b.slaSeconds)
    .slice(0, 8);

  const initialCurrent = techTickets[0] ?? null;
  const initialNext    = techTickets[1] ?? null;

  const [status, setStatus]             = useState<TechStatus>(tech.status);
  const [showMenu, setShowMenu]         = useState(false);
  const [current, setCurrent]           = useState<typeof initialCurrent | null>(initialCurrent);
  const [nextUp, setNextUp]             = useState<typeof initialNext | null>(initialNext);
  const [slaS, setSlaS]                 = useState(initialCurrent?.slaSeconds ?? 0);
  const [shiftMin, setShiftMin]         = useState(tech.shift.remainingMinutes);
  const [completing, setCompleting]     = useState(false);
  const [fetching, setFetching]         = useState(false);
  const [closedToday, setClosedToday]   = useState(tech.closedToday);
  const [showDispatch, setShowDispatch] = useState(false);
  const [queueTotal, setQueueTotal]     = useState(MOCK_QUEUE_STATS.total);

  // SLA countdown
  useEffect(() => {
    const t = setInterval(() => setSlaS(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [current]);

  // Shift countdown
  useEffect(() => {
    const t = setInterval(() => setShiftMin(m => Math.max(0, m - 1 / 60)), 1000);
    return () => clearInterval(t);
  }, []);

  const handleComplete = async () => {
    setCompleting(true);
    await new Promise<void>(r => setTimeout(r, 700));
    setCurrent(null);
    setCompleting(false);
    setFetching(true);
    setClosedToday(n => n + 1);
    setQueueTotal(n => Math.max(0, n - 1));
    await new Promise<void>(r => setTimeout(r, 2200));
    if (nextUp) {
      setCurrent({
        ...nextUp,
        assignedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      });
      setSlaS(nextUp.slaSeconds);
      setNextUp(techTickets[2] ?? null);
    }
    setFetching(false);
  };

  const col = slaColor(slaS);
  const shiftH = Math.floor(shiftMin / 60);
  const shiftM = Math.floor(shiftMin % 60);
  const shiftPct = ((tech.shift.totalMinutes - shiftMin) / tech.shift.totalMinutes) * 100;
  const QUEUE = MOCK_QUEUE_STATS;

  return (
    <div
      onClick={() => showMenu && setShowMenu(false)}
      style={{
        minHeight: '100vh',
        background: '#070D1A',
        color: '#E2E8F0',
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0A1225}::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:2px}
        .btn{cursor:pointer;border:none;transition:all .15s ease;font-family:'DM Sans',sans-serif}
        .btn-complete{background:#00D4AA;color:#070D1A;font-weight:700;font-size:13px}
        .btn-complete:hover{background:#00BF96;transform:translateY(-1px)}
        .btn-secondary:hover{background:#162840!important}
        .btn-danger:hover{background:rgba(239,68,68,.15)!important}
        .status-item:hover{background:#0F2040!important}
        .fade-in{animation:fi .35s ease}
        @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .shimmer{background:linear-gradient(90deg,#0A1225 25%,#132035 50%,#0A1225 75%);background-size:200% 100%;animation:sh 1.4s infinite}
        @keyframes sh{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .pulse{animation:pulse 2s infinite}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .queue-row:hover{background:#0D1B30!important}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        height: 56,
        padding: '0 24px',
        background: '#080E1C',
        borderBottom: '1px solid #0F2040',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: '#00D4AA', letterSpacing: 3 }}>
            RESONATE
          </span>
          <div style={{ width: 1, height: 20, background: '#1E3A5F' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D3B6E, #00D4AA22)',
              border: '1px solid #00D4AA33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              color: '#00D4AA',
            }}>
              {tech.initials}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', lineHeight: 1.3 }}>{tech.name}</div>
              <div style={{ fontSize: 10, color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                Tier {tech.tier} · {tech.id}
              </div>
            </div>
          </div>
        </div>

        {/* Center — shift */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>
              Shift Remaining
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, fontWeight: 700, color: shiftMin < 60 ? '#F59E0B' : '#64748B' }}>
              {shiftH}h {shiftM}m
            </div>
          </div>
          <div style={{ position: 'relative', width: 140, height: 6, background: '#0F2040', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              width: `${shiftPct}%`,
              background: 'linear-gradient(90deg, #00D4AA, #0D6EFD)',
              borderRadius: 3,
              transition: 'width 1s linear',
            }} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>Shift</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#64748B' }}>
              {tech.shift.label}
            </div>
          </div>
        </div>

        {/* Right — status selector */}
        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
          <button
            className="btn"
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px',
              background: '#0A1225', border: '1px solid #1E3A5F', borderRadius: 7,
              color: '#E2E8F0', fontSize: 13, fontWeight: 500,
            }}
          >
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: STATUSES[status].color }} />
            {STATUSES[status].label}
            <span style={{ color: '#475569', fontSize: 9 }}>▾</span>
          </button>
          {showMenu && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 999,
              background: '#0D1B2E', border: '1px solid #1E3A5F', borderRadius: 10,
              overflow: 'hidden', minWidth: 170, boxShadow: '0 16px 40px #00000080',
            }}>
              {(Object.entries(STATUSES) as [TechStatus, { label: string; color: string }][]).map(([k, v]) => (
                <button
                  key={k}
                  className="btn status-item"
                  onClick={() => { setStatus(k); setShowMenu(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '11px 16px',
                    background: status === k ? '#0F2040' : 'transparent',
                    color: '#E2E8F0', fontSize: 13, textAlign: 'left',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
                  {v.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── LEFT — TICKET AREA ── */}
        <div style={{ flex: 1, padding: '20px 16px 20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: '#475569', letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Now Working
            </span>
            <div style={{ flex: 1, height: 1, background: '#0F2040' }} />
            {current && (
              <button
                className="btn"
                onClick={() => setShowDispatch(!showDispatch)}
                style={{ fontSize: 10, color: '#00D4AA88', background: 'none', fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}
              >
                {showDispatch ? 'hide why ▲' : 'why this? ▼'}
              </button>
            )}
          </div>

          {/* Dispatch reason */}
          {showDispatch && current && (
            <div className="fade-in" style={{
              padding: '10px 14px',
              background: '#00D4AA0A', border: '1px solid #00D4AA20', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 18 }}>⚡</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#00D4AA', marginBottom: 2 }}>
                  RZ Dispatch assigned this ticket
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  {current.dispatchReason} · Score {current.dispatchScore}/100
                </div>
              </div>
            </div>
          )}

          {/* ── CURRENT TICKET ── */}
          {fetching ? (
            <div className="shimmer" style={{ height: 380, borderRadius: 14 }} />
          ) : current ? (
            <div className="fade-in" style={{
              background: '#0A1225',
              border: `1px solid ${col}25`,
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: `0 0 50px ${col}08`,
            }}>
              {/* Priority header */}
              <div style={{
                padding: '10px 20px',
                background: `${priColor(current.priority)}0D`,
                borderBottom: `1px solid ${priColor(current.priority)}25`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: priColor(current.priority),
                  boxShadow: `0 0 6px ${priColor(current.priority)}`,
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: priColor(current.priority), letterSpacing: 1 }}>
                  {priLabel(current.priority)}
                </span>
                <span style={{ fontSize: 11, color: '#334155' }}>·</span>
                <span style={{ fontSize: 11, color: '#475569' }}>{current.category}</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#334155' }}>{current.id}</span>
              </div>

              <div style={{ padding: '20px 20px 0' }}>
                {/* Summary */}
                <div style={{ fontSize: 19, fontWeight: 600, color: '#F1F5F9', lineHeight: 1.4, marginBottom: 5 }}>
                  {current.summary}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#00D4AA', marginBottom: 20 }}>
                  {current.client} · {current.site}
                </div>

                {/* Metrics row */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  {/* SLA */}
                  <div style={{
                    flex: 1, padding: '14px 16px',
                    background: `${col}0A`, border: `1px solid ${col}25`, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div>
                      <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>
                        SLA Breach In
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: col, letterSpacing: -1 }}>
                        <SLATimer seconds={slaS} totalSeconds={current.slaTotalSeconds} size="lg" />
                      </div>
                    </div>
                    <SLARing seconds={slaS} total={current.slaTotalSeconds} />
                  </div>

                  {/* Assigned at */}
                  <div style={{ padding: '14px 16px', background: '#060D1A', border: '1px solid #0F2040', borderRadius: 10, minWidth: 110 }}>
                    <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Assigned</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 17, fontWeight: 700, color: '#64748B' }}>
                      {current.assignedAt ?? '—'}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div style={{ padding: '12px 14px', background: '#060D1A', border: '1px solid #0F2040', borderRadius: 10, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Context</div>
                  <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.65 }}>{current.notes}</div>
                </div>

                {/* Contact */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '8px 14px', background: '#060D1A', border: '1px solid #0F2040',
                  borderRadius: 8, marginBottom: 18,
                }}>
                  <span style={{ fontSize: 11, color: '#475569' }}>Contact</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{current.contact.name}</span>
                  <span style={{ width: 1, height: 14, background: '#1E3A5F', display: 'inline-block' }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#00D4AA' }}>{current.contact.phone}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '14px 20px', borderTop: '1px solid #0F2040', display: 'flex', gap: 10 }}>
                <button
                  className="btn btn-complete"
                  onClick={handleComplete}
                  disabled={completing}
                  style={{
                    flex: 1, padding: '12px 20px', borderRadius: 9,
                    opacity: completing ? 0.65 : 1,
                    cursor: completing ? 'not-allowed' : 'pointer',
                    letterSpacing: 0.3,
                  }}
                >
                  {completing ? 'Closing ticket...' : '✓  Mark Complete'}
                </button>
                <button className="btn btn-secondary" style={{
                  padding: '12px 18px', borderRadius: 9, fontSize: 13, fontWeight: 500,
                  background: '#0F2040', border: '1px solid #1E3A5F', color: '#94A3B8',
                }}>
                  Escalate
                </button>
                <button className="btn btn-danger" style={{
                  padding: '12px 18px', borderRadius: 9, fontSize: 13, fontWeight: 500,
                  background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', color: '#EF4444',
                }}>
                  Need Help
                </button>
              </div>
            </div>
          ) : (
            <div className="fade-in" style={{
              background: '#0A1225', border: '1px solid #0F2040', borderRadius: 14,
              padding: '64px 40px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, marginBottom: 14, opacity: 0.6 }}>⏳</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>
                RZ is finding your next ticket
              </div>
              <div style={{ fontSize: 13, color: '#334155' }}>
                Matching against your skills, shift time, and SLA priority...
              </div>
              <div style={{
                marginTop: 20, display: 'inline-block', width: 20, height: 20,
                border: '2px solid #00D4AA33', borderTop: '2px solid #00D4AA',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          )}

          {/* ── NEXT UP ── */}
          {nextUp && !fetching && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                <span style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: '#334155', letterSpacing: 2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  Up Next
                </span>
                <div style={{ flex: 1, height: 1, background: '#0A1830' }} />
                <span style={{ fontSize: 10, color: '#334155' }}>RZ assigned</span>
              </div>
              <div style={{
                background: '#080E1A', border: '1px solid #0D1E35',
                borderRadius: 12, padding: '16px 20px',
                opacity: 0.55, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, transparent 40%, #070D1A 100%)',
                  zIndex: 2, borderRadius: 12,
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#334155' }}>{nextUp.id}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: priColor(nextUp.priority) }}>{priLabel(nextUp.priority)}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#64748B', marginBottom: 4, lineHeight: 1.4 }}>
                  {nextUp.summary}
                </div>
                <div style={{ fontSize: 12, color: '#334155' }}>{nextUp.client}</div>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{
          width: 272,
          padding: '20px 24px 20px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          overflowY: 'auto',
          flexShrink: 0,
        }}>

          {/* Today's Performance */}
          <div style={{ background: '#0A1225', border: '1px solid #0F2040', borderRadius: 12, padding: '16px' }}>
            <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: '#475569', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
              Today
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>Utilization</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: '#00D4AA' }}>87%</span>
              </div>
              <div style={{ height: 5, background: '#060D1A', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '87%', background: 'linear-gradient(90deg, #00D4AA, #0D6EFD)', borderRadius: 3 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <StatBox label="Closed" value={String(closedToday)} color="#00D4AA" />
              <StatBox label="SLA Met" value={`${tech.slaMet}%`} color="#00D4AA" />
              <StatBox label="Avg Handle" value={`${tech.avgHandleMin}m`} />
              <StatBox label="Escalated" value={String(tech.escalated)} color={tech.escalated > 0 ? '#F59E0B' : '#94A3B8'} />
            </div>
          </div>

          {/* Team Queue */}
          <div style={{ background: '#0A1225', border: '1px solid #0F2040', borderRadius: 12, padding: '16px' }}>
            <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: '#475569', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
              Team Queue
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 38, fontWeight: 700, color: '#F1F5F9', lineHeight: 1 }}>
                {queueTotal}
              </span>
              <span style={{ fontSize: 12, color: '#475569' }}>waiting</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {([['P1', QUEUE.p1, '#EF4444'], ['P2', QUEUE.p2, '#F59E0B'], ['P3', QUEUE.p3, '#3B82F6']] as const).map(([l, n, c]) => (
                <div key={l} style={{ flex: 1, padding: '8px 6px', textAlign: 'center', background: `${c}0D`, border: `1px solid ${c}25`, borderRadius: 7 }}>
                  <div style={{ fontSize: 10, color: c, fontWeight: 700, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 17, fontWeight: 700, color: c }}>{n}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '8px 10px', background: '#EF444410', border: '1px solid #EF444425', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 7 }}>
              <div className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 500 }}>{QUEUE.atRisk} at SLA risk</span>
            </div>
          </div>

          {/* Queue preview */}
          {queueTickets.length > 0 && (
            <div style={{ background: '#0A1225', border: '1px solid #0F2040', borderRadius: 12, padding: '16px', overflow: 'hidden' }}>
              <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: '#475569', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                Other Open
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {queueTickets.slice(0, 5).map(t => (
                  <div key={t.id} className="queue-row" style={{
                    padding: '8px 10px',
                    borderRadius: 7,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                  }}>
                    <div style={{ width: 4, height: 28, borderRadius: 2, background: priColor(t.priority), flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.summary}
                      </div>
                      <div style={{ fontSize: 10, color: '#334155', fontFamily: "'Space Mono', monospace" }}>{t.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          <div style={{ background: '#0A1225', border: '1px solid #0F2040', borderRadius: 12, padding: '16px' }}>
            <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: '#475569', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
              Skills
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tech.skills.map(s => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>{s.name}</span>
                  <SkillDots level={s.level} />
                </div>
              ))}
            </div>
          </div>

          {/* RZ Dispatch active */}
          <div style={{
            padding: '12px 14px',
            background: '#00D4AA07', border: '1px solid #00D4AA18',
            borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#00D4AA', flexShrink: 0, marginTop: 3 }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#00D4AA', marginBottom: 3 }}>RZ Dispatch Active</div>
              <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.5 }}>
                Queue managed automatically. No dispatcher required.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
