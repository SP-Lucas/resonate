'use client';

import { useState } from 'react';
import {
  CONTRACTS,
  ALERT_ACTIVITY,
  REVENUE_AT_RISK,
  type ContractStatus,
  type ContractType,
} from '@/lib/mock-data/contracts';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ContractStatus, { text: string; bg: string }> = {
  Active: { text: '#00D4AA', bg: '#00D4AA18' },
  'Expiring Soon': { text: '#EF4444', bg: '#EF444418' },
  'Under Review': { text: '#818CF8', bg: '#818CF818' },
  'Pending Renewal': { text: '#F59E0B', bg: '#F59E0B18' },
  Expired: { text: '#475569', bg: '#47556918' },
};

const TYPE_COLORS: Record<ContractType, string> = {
  MSA: '#0D6EFD',
  SLA: '#818CF8',
  PSA: '#00D4AA',
  Addendum: '#F59E0B',
  NDA: '#94A3B8',
};

function urgencyColor(days: number): string {
  if (days < 30) return '#EF4444';
  if (days < 60) return '#F59E0B';
  return '#0D6EFD';
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function HealthBar({ score }: { score: number }) {
  const color = score >= 90 ? '#00D4AA' : score >= 75 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: '#0F2040' }}>
        <div className="h-1.5 rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color, fontFamily: "'Space Mono', monospace" }}>
        {score}
      </span>
    </div>
  );
}

type SortKey = 'client' | 'type' | 'valueMonthly' | 'endDate' | 'daysUntilRenewal';

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContractsPage() {
  const [sortKey, setSortKey] = useState<SortKey>('daysUntilRenewal');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const statuses = ['All', 'Active', 'Expiring Soon', 'Pending Renewal', 'Under Review'];

  const sorted = [...CONTRACTS]
    .filter((c) => filterStatus === 'All' || c.status === filterStatus)
    .sort((a, b) => {
      const av: string | number = a[sortKey];
      const bv: string | number = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  const renewingIn90 = CONTRACTS.filter((c) => c.daysUntilRenewal <= 90).sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span style={{ color: '#475569' }}> ↕</span>;
    return <span style={{ color: '#00D4AA' }}>{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>;
  }

  function ThCell({ col, label }: { col: SortKey; label: string }) {
    return (
      <th
        className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
        style={{ color: '#475569', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}
        onClick={() => handleSort(col)}
      >
        {label}
        <SortIcon col={col} />
      </th>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#070D1A', color: '#F1F5F9' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Contract Lifecycle Management
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#475569' }}>
            Automated renewal tracking · Zero missed renewals · 90/60/30-day alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ backgroundColor: '#0D6EFD20', color: '#0D6EFD', border: '1px solid #0D6EFD40' }}
          >
            + New Contract
          </button>
          <button
            className="px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            style={{ backgroundColor: '#00D4AA20', color: '#00D4AA', border: '1px solid #00D4AA40' }}
          >
            Export All
          </button>
        </div>
      </div>

      {/* Revenue at-risk banner */}
      <div
        className="rounded-lg border px-5 py-4 mb-5 flex items-center justify-between"
        style={{ backgroundColor: '#EF444410', borderColor: '#EF444430' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">⚠</span>
          <div>
            <span className="text-sm font-semibold" style={{ color: '#EF4444' }}>
              {fmt(REVENUE_AT_RISK.total)} renewing within 90 days
            </span>
            <span className="text-sm ml-2" style={{ color: '#94A3B8' }}>
              — {REVENUE_AT_RISK.contractsCount} contracts require immediate attention
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {REVENUE_AT_RISK.breakdown.map((b) => (
            <div key={b.window} className="text-center">
              <div className="text-xs font-bold" style={{ color: urgencyColor(b.window === '< 30 days' ? 15 : b.window === '30–60 days' ? 45 : 75), fontFamily: "'Space Mono', monospace" }}>
                {fmt(b.amount)}
              </div>
              <div className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                {b.window}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Renewal Calendar */}
        <div
          className="col-span-4 rounded-lg border p-4"
          style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
        >
          <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Renewal Calendar
          </p>
          <div className="flex flex-col gap-2">
            {renewingIn90.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 border"
                style={{
                  backgroundColor: '#060D1A',
                  borderColor: urgencyColor(c.daysUntilRenewal) + '40',
                  borderLeftWidth: '3px',
                  borderLeftColor: urgencyColor(c.daysUntilRenewal),
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#F1F5F9' }}>
                    {c.client}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                    {c.type} · {c.endDate}
                  </p>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <span
                    className="text-sm font-bold"
                    style={{ color: urgencyColor(c.daysUntilRenewal), fontFamily: "'Space Mono', monospace" }}
                  >
                    {c.daysUntilRenewal}d
                  </span>
                  <p className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                    {fmt(c.valueMonthly)}/mo
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Health cards + Alert log */}
        <div className="col-span-8 flex flex-col gap-4">
          {/* Contract health score cards */}
          <div
            className="rounded-lg border p-4"
            style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
          >
            <p className="text-sm font-semibold mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Contract Health Scores
            </p>
            <div className="grid grid-cols-4 gap-3">
              {CONTRACTS.filter((c) => c.status !== 'Expired').slice(0, 8).map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg px-3 py-2.5 border"
                  style={{ backgroundColor: '#060D1A', borderColor: '#0F2040' }}
                >
                  <p className="text-xs font-medium truncate mb-1.5" style={{ color: '#F1F5F9' }}>
                    {c.client}
                  </p>
                  <HealthBar score={c.healthScore} />
                  <p className="text-xs mt-1.5" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                    {c.type} · {c.autoRenew ? 'auto-renew' : 'manual'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Alert activity log */}
          <div
            className="rounded-lg border p-4 flex-1"
            style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Automated Alert Activity
              </p>
              <span className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                All times local · auto-generated
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {ALERT_ACTIVITY.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg px-3 py-2.5 border"
                  style={{ backgroundColor: '#060D1A', borderColor: '#0F2040' }}
                >
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: a.channel === 'Email' ? '#0D6EFD20' : a.channel === 'Teams' ? '#818CF820' : '#F59E0B20',
                      color: a.channel === 'Email' ? '#0D6EFD' : a.channel === 'Teams' ? '#818CF8' : '#F59E0B',
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {a.channel}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: '#F1F5F9' }}>
                      {a.client}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#475569' }}>
                      {a.message}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className="px-1.5 py-0.5 rounded text-xs font-bold"
                      style={{
                        backgroundColor: a.delivery === 'Delivered' ? '#00D4AA18' : '#EF444418',
                        color: a.delivery === 'Delivered' ? '#00D4AA' : '#EF4444',
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {a.delivery === 'Delivered' ? '✓' : '✗'} {a.delivery}
                    </span>
                    <p className="text-xs mt-1" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>
                      {a.sentAt.split(' ')[1]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Contracts Table */}
      <div
        className="mt-4 rounded-lg border overflow-hidden"
        style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#0F2040' }}>
          <p className="text-sm font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            All Contracts ({CONTRACTS.length})
          </p>
          <div className="flex items-center gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                style={{
                  backgroundColor: filterStatus === s ? '#0D6EFD20' : 'transparent',
                  color: filterStatus === s ? '#0D6EFD' : '#475569',
                  border: `1px solid ${filterStatus === s ? '#0D6EFD40' : '#0F2040'}`,
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #0F2040' }}>
                <ThCell col="client" label="Client" />
                <ThCell col="type" label="Type" />
                <ThCell col="valueMonthly" label="$/Mo" />
                <th className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#475569', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>
                  Start
                </th>
                <ThCell col="endDate" label="End Date" />
                <ThCell col="daysUntilRenewal" label="Renewal" />
                <th className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#475569', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>
                  Auto-Renew
                </th>
                <th className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#475569', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>
                  Status
                </th>
                <th className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#475569', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: '1px solid #0F204060' }}>
                  <td className="py-2.5 px-3">
                    <p className="text-xs font-semibold" style={{ color: '#F1F5F9' }}>{c.client}</p>
                    <p className="text-xs" style={{ color: '#475569', fontFamily: "'Space Mono', monospace" }}>{c.industry}</p>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{ color: TYPE_COLORS[c.type], backgroundColor: TYPE_COLORS[c.type] + '20', fontFamily: "'Space Mono', monospace" }}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs font-bold" style={{ color: '#F1F5F9', fontFamily: "'Space Mono', monospace" }}>
                    {fmt(c.valueMonthly)}
                  </td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}>{c.startDate}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: '#94A3B8', fontFamily: "'Space Mono', monospace" }}>{c.endDate}</td>
                  <td className="py-2.5 px-3 text-xs font-bold" style={{ color: urgencyColor(c.daysUntilRenewal), fontFamily: "'Space Mono', monospace" }}>
                    {c.daysUntilRenewal}d
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-xs" style={{ color: c.autoRenew ? '#00D4AA' : '#F59E0B', fontFamily: "'Space Mono', monospace" }}>
                      {c.autoRenew ? '✓ Yes' : '— No'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ color: STATUS_COLORS[c.status].text, backgroundColor: STATUS_COLORS[c.status].bg, fontFamily: "'Space Mono', monospace" }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <button className="px-2 py-1 rounded text-xs transition-colors" style={{ backgroundColor: '#0D6EFD15', color: '#0D6EFD', fontSize: '10px', fontFamily: "'Space Mono', monospace" }}>
                        Propose
                      </button>
                      <button className="px-2 py-1 rounded text-xs transition-colors" style={{ backgroundColor: '#F59E0B15', color: '#F59E0B', fontSize: '10px', fontFamily: "'Space Mono', monospace" }}>
                        Remind
                      </button>
                      <button className="px-2 py-1 rounded text-xs transition-colors" style={{ backgroundColor: '#47556915', color: '#94A3B8', fontSize: '10px', fontFamily: "'Space Mono', monospace" }}>
                        View
                      </button>
                    </div>
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
          RZ Contract Intelligence · {CONTRACTS.length} contracts · {fmt(CONTRACTS.reduce((s, c) => s + c.valueAnnual, 0))} total ARR
        </span>
        <span className="text-xs" style={{ color: '#00D4AA', fontFamily: "'Space Mono', monospace" }}>
          ✓ Zero missed renewals since deployment
        </span>
      </div>
    </div>
  );
}
