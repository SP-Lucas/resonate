'use client';

import React from 'react';
import { type Ticket } from '@/lib/mock-data/service-desk';
import SLATimer, { slaColor } from './SLATimer';

interface TicketCardProps {
  ticket: Ticket;
  onClick?: () => void;
}

function priorityColor(p: number): string {
  if (p === 1) return '#EF4444';
  if (p === 2) return '#F59E0B';
  return '#3B82F6';
}

function priorityLabel(p: number): string {
  if (p === 1) return 'P1 CRITICAL';
  if (p === 2) return 'P2 HIGH';
  return 'P3 NORMAL';
}

function statusLabel(s: Ticket['status']): string {
  const map: Record<Ticket['status'], string> = {
    open: 'Open',
    in_progress: 'In Progress',
    waiting_client: 'Waiting Client',
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

export default function TicketCard({ ticket, onClick }: TicketCardProps) {
  const priCol = priorityColor(ticket.priority);
  const slaCol = slaColor(ticket.slaSeconds);
  const isBreached = ticket.slaSeconds <= 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: '#0A1225',
        border: `1px solid ${isBreached ? '#EF444430' : '#0F2040'}`,
        borderLeft: `3px solid ${priCol}`,
        borderRadius: 10,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        if (!onClick) return;
        (e.currentTarget as HTMLDivElement).style.borderColor = `#1E3A5F`;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px #00D4AA08`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = isBreached ? '#EF444430' : '#0F2040';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Priority badge */}
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          fontFamily: "'Space Mono', monospace",
          color: priCol,
          background: `${priCol}15`,
          border: `1px solid ${priCol}30`,
          borderRadius: 4,
          padding: '2px 7px',
          letterSpacing: 0.5,
          whiteSpace: 'nowrap',
        }}>
          {priorityLabel(ticket.priority)}
        </span>

        <span style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: '#334155',
          whiteSpace: 'nowrap',
        }}>
          {ticket.id}
        </span>

        <div style={{ flex: 1 }} />

        {/* SLA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: slaCol }} />
          <SLATimer seconds={ticket.slaSeconds} totalSeconds={ticket.slaTotalSeconds} size="sm" />
        </div>
      </div>

      {/* Summary */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', lineHeight: 1.45 }}>
        {ticket.summary}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
        <span style={{ color: '#00D4AA', fontWeight: 500 }}>{ticket.client}</span>
        <span style={{ color: '#1E3A5F' }}>·</span>
        <span style={{ color: '#475569' }}>{ticket.site}</span>
        <div style={{ flex: 1 }} />

        {/* Status */}
        <span style={{
          fontSize: 11,
          color: statusColor(ticket.status),
          background: `${statusColor(ticket.status)}15`,
          border: `1px solid ${statusColor(ticket.status)}30`,
          borderRadius: 4,
          padding: '2px 8px',
          fontWeight: 500,
        }}>
          {statusLabel(ticket.status)}
        </span>
      </div>

      {/* Assignee */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {ticket.assignedTo ? (
          <>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0D3B6E, #00D4AA22)',
              border: '1px solid #00D4AA33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: 8,
              fontWeight: 700,
              color: '#00D4AA',
              flexShrink: 0,
            }}>
              {ticket.assignedToInitials}
            </div>
            <span style={{ fontSize: 12, color: '#64748B' }}>{ticket.assignedTo}</span>
          </>
        ) : (
          <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 500 }}>Unassigned</span>
        )}
      </div>
    </div>
  );
}
