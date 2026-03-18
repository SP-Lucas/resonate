'use client';

import { useState } from 'react';
import {
  procurementKpis,
  mockQuoteResults,
  activeOrders,
  vendorScorecards,
  savingsHistory,
} from '@/lib/mock-data/procurement';

const mono = { fontFamily: "'Space Mono', monospace" };
const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" };

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
function fmtDec(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function RZBadge({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#051a14', border: '1px solid #00D4AA33' }}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#00D4AA' }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#00D4AA' }} />
      </span>
      <span className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#00D4AA' }}>{label}</span>
      <span className="text-xs" style={{ ...mono, color: '#475569' }}>{sub}</span>
    </div>
  );
}

const statusMap = {
  ordered: { label: 'ORDERED', bg: '#0a1a2e', color: '#0D6EFD', border: '#0D6EFD44' },
  processing: { label: 'PROCESSING', bg: '#1c1028', color: '#818CF8', border: '#818CF844' },
  shipped: { label: 'SHIPPED', bg: '#2d1a00', color: '#F59E0B', border: '#78350f' },
  delivered: { label: 'DELIVERED', bg: '#052e16', color: '#00D4AA', border: '#166534' },
} as const;

function OrderStatusPill({ status }: { status: keyof typeof statusMap }) {
  const s = statusMap[status];
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-bold tracking-widest"
      style={{ ...mono, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#0F2040' }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function ProcurementPage() {
  const [searchValue, setSearchValue] = useState('');
  const [showQuotes, setShowQuotes] = useState(false);
  const [searchedTerm, setSearchedTerm] = useState('');

  function handleGetQuotes() {
    if (!searchValue.trim()) return;
    setSearchedTerm(searchValue.trim());
    setShowQuotes(true);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleGetQuotes();
  }

  const totalSavings30d = savingsHistory[savingsHistory.length - 1].saved;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#070D1A' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#475569' }}>RESONATE MSP</span>
            <span style={{ color: '#0F2040' }}>/</span>
            <span className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#00D4AA' }}>PROCUREMENT</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ ...sans, color: '#F1F5F9' }}>Procurement & Vendor Management</h1>
          <p className="text-sm mt-1" style={{ ...sans, color: '#475569' }}>
            8 distributors · 5 min/order vs 2 hrs manual · 10%+ cost savings · Mar 17, 2026
          </p>
        </div>
        <RZBadge label="RZ PRICE ENGINE" sub="live quotes" />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {procurementKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl p-4" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
            <p className="text-xs mb-2" style={{ ...sans, color: '#475569' }}>{kpi.label}</p>
            <p className="text-2xl font-bold leading-none mb-1" style={{ ...mono, color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs" style={{ ...sans, color: '#475569' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Top grid: New Order + Savings */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* New Order Panel — 2 cols */}
        <div className="col-span-2 rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>New Order — Multi-Distributor Price Comparison</h3>
              <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>Search product name or SKU · RZ fetches live quotes from 8 distributors</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Dell Latitude 5540, Cisco C9200L-24P-4X-E, HP EliteDesk..."
              className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                ...sans,
                backgroundColor: '#060D1A',
                border: '1px solid #0F2040',
                color: '#F1F5F9',
              }}
            />
            <button
              onClick={handleGetQuotes}
              className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90"
              style={{ ...sans, backgroundColor: '#00D4AA', color: '#070D1A' }}
            >
              Get Quotes
            </button>
            {showQuotes && (
              <button
                onClick={() => { setShowQuotes(false); setSearchValue(''); setSearchedTerm(''); }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ ...sans, backgroundColor: '#0F2040', color: '#94A3B8', border: '1px solid #1E3A5F' }}
              >
                Clear
              </button>
            )}
          </div>

          {!showQuotes && (
            <div className="flex items-center justify-center py-8" style={{ border: '1px dashed #0F2040', borderRadius: 8 }}>
              <p className="text-sm" style={{ ...sans, color: '#475569' }}>Enter a product name or SKU and click Get Quotes to compare pricing across all distributors.</p>
            </div>
          )}

          {showQuotes && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs" style={{ ...sans, color: '#475569' }}>Quotes for:</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ ...mono, backgroundColor: '#0a1a2e', color: '#0D6EFD', border: '1px solid #0D6EFD44' }}>
                  {searchedTerm}
                </span>
                <span className="text-xs ml-auto" style={{ ...sans, color: '#475569' }}>
                  Best price highlighted · <span style={{ color: '#00D4AA', fontWeight: 600 }}>save {fmtDec(mockQuoteResults.find(r => r.isBest)!.listPrice - mockQuoteResults.find(r => r.isBest)!.price)} vs list</span>
                </span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid #0F2040' }}>
                    {['Distributor', 'Unit Price', 'vs. List', 'Stock', 'ETA', 'Lead Time', ''].map(h => (
                      <th key={h} className="pb-2 text-left font-medium" style={{ ...sans, color: '#475569' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockQuoteResults.sort((a, b) => a.price - b.price).map((q, i) => (
                    <tr
                      key={q.distributor}
                      className="transition-colors"
                      style={{
                        borderBottom: i < mockQuoteResults.length - 1 ? '1px solid #0a1830' : 'none',
                        backgroundColor: q.isBest ? '#051a14' : 'transparent',
                      }}
                    >
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-2">
                          {q.isBest && <span className="text-xs font-bold" style={{ ...mono, color: '#00D4AA' }}>★</span>}
                          <span style={{ ...sans, color: q.isBest ? '#00D4AA' : '#F1F5F9', fontWeight: q.isBest ? 700 : 400 }}>{q.distributor}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4" style={{ ...mono, color: q.isBest ? '#00D4AA' : '#F1F5F9', fontWeight: q.isBest ? 700 : 400 }}>
                        {fmtDec(q.price)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span style={{ ...mono, color: '#00D4AA' }}>
                          -{(((q.listPrice - q.price) / q.listPrice) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 pr-4" style={{ ...mono, color: typeof q.stock === 'number' ? '#94A3B8' : '#F59E0B' }}>
                        {q.stock === 'POD' ? 'POD' : q.stock}
                      </td>
                      <td className="py-2.5 pr-4" style={{ ...mono, color: '#94A3B8' }}>{q.eta}</td>
                      <td className="py-2.5 pr-4" style={{ ...sans, color: '#475569' }}>{q.leadTime}</td>
                      <td className="py-2.5">
                        <button
                          className="px-3 py-1 rounded text-xs font-bold transition-all"
                          style={{
                            ...sans,
                            backgroundColor: q.isBest ? '#00D4AA' : '#0F2040',
                            color: q.isBest ? '#070D1A' : '#94A3B8',
                            border: q.isBest ? 'none' : '1px solid #1E3A5F',
                          }}
                        >
                          {q.isBest ? 'Order Now' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Savings + Vendor summary */}
        <div className="space-y-3">
          {/* Savings Report */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ ...sans, color: '#F1F5F9' }}>Savings Report</h3>
            <div
              className="p-3 rounded-lg mb-3"
              style={{ backgroundColor: '#051a14', border: '1px solid #166534' }}
            >
              <p className="text-xs" style={{ ...sans, color: '#475569' }}>Last 30 days vs single-vendor</p>
              <p className="text-2xl font-bold" style={{ ...mono, color: '#00D4AA' }}>{fmt(totalSavings30d)}</p>
              <p className="text-xs mt-0.5" style={{ ...sans, color: '#00D4AA' }}>saved across {savingsHistory[savingsHistory.length - 1].ordersCount} orders</p>
            </div>
            <div className="space-y-1.5">
              {savingsHistory.slice(-4).map((s) => (
                <div key={s.month} className="flex items-center justify-between">
                  <span className="text-xs" style={{ ...sans, color: '#475569' }}>{s.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#0F2040' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(s.saved / 15000) * 100}%`, backgroundColor: '#00D4AA' }}
                      />
                    </div>
                    <span className="text-xs font-bold w-14 text-right" style={{ ...mono, color: '#00D4AA' }}>{fmt(s.saved)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-xl p-4" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ ...sans, color: '#F1F5F9' }}>Pending Approvals</h3>
            <div className="space-y-2">
              {[
                { id: 'PO-20260317-008', desc: 'Palo Alto PA-850 × 1', amount: 8400, requestor: 'J. Walsh' },
                { id: 'PO-20260317-009', desc: 'Cisco ISR 4331 × 2', amount: 5840, requestor: 'M. Rivera' },
                { id: 'PO-20260317-010', desc: 'Meraki MR76 × 12', amount: 7200, requestor: 'T. Okafor' },
              ].map((item) => (
                <div key={item.id} className="p-2.5 rounded-lg" style={{ backgroundColor: '#060D1A', border: '1px solid #0F2040' }}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium" style={{ ...sans, color: '#F1F5F9' }}>{item.desc}</span>
                    <span className="text-xs font-bold" style={{ ...mono, color: '#F59E0B' }}>{fmt(item.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ ...mono, color: '#475569' }}>{item.id}</span>
                    <div className="flex gap-1">
                      <button className="px-2 py-0.5 rounded text-xs font-bold" style={{ ...sans, backgroundColor: '#052e16', color: '#00D4AA' }}>Approve</button>
                      <button className="px-2 py-0.5 rounded text-xs" style={{ ...sans, backgroundColor: '#0F2040', color: '#94A3B8' }}>Deny</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>Active Orders</h3>
          <div className="flex gap-2">
            {(['processing', 'ordered', 'shipped', 'delivered'] as const).map((s) => {
              const count = activeOrders.filter(o => o.status === s).length;
              const m = statusMap[s];
              return (
                <span key={s} className="text-xs px-2 py-1 rounded font-bold" style={{ ...mono, backgroundColor: m.bg, color: m.color }}>
                  {count} {m.label}
                </span>
              );
            })}
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: '1px solid #0F2040' }}>
              {['Order #', 'Items', 'Client', 'Distributor', 'Status', 'Total', 'Date'].map(h => (
                <th key={h} className="pb-2 text-left font-medium" style={{ ...sans, color: '#475569' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeOrders.map((order, i) => (
              <tr
                key={order.id}
                className="hover:bg-white/5 transition-colors"
                style={{ borderBottom: i < activeOrders.length - 1 ? '1px solid #0a1830' : 'none' }}
              >
                <td className="py-2.5 pr-4" style={{ ...mono, color: '#475569' }}>{order.id}</td>
                <td className="py-2.5 pr-4 max-w-48">
                  <span style={{ ...sans, color: '#F1F5F9' }}>{order.items}</span>
                  {order.trackingNum && (
                    <p className="text-xs mt-0.5" style={{ ...mono, color: '#475569', fontSize: 10 }}>TRK: {order.trackingNum}</p>
                  )}
                </td>
                <td className="py-2.5 pr-4" style={{ ...sans, color: '#94A3B8' }}>{order.client}</td>
                <td className="py-2.5 pr-4" style={{ ...sans, color: '#94A3B8' }}>{order.distributor}</td>
                <td className="py-2.5 pr-4"><OrderStatusPill status={order.status} /></td>
                <td className="py-2.5 pr-4 font-bold" style={{ ...mono, color: '#F1F5F9' }}>{fmt(order.total)}</td>
                <td className="py-2.5" style={{ ...mono, color: '#475569' }}>{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vendor Scorecards */}
      <div className="rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>Vendor Scorecards</h3>
          <span className="text-xs" style={{ ...sans, color: '#475569' }}>YTD performance · 6 primary distributors</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {vendorScorecards.map((v) => (
            <div key={v.name} className="p-4 rounded-xl" style={{ backgroundColor: '#060D1A', border: '1px solid #0F2040' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold" style={{ ...sans, color: '#F1F5F9' }}>{v.shortName}</span>
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ ...mono, backgroundColor: '#051a14', color: '#00D4AA' }}
                >
                  {v.priceScore}
                </span>
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ ...sans, color: '#475569' }}>Fill Rate</span>
                    <span className="text-xs font-bold" style={{ ...mono, color: v.fillRate >= 96 ? '#00D4AA' : '#F59E0B' }}>{v.fillRate}%</span>
                  </div>
                  <ScoreBar value={v.fillRate} color={v.fillRate >= 96 ? '#00D4AA' : '#F59E0B'} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ ...sans, color: '#475569' }}>Avg Delivery</span>
                    <span className="text-xs font-bold" style={{ ...mono, color: '#94A3B8' }}>{v.avgDeliveryDays}d</span>
                  </div>
                  <ScoreBar value={Math.max(0, 100 - (v.avgDeliveryDays / 5) * 100)} color={v.color} />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs" style={{ ...sans, color: '#475569' }}>Price Index</span>
                    <span className="text-xs font-bold" style={{ ...mono, color: v.priceScore >= 90 ? '#00D4AA' : '#94A3B8' }}>{v.priceScore}/100</span>
                  </div>
                  <ScoreBar value={v.priceScore} color={v.priceScore >= 90 ? '#00D4AA' : '#818CF8'} />
                </div>
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid #0F2040' }}>
                <p className="text-xs" style={{ ...sans, color: '#475569' }}>{v.totalOrders} orders YTD</p>
                <p className="text-xs font-bold mt-0.5" style={{ ...mono, color: '#F1F5F9' }}>{fmt(v.ytdSpend)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
