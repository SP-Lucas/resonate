'use client';

import { useState, useRef } from 'react';
import {
  financeKpis,
  licenseRows,
  payrollEntries,
  arAgingBuckets,
  recentTransactions,
} from '@/lib/mock-data/finance';

const mono = { fontFamily: "'Space Mono', monospace" };
const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" };

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

function StatusPill({ status }: { status: 'match' | 'over' | 'under' }) {
  const map = {
    match: { label: 'MATCH', bg: '#052e16', color: '#00D4AA', border: '#166534' },
    over: { label: 'OVER', bg: '#2d1a00', color: '#F59E0B', border: '#78350f' },
    under: { label: 'UNDER', bg: '#1c1917', color: '#94A3B8', border: '#44403c' },
  };
  const s = map[status];
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-bold tracking-widest"
      style={{ ...mono, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

function TxStatusPill({ status }: { status: 'paid' | 'pending' | 'overdue' }) {
  const map = {
    paid: { label: 'PAID', bg: '#052e16', color: '#00D4AA', border: '#166534' },
    pending: { label: 'PENDING', bg: '#2d1a00', color: '#F59E0B', border: '#78350f' },
    overdue: { label: 'OVERDUE', bg: '#450a0a', color: '#EF4444', border: '#7f1d1d' },
  };
  const s = map[status];
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-bold tracking-widest"
      style={{ ...mono, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

function RZBadge({ lastSync }: { lastSync: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ backgroundColor: '#051a14', border: '1px solid #00D4AA33' }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#00D4AA' }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#00D4AA' }} />
      </span>
      <span className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#00D4AA' }}>RZ AUTO-RECONCILED</span>
      <span className="text-xs" style={{ ...mono, color: '#475569' }}>{lastSync}</span>
    </div>
  );
}

function InvoicePanel() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function runCycle() {
    if (running || done) return;
    setRunning(true);
    setProgress(0);
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += Math.random() * 3 + 1;
      if (p >= 100) {
        p = 100;
        clearInterval(intervalRef.current!);
        setDone(true);
        setRunning(false);
      }
      setProgress(Math.min(p, 100));
    }, 200);
  }

  function reset() {
    setRunning(false);
    setProgress(0);
    setDone(false);
  }

  const stages = [
    { label: 'Fetching service delivery data', pct: 15 },
    { label: 'Reconciling license counts', pct: 35 },
    { label: 'Applying contract pricing', pct: 58 },
    { label: 'Generating PDF invoices', pct: 78 },
    { label: 'Dispatching via email', pct: 92 },
    { label: 'Posting to QuickBooks', pct: 100 },
  ];

  const currentStage = stages.findLast((s) => progress >= s.pct) ?? null;

  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>Invoice Generation</h3>
          <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>Automated billing cycle · All 247 clients</p>
        </div>
        <RZBadge lastSync="synced 4m ago" />
      </div>

      <div
        className="flex items-center justify-between p-4 rounded-lg mb-4"
        style={{ backgroundColor: '#060D1A', border: '1px solid #0F2040' }}
      >
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs" style={{ ...sans, color: '#475569' }}>Clients</p>
            <p className="text-xl font-bold" style={{ ...mono, color: '#F1F5F9' }}>247</p>
          </div>
          <div style={{ width: 1, height: 36, backgroundColor: '#0F2040' }} />
          <div>
            <p className="text-xs" style={{ ...sans, color: '#475569' }}>Total Value</p>
            <p className="text-xl font-bold" style={{ ...mono, color: '#00D4AA' }}>$847,320</p>
          </div>
          <div style={{ width: 1, height: 36, backgroundColor: '#0F2040' }} />
          <div>
            <p className="text-xs" style={{ ...sans, color: '#475569' }}>Est. Time</p>
            <p className="text-xl font-bold" style={{ ...mono, color: '#818CF8' }}>18 min</p>
          </div>
          <div style={{ width: 1, height: 36, backgroundColor: '#0F2040' }} />
          <div>
            <p className="text-xs" style={{ ...sans, color: '#475569' }}>Manual Would Take</p>
            <p className="text-xl font-bold" style={{ ...mono, color: '#EF4444' }}>40 hrs</p>
          </div>
        </div>
        <div className="flex gap-2">
          {done && (
            <button
              onClick={reset}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ ...sans, backgroundColor: '#0F2040', color: '#94A3B8', border: '1px solid #1E3A5F' }}
            >
              Reset
            </button>
          )}
          <button
            onClick={runCycle}
            disabled={running || done}
            className="px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-60"
            style={{ ...sans, backgroundColor: done ? '#052e16' : '#00D4AA', color: done ? '#00D4AA' : '#070D1A', border: done ? '1px solid #166534' : 'none' }}
          >
            {done ? '✓ Cycle Complete' : running ? 'Running...' : 'Run Invoice Cycle'}
          </button>
        </div>
      </div>

      {(running || done) && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs" style={{ ...mono, color: '#94A3B8' }}>
              {currentStage?.label ?? 'Initializing...'}
            </span>
            <span className="text-xs font-bold" style={{ ...mono, color: '#00D4AA' }}>{Math.round(progress)}%</span>
          </div>
          <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0F2040' }}>
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: done ? '#00D4AA' : 'linear-gradient(90deg, #00D4AA, #0D6EFD)',
              }}
            />
          </div>
          {done && (
            <div className="mt-3 flex gap-3">
              <div className="flex-1 p-3 rounded-lg text-center" style={{ backgroundColor: '#052e16', border: '1px solid #166534' }}>
                <p className="text-xs font-bold" style={{ ...mono, color: '#00D4AA' }}>247 INVOICES SENT</p>
                <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>via email + portal</p>
              </div>
              <div className="flex-1 p-3 rounded-lg text-center" style={{ backgroundColor: '#0a1a2e', border: '1px solid #0D6EFD44' }}>
                <p className="text-xs font-bold" style={{ ...mono, color: '#0D6EFD' }}>QB SYNCED</p>
                <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>QuickBooks updated</p>
              </div>
              <div className="flex-1 p-3 rounded-lg text-center" style={{ backgroundColor: '#1c1028', border: '1px solid #818CF844' }}>
                <p className="text-xs font-bold" style={{ ...mono, color: '#818CF8' }}>17 MIN 42 SEC</p>
                <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>total elapsed time</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ARAgingChart() {
  const total = arAgingBuckets.reduce((s, b) => s + b.amount, 0);
  return (
    <div className="rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>AR Aging</h3>
        <span className="text-xs font-bold" style={{ ...mono, color: '#94A3B8' }}>
          TOTAL: <span style={{ color: '#F1F5F9' }}>{fmt(total)}</span>
        </span>
      </div>
      <div className="space-y-3">
        {arAgingBuckets.map((bucket) => {
          const pct = (bucket.amount / total) * 100;
          return (
            <div key={bucket.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ ...sans, color: '#94A3B8' }}>{bucket.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ ...mono, color: '#475569' }}>{bucket.count} inv</span>
                  <span className="text-sm font-bold" style={{ ...mono, color: bucket.color }}>{fmt(bucket.amount)}</span>
                </div>
              </div>
              <div className="relative h-6 rounded" style={{ backgroundColor: '#060D1A' }}>
                <div
                  className="absolute left-0 top-0 h-full rounded transition-all"
                  style={{ width: `${pct}%`, backgroundColor: bucket.color, opacity: 0.85 }}
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2">
                  <span className="text-xs font-bold" style={{ ...mono, color: '#070D1A', mixBlendMode: 'normal' }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FinancePage() {
  const [now] = useState(() => new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }));

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#070D1A' }}>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#475569' }}>RESONATE MSP</span>
            <span style={{ color: '#0F2040' }}>/</span>
            <span className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#00D4AA' }}>FINANCIAL OPS</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ ...sans, color: '#F1F5F9' }}>Financial Operations</h1>
          <p className="text-sm mt-1" style={{ ...sans, color: '#475569' }}>
            160 hrs/mo traditional → 8 hrs/mo with RZ · 95% labor reduction · {now}
          </p>
        </div>
        <RZBadge lastSync="last sync: 4m ago" />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {financeKpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl p-4"
            style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}
          >
            <p className="text-xs mb-2" style={{ ...sans, color: '#475569' }}>{kpi.label}</p>
            <p className="text-2xl font-bold leading-none mb-1" style={{ ...mono, color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs" style={{ ...sans, color: '#475569' }}>{kpi.sub}</p>
            <div className="mt-2 flex items-center gap-1">
              <span
                className="text-xs font-medium"
                style={{ ...sans, color: kpi.trend === 'up' ? '#00D4AA' : kpi.trend === 'down' ? '#00D4AA' : '#94A3B8' }}
              >
                {kpi.trend === 'up' ? '↑' : kpi.trend === 'down' ? '↓' : '→'} {kpi.trendValue}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* License Reconciliation — 2 cols */}
        <div className="col-span-2 rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>Microsoft 365 License Reconciliation</h3>
              <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>
                {licenseRows.filter(r => r.status === 'over').length} over-provisioned · {licenseRows.filter(r => r.status === 'under').length} under-provisioned · {licenseRows.filter(r => r.status === 'match').length} matched
              </p>
            </div>
            <RZBadge lastSync="auto-reconciled" />
          </div>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid #0F2040' }}>
                  {['Client', 'Licensed', 'Deployed', 'Delta', 'Monthly Cost', 'Status'].map(h => (
                    <th key={h} className="pb-2 text-left font-medium" style={{ ...sans, color: '#475569' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {licenseRows.map((row, i) => (
                  <tr
                    key={row.client}
                    style={{ borderBottom: i < licenseRows.length - 1 ? '1px solid #0a1830' : 'none' }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-2.5 pr-4" style={{ ...sans, color: '#F1F5F9' }}>{row.client}</td>
                    <td className="py-2.5 pr-4" style={{ ...mono, color: '#94A3B8' }}>{row.licensed}</td>
                    <td className="py-2.5 pr-4" style={{ ...mono, color: '#94A3B8' }}>{row.deployed}</td>
                    <td className="py-2.5 pr-4">
                      <span style={{ ...mono, color: row.delta > 0 ? '#F59E0B' : row.delta < 0 ? '#94A3B8' : '#00D4AA', fontWeight: 700 }}>
                        {row.delta > 0 ? `+${row.delta}` : row.delta}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4" style={{ ...mono, color: '#F1F5F9' }}>{fmt(row.monthlyCost)}</td>
                    <td className="py-2.5"><StatusPill status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AR Aging */}
        <ARAgingChart />
      </div>

      {/* Invoice Generation */}
      <div className="mb-4">
        <InvoicePanel />
      </div>

      {/* Bottom grid: Payroll + Recent Transactions */}
      <div className="grid grid-cols-3 gap-4">
        {/* Upcoming Payroll */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>Upcoming Payroll</h3>
            <div>
              <span className="text-xs font-bold mr-2" style={{ ...mono, color: '#475569' }}>
                W-2 <span style={{ color: '#F1F5F9' }}>{fmt(payrollEntries.filter(e => e.type === 'W2').reduce((s, e) => s + e.amount, 0))}</span>
              </span>
              <span className="text-xs font-bold" style={{ ...mono, color: '#475569' }}>
                1099 <span style={{ color: '#F1F5F9' }}>{fmt(payrollEntries.filter(e => e.type === '1099').reduce((s, e) => s + e.amount, 0))}</span>
              </span>
            </div>
          </div>
          <div className="space-y-1">
            {payrollEntries.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                style={{ backgroundColor: '#060D1A' }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="px-1.5 py-0.5 rounded text-xs font-bold"
                    style={{ ...mono, backgroundColor: entry.type === 'W2' ? '#0a1a2e' : '#1c1028', color: entry.type === 'W2' ? '#0D6EFD' : '#818CF8', border: `1px solid ${entry.type === 'W2' ? '#0D6EFD44' : '#818CF844'}` }}
                  >
                    {entry.type}
                  </span>
                  <div>
                    <p className="text-xs font-medium" style={{ ...sans, color: '#F1F5F9' }}>{entry.name}</p>
                    <p className="text-xs" style={{ ...sans, color: '#475569' }}>{entry.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ ...mono, color: '#F1F5F9' }}>{fmt(entry.amount)}</p>
                  <p className="text-xs" style={{ ...mono, color: '#475569' }}>{entry.nextPayDate}</p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-lg"
            style={{ backgroundColor: '#052e16', border: '1px solid #166534' }}
          >
            <span className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#00D4AA' }}>TOTAL PAYROLL RUN</span>
            <span className="text-sm font-bold" style={{ ...mono, color: '#00D4AA' }}>
              {fmt(payrollEntries.reduce((s, e) => s + e.amount, 0))}
            </span>
          </div>
        </div>

        {/* Recent Transactions — 2 cols */}
        <div className="col-span-2 rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>Recent Transactions</h3>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded" style={{ ...mono, backgroundColor: '#052e16', color: '#00D4AA' }}>
                3 PAID
              </span>
              <span className="text-xs px-2 py-1 rounded" style={{ ...mono, backgroundColor: '#2d1a00', color: '#F59E0B' }}>
                2 PENDING
              </span>
              <span className="text-xs px-2 py-1 rounded" style={{ ...mono, backgroundColor: '#450a0a', color: '#EF4444' }}>
                1 OVERDUE
              </span>
            </div>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid #0F2040' }}>
                {['Invoice #', 'Client', 'Type', 'Amount', 'Date', 'Status'].map(h => (
                  <th key={h} className="pb-2 text-left font-medium" style={{ ...sans, color: '#475569' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, i) => (
                <tr
                  key={tx.id}
                  style={{ borderBottom: i < recentTransactions.length - 1 ? '1px solid #0a1830' : 'none' }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 pr-4" style={{ ...mono, color: '#475569' }}>{tx.id}</td>
                  <td className="py-3 pr-4" style={{ ...sans, color: '#F1F5F9', fontWeight: 500 }}>{tx.client}</td>
                  <td className="py-3 pr-4" style={{ ...sans, color: '#94A3B8' }}>{tx.type}</td>
                  <td className="py-3 pr-4" style={{ ...mono, color: '#F1F5F9', fontWeight: 700 }}>{fmt(tx.amount)}</td>
                  <td className="py-3 pr-4" style={{ ...mono, color: '#475569' }}>{tx.date}</td>
                  <td className="py-3"><TxStatusPill status={tx.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary footer */}
          <div
            className="mt-4 grid grid-cols-4 gap-3 p-3 rounded-lg"
            style={{ backgroundColor: '#060D1A', border: '1px solid #0F2040' }}
          >
            <div className="text-center">
              <p className="text-xs" style={{ ...sans, color: '#475569' }}>Month Close</p>
              <p className="text-sm font-bold" style={{ ...mono, color: '#00D4AA' }}>4 hrs</p>
              <p className="text-xs" style={{ ...sans, color: '#475569' }}>vs 5-day standard</p>
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ ...sans, color: '#475569' }}>Annual Labor</p>
              <p className="text-sm font-bold" style={{ ...mono, color: '#00D4AA' }}>$7,280</p>
              <p className="text-xs" style={{ ...sans, color: '#475569' }}>vs $91K traditional</p>
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ ...sans, color: '#475569' }}>DSO</p>
              <p className="text-sm font-bold" style={{ ...mono, color: '#00D4AA' }}>11 days</p>
              <p className="text-xs" style={{ ...sans, color: '#475569' }}>vs 45-day avg</p>
            </div>
            <div className="text-center">
              <p className="text-xs" style={{ ...sans, color: '#475569' }}>Invoice Time</p>
              <p className="text-sm font-bold" style={{ ...mono, color: '#00D4AA' }}>18 min</p>
              <p className="text-xs" style={{ ...sans, color: '#475569' }}>247 clients billed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
