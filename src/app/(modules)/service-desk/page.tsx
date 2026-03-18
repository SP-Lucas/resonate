'use client';

import React, { useState, useEffect } from 'react';
import {
  MOCK_TICKETS,
  MOCK_QUEUE_STATS,
  MOCK_TECHS,
  type Ticket,
} from '@/lib/mock-data/service-desk';
import SLATimer, { slaColor } from '@/components/service-desk/SLATimer';

// ── Helpers ────────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'p1' | 'p2' | 'p3' | 'unassigned' | 'at_risk';

function priorityColor(p: number): string {
  if (p === 1) return '#EF4444';
  if (p === 2) return '#F59E0B';
  return '#3B82F6';
}

function priorityLabel(p: number): string {
  if (p === 1) return 'P1';
  if (p === 2) return 'P2';
  return 'P3';
}

function statusLabel(s: Ticket['status']): string {
  const map: Record<Ticket['status'], string> = {
    open: 'Open',
    in_progress: 'In Progress',
    waiting_client: 'Waiting',
    escalated: 'Escalated',
    resolved: 'Resolved',
  };
  return map[s];
}

function statusColor(s: Ticket['status']): string {
  const map: Record<Ticket['status'], string> = {
    open: '#475569',
    in_progress: '#00D4AA',
    waiting_client: '#F59E0B',
    escalated: '#EF4444',
    resolved: '#64748B',
  };
  return map[s];
}

function isAtRisk(t: Ticket): boolean {
  return t.slaSeconds > 0 && t.slaSeconds < 2700;
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color = '#F1F5F9',
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  accent?: string;
}) {
  return (
    <div style={{
      background: '#0A1225',
      border: `1px solid ${accent ? accent + '30' : '#0F2040'}`,
      borderRadius: 12,
      padding: '16px 18px',
      flex: 1,
      minWidth: 0,
      boxShadow: accent ? `0 0 30px ${accent}08` : 'none',
    }}>
      <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 26, fontWeight: 700, color, lineHeight: 1.1, marginBottom: 3 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: '#334155' }}>{sub}</div>
      )}
    </div>
  );
}

// ── Ticket Row ─────────────────────────────────────────────────────────────

function TicketRow({ ticket, slaLive }: { ticket: Ticket; slaLive: number }) {
  const priCol = priorityColor(ticket.priority);
  const slaCol = slaColor(slaLive);
  const breached = slaLive <= 0;
  const atRisk = slaLive > 0 && slaLive < 2700;

  return (
    <tr style={{
      borderBottom: '1px solid #0A1830',
      background: breached ? '#EF444408' : atRisk ? '#F59E0B05' : 'transparent',
      transition: 'background 0.15s ease',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#0D1B30'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = breached ? '#EF444408' : atRisk ? '#F59E0B05' : 'transparent'; }}
    >
      {/* Priority */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "'Space Mono', monospace",
          color: priCol,
          background: `${priCol}15`,
          border: `1px solid ${priCol}30`,
          borderRadius: 4,
          padding: '3px 8px',
        }}>
          {priorityLabel(ticket.priority)}
        </span>
      </td>

      {/* Ticket ID */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#475569' }}>
          {ticket.id}
        </span>
      </td>

      {/* Summary + client */}
      <td style={{ padding: '12px 16px', maxWidth: 320 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 3, lineHeight: 1.4 }}>
          {ticket.summary}
        </div>
        <div style={{ fontSize: 11, color: '#475569' }}>{ticket.category}</div>
      </td>

      {/* Client */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#00D4AA' }}>{ticket.client}</div>
        <div style={{ fontSize: 11, color: '#334155' }}>{ticket.site}</div>
      </td>

      {/* Technician */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        {ticket.assignedTo ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D3B6E, #00D4AA22)',
              border: '1px solid #00D4AA33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: 9,
              fontWeight: 700,
              color: '#00D4AA',
              flexShrink: 0,
            }}>
              {ticket.assignedToInitials}
            </div>
            <span style={{ fontSize: 13, color: '#94A3B8' }}>{ticket.assignedTo}</span>
          </div>
        ) : (
          <span style={{
            fontSize: 11,
            color: '#F59E0B',
            background: '#F59E0B10',
            border: '1px solid #F59E0B30',
            borderRadius: 4,
            padding: '3px 8px',
            fontWeight: 600,
          }}>
            Unassigned
          </span>
        )}
      </td>

      {/* SLA countdown */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: slaCol,
            flexShrink: 0,
          }} />
          <SLATimer seconds={slaLive} totalSeconds={ticket.slaTotalSeconds} size="sm" />
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <span style={{
          fontSize: 11,
          color: statusColor(ticket.status),
          background: `${statusColor(ticket.status)}15`,
          border: `1px solid ${statusColor(ticket.status)}30`,
          borderRadius: 4,
          padding: '3px 9px',
          fontWeight: 500,
        }}>
          {statusLabel(ticket.status)}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#00D4AA',
            background: '#00D4AA10',
            border: '1px solid #00D4AA25',
            borderRadius: 5,
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Open
          </button>
          <button style={{
            fontSize: 11,
            fontWeight: 500,
            color: '#475569',
            background: 'transparent',
            border: '1px solid #0F2040',
            borderRadius: 5,
            padding: '4px 10px',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Assign
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'p1', label: 'P1 Critical' },
  { key: 'p2', label: 'P2 High' },
  { key: 'p3', label: 'P3 Normal' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'at_risk', label: 'At Risk' },
];

export default function ServiceDeskPage() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [slaCounters, setSlaCounters] = useState<Record<string, number>>(
    () => Object.fromEntries(MOCK_TICKETS.map(t => [t.id, t.slaSeconds]))
  );
  const [currentTime, setCurrentTime] = useState<string>('');

  // Tick all SLA counters every second
  useEffect(() => {
    const tick = setInterval(() => {
      setSlaCounters(prev =>
        Object.fromEntries(
          Object.entries(prev).map(([id, s]) => [id, Math.max(0, s - 1)])
        )
      );
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  // Live clock
  useEffect(() => {
    const updateClock = () =>
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateClock();
    const t = setInterval(updateClock, 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = MOCK_TICKETS.filter(t => {
    if (filter === 'p1') return t.priority === 1;
    if (filter === 'p2') return t.priority === 2;
    if (filter === 'p3') return t.priority === 3;
    if (filter === 'unassigned') return !t.assignedTo;
    if (filter === 'at_risk') return isAtRisk({ ...t, slaSeconds: slaCounters[t.id] ?? t.slaSeconds });
    return true;
  });

  const stats = MOCK_QUEUE_STATS;
  const atRiskCount = MOCK_TICKETS.filter(t => isAtRisk({ ...t, slaSeconds: slaCounters[t.id] ?? t.slaSeconds })).length;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070D1A',
      color: '#E2E8F0',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#0A1225}
        ::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .pulse{animation:pulse 2s infinite}
        @keyframes blink-red{0%,100%{opacity:1}50%{opacity:.3}}
        .blink-red{animation:blink-red 1.2s infinite}
        .filter-btn{cursor:pointer;border:none;font-family:'DM Sans',sans-serif;transition:all .15s ease}
        .filter-btn:hover{background:#0D1B2E!important;border-color:#1E3A5F!important}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, color: '#00D4AA', letterSpacing: 3 }}>
            RESONATE
          </span>
          <div style={{ width: 1, height: 20, background: '#1E3A5F' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>Service Desk</span>
          <div style={{ width: 1, height: 20, background: '#1E3A5F' }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#475569' }}>
            Command Center
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#334155' }}>
            {currentTime}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {MOCK_TECHS.map(t => (
              <div key={t.id} title={`${t.name} — ${t.status}`} style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0D3B6E, #00D4AA22)',
                border: `2px solid ${t.status === 'busy' ? '#00D4AA40' : t.status === 'break' ? '#64748B40' : '#0F2040'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                fontWeight: 700,
                color: '#00D4AA',
                cursor: 'default',
              }}>
                {t.initials}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div style={{ padding: '24px 28px', maxWidth: 1600, margin: '0 auto' }}>

        {/* ── RZ DISPATCH BANNER ── */}
        <div style={{
          marginBottom: 20,
          padding: '12px 18px',
          background: '#00D4AA08',
          border: '1px solid #00D4AA20',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div className="pulse" style={{ width: 9, height: 9, borderRadius: '50%', background: '#00D4AA', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#00D4AA', marginRight: 10 }}>
              RZ Dispatch Active
            </span>
            <span style={{ fontSize: 12, color: '#475569' }}>
              AI managing queue assignment · {stats.aiAutoResolved} tickets auto-resolved today · All {MOCK_TECHS.length} techs online
            </span>
          </div>
          <div style={{
            padding: '4px 12px',
            background: '#00D4AA15',
            border: '1px solid #00D4AA30',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            fontFamily: "'Space Mono', monospace",
            color: '#00D4AA',
          }}>
            AUTO-DISPATCH ON
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <StatCard
            label="Total Tickets"
            value={String(stats.total)}
            sub="Active queue"
            color="#F1F5F9"
          />
          <StatCard
            label="P1 Active"
            value={String(stats.p1)}
            sub="Critical priority"
            color="#EF4444"
            accent="#EF4444"
          />
          <StatCard
            label="Avg Resolution"
            value={`${stats.avgResolutionMin}m`}
            sub="Last 24h"
            color="#94A3B8"
          />
          <StatCard
            label="SLA Compliance"
            value={`${stats.slaCompliance}%`}
            sub="Last 30 days"
            color={stats.slaCompliance >= 95 ? '#00D4AA' : '#F59E0B'}
            accent={stats.slaCompliance >= 95 ? '#00D4AA' : '#F59E0B'}
          />
          <StatCard
            label="Closed Today"
            value={String(stats.closedToday)}
            sub="Resolved tickets"
            color="#00D4AA"
            accent="#00D4AA"
          />
          <StatCard
            label="AI Auto-Resolved"
            value={`${stats.aiAutoResolved}`}
            sub={`${Math.round((stats.aiAutoResolved / (stats.closedToday + stats.aiAutoResolved)) * 100)}% of total`}
            color="#818CF8"
            accent="#818CF8"
          />
        </div>

        {/* ── FILTER BAR ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}>
          {FILTERS.map(f => {
            const active = filter === f.key;
            const isAtRiskFilter = f.key === 'at_risk';
            return (
              <button
                key={f.key}
                className="filter-btn"
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '7px 16px',
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  borderRadius: 7,
                  background: active ? '#0F2040' : '#0A1225',
                  border: active ? '1px solid #1E3A5F' : '1px solid #0F2040',
                  color: active ? '#F1F5F9' : '#475569',
                  position: 'relative',
                }}
              >
                {f.label}
                {isAtRiskFilter && atRiskCount > 0 && (
                  <span style={{
                    marginLeft: 6,
                    background: '#EF4444',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: '1px 6px',
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    {atRiskCount}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          {/* Quick summary chips */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {[
              { label: `${stats.p1} P1`, color: '#EF4444' },
              { label: `${stats.p2} P2`, color: '#F59E0B' },
              { label: `${stats.p3} P3`, color: '#3B82F6' },
              { label: `${atRiskCount} At Risk`, color: '#EF4444' },
            ].map(chip => (
              <span key={chip.label} style={{
                fontSize: 11,
                color: chip.color,
                background: `${chip.color}10`,
                border: `1px solid ${chip.color}25`,
                borderRadius: 5,
                padding: '3px 9px',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
              }}>
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── TICKET TABLE ── */}
        <div style={{
          background: '#0A1225',
          border: '1px solid #0F2040',
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid #0F2040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#475569', textTransform: 'uppercase', letterSpacing: 1.5 }}>
              Ticket Queue
            </span>
            <span style={{ fontSize: 11, color: '#334155' }}>
              {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
              {filter !== 'all' ? ` · filtered` : ''}
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #0F2040' }}>
                  {['Priority', 'Ticket ID', 'Summary', 'Client', 'Technician', 'SLA', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 10,
                      fontFamily: "'Space Mono', monospace",
                      color: '#334155',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                      fontWeight: 400,
                      whiteSpace: 'nowrap',
                      background: '#080E1C',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#334155', fontSize: 13 }}>
                      No tickets match this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map(ticket => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      slaLive={slaCounters[ticket.id] ?? ticket.slaSeconds}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FOOTER TECH PRESENCE ── */}
        <div style={{
          marginTop: 20,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          {MOCK_TECHS.map(tech => {
            const techTickets = MOCK_TICKETS.filter(t => t.assignedTo === tech.name);
            const statusColors: Record<string, string> = {
              available: '#00D4AA',
              busy: '#F59E0B',
              wrapping: '#818CF8',
              break: '#64748B',
            };
            const statusLabels: Record<string, string> = {
              available: 'Available',
              busy: 'Busy',
              wrapping: 'Wrapping Up',
              break: 'On Break',
            };
            return (
              <div key={tech.id} style={{
                background: '#0A1225',
                border: '1px solid #0F2040',
                borderRadius: 10,
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minWidth: 200,
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0D3B6E, #00D4AA22)',
                  border: `2px solid ${statusColors[tech.status]}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#00D4AA',
                  flexShrink: 0,
                }}>
                  {tech.initials}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 2 }}>{tech.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[tech.status] }} />
                    <span style={{ fontSize: 11, color: statusColors[tech.status] }}>{statusLabels[tech.status]}</span>
                    <span style={{ fontSize: 11, color: '#334155' }}>·</span>
                    <span style={{ fontSize: 11, color: '#475569' }}>{techTickets.length} ticket{techTickets.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
