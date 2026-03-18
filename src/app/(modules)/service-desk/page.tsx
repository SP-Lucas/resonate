'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MOCK_TICKETS,
  MOCK_QUEUE_STATS,
  MOCK_TECHS,
  type Ticket,
  type Priority,
  type TicketStatus,
} from '@/lib/mock-data/service-desk';
import SLATimer, { slaColor } from '@/components/service-desk/SLATimer';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';

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

const STATUS_OPTIONS: Ticket['status'][] = [
  'open',
  'in_progress',
  'waiting_client',
  'escalated',
  'resolved',
];

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

// ── Animated Count-Up ──────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration]);

  return value;
}

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  rawValue,
  suffix = '',
  sub,
  color = '#F1F5F9',
  accent,
  trend,
  trendPct,
}: {
  label: string;
  value?: string;
  rawValue?: number;
  suffix?: string;
  sub?: string;
  color?: string;
  accent?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPct?: number;
}) {
  const animated = useCountUp(rawValue ?? 0);
  const displayValue = rawValue !== undefined ? `${animated}${suffix}` : (value ?? '');

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
        {displayValue}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {sub && (
          <div style={{ fontSize: 11, color: '#334155' }}>{sub}</div>
        )}
        {trend && trendPct !== undefined && (
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: trend === 'up' ? '#00D4AA' : trend === 'down' ? '#EF4444' : '#475569',
            fontFamily: "'Space Mono', monospace",
          }}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}{trendPct}%
          </span>
        )}
      </div>
    </div>
  );
}

// ── Status Dropdown ────────────────────────────────────────────────────────

function StatusDropdown({
  ticketId,
  status,
  onChange,
}: {
  ticketId: string;
  status: Ticket['status'];
  onChange: (id: string, next: Ticket['status']) => void;
}) {
  const [open, setOpen] = useState(false);
  const [optimistic, setOptimistic] = useState<Ticket['status']>(status);
  const ref = useRef<HTMLDivElement>(null);

  // sync if parent changes
  useEffect(() => { setOptimistic(status); }, [status]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (next: Ticket['status']) => {
    setOptimistic(next);
    setOpen(false);
    onChange(ticketId, next);
  };

  const col = statusColor(optimistic);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        style={{
          fontSize: 11,
          color: col,
          background: `${col}15`,
          border: `1px solid ${col}30`,
          borderRadius: 4,
          padding: '3px 9px',
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          whiteSpace: 'nowrap',
        }}
      >
        {statusLabel(optimistic)}
        <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 100,
          background: '#0D1B30',
          border: '1px solid #1E3A5F',
          borderRadius: 8,
          padding: '4px',
          minWidth: 140,
          boxShadow: '0 8px 24px #000A',
        }}>
          {STATUS_OPTIONS.map(s => {
            const sc = statusColor(s);
            const active = s === optimistic;
            return (
              <button
                key={s}
                onClick={e => { e.stopPropagation(); handleSelect(s); }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 10px',
                  fontSize: 12,
                  color: active ? sc : '#94A3B8',
                  background: active ? `${sc}15` : 'transparent',
                  border: 'none',
                  borderRadius: 5,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${sc}10`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = active ? `${sc}15` : 'transparent'; }}
              >
                {statusLabel(s)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Expanded Row Detail ────────────────────────────────────────────────────

function ExpandedTicketDetail({ ticket }: { ticket: Ticket }) {
  return (
    <tr>
      <td colSpan={9} style={{ padding: 0 }}>
        <div style={{
          padding: '16px 24px 20px 32px',
          background: 'linear-gradient(180deg, #0B1526 0%, #080E1C 100%)',
          borderBottom: '1px solid #0F2040',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 24,
        }}>
          {/* Notes */}
          <div>
            <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: '#334155', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Notes
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.7 }}>
              {ticket.notes}
            </div>
          </div>

          {/* Contact info */}
          <div>
            <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: '#334155', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Contact
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>{ticket.contact.name}</div>
            <div style={{ fontSize: 12, color: '#00D4AA' }}>{ticket.contact.phone}</div>
            <div style={{ marginTop: 10, fontSize: 11, color: '#475569' }}>
              <span style={{ color: '#334155' }}>Created: </span>{ticket.createdAt}
              {ticket.assignedAt && (
                <span style={{ marginLeft: 10 }}>
                  <span style={{ color: '#334155' }}>Assigned: </span>{ticket.assignedAt}
                </span>
              )}
            </div>
          </div>

          {/* AI Dispatch */}
          <div>
            <div style={{ fontSize: 10, fontFamily: "'Space Mono', monospace", color: '#334155', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              RZ Dispatch
            </div>
            {ticket.dispatchScore > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{
                    fontSize: 22,
                    fontFamily: "'Space Mono', monospace",
                    fontWeight: 700,
                    color: ticket.dispatchScore >= 90 ? '#00D4AA' : ticket.dispatchScore >= 70 ? '#F59E0B' : '#EF4444',
                  }}>
                    {ticket.dispatchScore}
                  </div>
                  <div style={{ fontSize: 10, color: '#475569' }}>SCORE</div>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>{ticket.dispatchReason}</div>
              </>
            ) : (
              <div style={{ fontSize: 12, color: '#334155', fontStyle: 'italic' }}>Pending dispatch analysis</div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Ticket Row ─────────────────────────────────────────────────────────────

function TicketRow({
  ticket,
  slaLive,
  isExpanded,
  isEven,
  onToggle,
  onStatusChange,
  onAssignToMe,
}: {
  ticket: Ticket;
  slaLive: number;
  isExpanded: boolean;
  isEven: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, next: Ticket['status']) => void;
  onAssignToMe: (id: string) => void;
}) {
  const priCol = priorityColor(ticket.priority);
  const slaCol = slaColor(slaLive);
  const breached = slaLive <= 0;
  const atRisk = slaLive > 0 && slaLive < 2700;

  const baseBackground = breached
    ? '#EF444410'
    : atRisk
    ? '#F59E0B07'
    : isEven
    ? '#0A1225'
    : '#080E1C';

  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          borderBottom: isExpanded ? 'none' : '1px solid #0A1830',
          borderLeft: `3px solid ${priCol}`,
          background: baseBackground,
          transition: 'background 0.15s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = '#0D1B30'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = baseBackground; }}
      >
        {/* Expand indicator */}
        <td style={{ padding: '12px 10px 12px 14px', width: 24 }}>
          <span style={{ color: '#334155', fontSize: 10, transition: 'transform 0.2s', display: 'inline-block', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            ▶
          </span>
        </td>

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

        {/* Summary + category */}
        <td style={{ padding: '12px 16px', maxWidth: 300 }}>
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

        {/* Status dropdown */}
        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
          <StatusDropdown
            ticketId={ticket.id}
            status={ticket.status}
            onChange={onStatusChange}
          />
        </td>

        {/* Actions */}
        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={e => { e.stopPropagation(); onAssignToMe(ticket.id); }}
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#00D4AA',
                background: '#00D4AA10',
                border: '1px solid #00D4AA25',
                borderRadius: 5,
                padding: '4px 10px',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Assign to me
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && <ExpandedTicketDetail ticket={ticket} />}
    </>
  );
}

// ── New Ticket Sheet ────────────────────────────────────────────────────────

const CATEGORIES = [
  'Server / Exchange',
  'Network / Firewall',
  'Network / VPN',
  'Cloud / Azure',
  'Security',
  'Workstation',
  'Printing',
  'Software / M365',
  'Backup / DR',
  'Server / Hardware',
  'Other',
];

const CLIENTS = [
  'Acme Corporation',
  'Bay Area Logistics',
  'Pacific Dental Group',
  'Meridian Wealth Mgmt',
  'Marin County Law',
  'Coastal Realty Group',
  'Sunrise Healthcare',
  'Other',
];

interface NewTicketForm {
  priority: Priority;
  category: string;
  summary: string;
  client: string;
  description: string;
}

function NewTicketSheet({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: NewTicketForm) => void;
}) {
  const [form, setForm] = useState<NewTicketForm>({
    priority: 2,
    category: 'Workstation',
    summary: '',
    client: 'Acme Corporation',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.summary.trim()) return;
    onSubmit(form);
    onOpenChange(false);
    setForm({ priority: 2, category: 'Workstation', summary: '', client: 'Acme Corporation', description: '' });
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    background: '#070D1A',
    border: '1px solid #1E3A5F',
    borderRadius: 7,
    padding: '9px 12px',
    fontSize: 13,
    color: '#E2E8F0',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontFamily: "'Space Mono', monospace",
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 1,
    display: 'block',
    marginBottom: 6,
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        style={{ background: '#0A1225', borderLeft: '1px solid #1E3A5F', width: '420px', maxWidth: '100vw', padding: 0, overflowY: 'auto' }}
      >
        <SheetHeader style={{ padding: '24px 24px 16px' }}>
          <SheetTitle style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, color: '#F1F5F9', fontWeight: 700, letterSpacing: 0.5 }}>
            New Ticket
          </SheetTitle>
          <SheetDescription style={{ fontSize: 12, color: '#475569' }}>
            Fill in the details below to create a new service ticket.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} style={{ padding: '0 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Priority */}
            <div>
              <label style={labelStyle}>Priority</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {([1, 2, 3] as Priority[]).map(p => {
                  const pc = priorityColor(p);
                  const active = form.priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, priority: p }))}
                      style={{
                        flex: 1,
                        padding: '8px',
                        fontSize: 12,
                        fontWeight: 700,
                        fontFamily: "'Space Mono', monospace",
                        color: active ? pc : '#334155',
                        background: active ? `${pc}18` : '#070D1A',
                        border: `1px solid ${active ? pc + '60' : '#1E3A5F'}`,
                        borderRadius: 7,
                        cursor: 'pointer',
                      }}
                    >
                      {priorityLabel(p)} {p === 1 ? 'Critical' : p === 2 ? 'High' : 'Normal'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <div>
              <label style={labelStyle}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ ...fieldStyle, appearance: 'none' }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Client */}
            <div>
              <label style={labelStyle}>Client</label>
              <select
                value={form.client}
                onChange={e => setForm(f => ({ ...f, client: e.target.value }))}
                style={{ ...fieldStyle, appearance: 'none' }}
              >
                {CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Summary */}
            <div>
              <label style={labelStyle}>Summary</label>
              <input
                type="text"
                placeholder="Brief description of the issue…"
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                required
                style={fieldStyle}
              />
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                placeholder="Full details, steps to reproduce, impact…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={5}
                style={{ ...fieldStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          <SheetFooter style={{ padding: '24px 0', marginTop: 8 }}>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #00D4AA18, #00D4AA28)',
                border: '1px solid #00D4AA50',
                borderRadius: 8,
                color: '#00D4AA',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
                letterSpacing: 1,
                cursor: 'pointer',
              }}
            >
              CREATE TICKET
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
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

let _nextTicketNum = 4600;
function nextTicketId() {
  return `TKT-${_nextTicketNum++}`;
}

export default function ServiceDeskPage() {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [slaCounters, setSlaCounters] = useState<Record<string, number>>(
    () => Object.fromEntries(MOCK_TICKETS.map(t => [t.id, t.slaSeconds]))
  );
  const [currentTime, setCurrentTime] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const handleStatusChange = useCallback((id: string, next: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: next } : t));
  }, []);

  const handleAssignToMe = useCallback((id: string) => {
    setTickets(prev => prev.map(t =>
      t.id === id
        ? { ...t, assignedTo: 'You', assignedToInitials: 'ME', assignedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
        : t
    ));
  }, []);

  const handleNewTicket = useCallback((data: NewTicketForm) => {
    const id = nextTicketId();
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const slaMap: Record<Priority, number> = { 1: 3600, 2: 14400, 3: 28800 };
    const newTicket: Ticket = {
      id,
      priority: data.priority,
      category: data.category,
      summary: data.summary,
      client: data.client,
      site: 'HQ',
      slaSeconds: slaMap[data.priority],
      slaTotalSeconds: slaMap[data.priority],
      status: 'open',
      assignedTo: null,
      assignedToInitials: null,
      createdAt: now,
      assignedAt: null,
      notes: data.description || 'No additional notes.',
      contact: { name: '—', phone: '—' },
      dispatchScore: 0,
      dispatchReason: '',
    };
    setTickets(prev => [newTicket, ...prev]);
    setSlaCounters(prev => ({ ...prev, [id]: slaMap[data.priority] }));
  }, []);

  const ticketsWithLiveSla = tickets.map(t => ({
    ...t,
    slaSeconds: slaCounters[t.id] ?? t.slaSeconds,
  }));

  const filtered = ticketsWithLiveSla.filter(t => {
    if (filter === 'p1') return t.priority === 1;
    if (filter === 'p2') return t.priority === 2;
    if (filter === 'p3') return t.priority === 3;
    if (filter === 'unassigned') return !t.assignedTo;
    if (filter === 'at_risk') return isAtRisk(t);
    return true;
  });

  const stats = MOCK_QUEUE_STATS;
  const atRiskCount = ticketsWithLiveSla.filter(t => isAtRisk(t)).length;
  const activeTechs = MOCK_TECHS.filter(t => t.status !== 'break').length;

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
        @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(0.75)}}
        .pulse-dot{animation:pulse-dot 1.5s ease-in-out infinite}
        @keyframes blink-red{0%,100%{opacity:1}50%{opacity:.3}}
        .blink-red{animation:blink-red 1.2s infinite}
        @keyframes at-risk-flash{0%,100%{background:#EF444415;border-color:#EF444435;color:#EF4444}50%{background:#EF444428;border-color:#EF444460;color:#FF6B6B}}
        .at-risk-flash{animation:at-risk-flash 1.2s ease-in-out infinite}
        @keyframes rz-border-pulse{0%,100%{box-shadow:0 0 0 0 #00D4AA00,0 0 16px #00D4AA08}50%{box-shadow:0 0 0 2px #00D4AA30,0 0 32px #00D4AA18}}
        .rz-banner{animation:rz-border-pulse 2.4s ease-in-out infinite}
        .filter-btn{cursor:pointer;border:none;font-family:'DM Sans',sans-serif;transition:all .15s ease}
        .filter-btn:hover{background:#0D1B2E!important;border-color:#1E3A5F!important}
        select option{background:#0D1B30;color:#E2E8F0}
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
          {/* New Ticket button */}
          <button
            onClick={() => setSheetOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              background: 'linear-gradient(135deg, #00D4AA18, #00D4AA28)',
              border: '1px solid #00D4AA40',
              borderRadius: 7,
              color: '#00D4AA',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Space Mono', monospace",
              cursor: 'pointer',
              letterSpacing: 0.5,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> New Ticket
          </button>
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
        <div
          className="rz-banner"
          style={{
            marginBottom: 20,
            padding: '12px 18px',
            background: '#00D4AA08',
            border: '1px solid #00D4AA25',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div className="pulse" style={{ width: 9, height: 9, borderRadius: '50%', background: '#00D4AA', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#00D4AA', marginRight: 10 }}>
              RZ Dispatch Active
            </span>
            <span style={{ fontSize: 12, color: '#475569' }}>
              AI managing queue assignment · {stats.aiAutoResolved} tickets auto-resolved today · {activeTechs} technicians active
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 11, color: '#334155' }}>
              <span style={{ color: '#475569' }}>Last assignment: </span>
              <span style={{ color: '#00D4AA', fontFamily: "'Space Mono', monospace", fontWeight: 700 }}>2 min ago</span>
            </div>
            <div style={{ width: 1, height: 16, background: '#1E3A5F' }} />
            <div style={{ fontSize: 11, color: '#334155' }}>
              Queue optimized —
              <span style={{ color: '#00D4AA', fontFamily: "'Space Mono', monospace", fontWeight: 700, marginLeft: 4 }}>{activeTechs} techs active</span>
            </div>
            <div style={{ width: 1, height: 16, background: '#1E3A5F' }} />
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
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <StatCard
            label="Total Tickets"
            rawValue={stats.total}
            sub="Active queue"
            color="#F1F5F9"
            trend="up"
            trendPct={8}
          />
          <StatCard
            label="P1 Active"
            rawValue={stats.p1}
            sub="Critical priority"
            color="#EF4444"
            accent="#EF4444"
            trend="up"
            trendPct={50}
          />
          <StatCard
            label="Avg Resolution"
            rawValue={stats.avgResolutionMin}
            suffix="m"
            sub="Last 24h"
            color="#94A3B8"
            trend="down"
            trendPct={12}
          />
          <StatCard
            label="SLA Compliance"
            rawValue={stats.slaCompliance}
            suffix="%"
            sub="Last 30 days"
            color={stats.slaCompliance >= 95 ? '#00D4AA' : '#F59E0B'}
            accent={stats.slaCompliance >= 95 ? '#00D4AA' : '#F59E0B'}
            trend="down"
            trendPct={2}
          />
          <StatCard
            label="Closed Today"
            rawValue={stats.closedToday}
            sub="Resolved tickets"
            color="#00D4AA"
            accent="#00D4AA"
            trend="up"
            trendPct={10}
          />
          <StatCard
            label="AI Auto-Resolved"
            rawValue={stats.aiAutoResolved}
            sub={`${Math.round((stats.aiAutoResolved / (stats.closedToday + stats.aiAutoResolved)) * 100)}% of total`}
            color="#818CF8"
            accent="#818CF8"
            trend="up"
            trendPct={22}
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
            const hasRisk = isAtRiskFilter && atRiskCount > 0;
            return (
              <button
                key={f.key}
                className={`filter-btn${hasRisk && !active ? ' at-risk-flash' : ''}`}
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
          {/* Table header bar */}
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
                  {['', 'Priority', 'Ticket ID', 'Summary', 'Client', 'Technician', 'SLA', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: h === '' ? '10px 10px 10px 14px' : '10px 16px',
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
                    <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: '#334155', fontSize: 13 }}>
                      No tickets match this filter.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ticket, idx) => (
                    <TicketRow
                      key={ticket.id}
                      ticket={ticket}
                      slaLive={slaCounters[ticket.id] ?? ticket.slaSeconds}
                      isExpanded={expandedId === ticket.id}
                      isEven={idx % 2 === 0}
                      onToggle={() => setExpandedId(prev => prev === ticket.id ? null : ticket.id)}
                      onStatusChange={handleStatusChange}
                      onAssignToMe={handleAssignToMe}
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
            const techTickets = tickets.filter(t => t.assignedTo === tech.name);
            const statusColors: Record<string, string> = {
              available: '#00D4AA',
              busy: '#F59E0B',
              wrapping: '#818CF8',
              break: '#64748B',
            };
            const statusLabelsMap: Record<string, string> = {
              available: 'Available',
              busy: 'Busy',
              wrapping: 'Wrapping Up',
              break: 'On Break',
            };
            const isAvailable = tech.status === 'available';
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
                    <div
                      className={isAvailable ? 'pulse-dot' : undefined}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: statusColors[tech.status], flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 11, color: statusColors[tech.status] }}>{statusLabelsMap[tech.status]}</span>
                    <span style={{ fontSize: 11, color: '#334155' }}>·</span>
                    <span style={{ fontSize: 11, color: '#475569' }}>{techTickets.length} ticket{techTickets.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── NEW TICKET SHEET ── */}
      <NewTicketSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSubmit={handleNewTicket}
      />
    </div>
  );
}
