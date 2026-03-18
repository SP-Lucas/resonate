'use client';

import { useState, useRef, useEffect } from 'react';
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

// ---------------------------------------------------------------------------
// Mock product catalogue for search dropdown
// ---------------------------------------------------------------------------
const PRODUCT_CATALOGUE = [
  'Dell Latitude 5540',
  'Cisco Catalyst 9200L-24P-4G-E',
  'HP EliteDesk 800 G9',
  'Fortinet FortiGate 60F',
  'Microsoft Surface Pro 10',
  'Ubiquiti UniFi AP U6-Pro',
  'Palo Alto PA-850',
  'Cisco ISR 4331',
  'Meraki MR76 Access Point',
  'APC Smart-UPS 1500VA',
];

// ---------------------------------------------------------------------------
// Vendor last-3-orders mock data
// ---------------------------------------------------------------------------
const VENDOR_RECENT_ORDERS: Record<string, { date: string; items: string; amount: number }[]> = {
  Synnex: [
    { date: 'Mar 15, 2026', items: 'Dell Latitude 5540 × 12', amount: 22140 },
    { date: 'Feb 28, 2026', items: 'APC Smart-UPS 1500VA × 6', amount: 5340 },
    { date: 'Feb 10, 2026', items: 'HP EliteDesk 800 G9 × 4', amount: 7240 },
  ],
  Ingram: [
    { date: 'Mar 17, 2026', items: 'Fortinet FortiGate 60F × 1', amount: 1240 },
    { date: 'Mar 5, 2026', items: 'Cisco ISR 4331 × 2', amount: 5840 },
    { date: 'Feb 20, 2026', items: 'Microsoft Surface Pro 10 × 3', amount: 5925 },
  ],
  'D&H': [
    { date: 'Mar 8, 2026', items: 'Ubiquiti UniFi AP × 24', amount: 4320 },
    { date: 'Feb 25, 2026', items: 'Meraki MR76 × 8', amount: 4800 },
    { date: 'Feb 12, 2026', items: 'Cisco Catalyst 9200L × 2', amount: 5840 },
  ],
  Arrow: [
    { date: 'Mar 16, 2026', items: 'Cisco Catalyst 9200L × 3', amount: 8760 },
    { date: 'Mar 1, 2026', items: 'Palo Alto PA-850 × 1', amount: 8400 },
    { date: 'Feb 15, 2026', items: 'Fortinet FortiGate 100F × 2', amount: 12480 },
  ],
  Pax8: [
    { date: 'Mar 17, 2026', items: 'Microsoft 365 E3 × 50 seats', amount: 2750 },
    { date: 'Mar 1, 2026', items: 'Azure AD P2 × 120 seats', amount: 1320 },
    { date: 'Feb 1, 2026', items: 'Defender for Business × 200', amount: 1800 },
  ],
  CDW: [
    { date: 'Mar 10, 2026', items: 'HP EliteDesk 800 G9 × 8 + Monitors × 8', amount: 14480 },
    { date: 'Feb 22, 2026', items: 'Dell Latitude 5540 × 5', amount: 9225 },
    { date: 'Feb 5, 2026', items: 'Cisco ISR 4331 × 1', amount: 2920 },
  ],
};

// ---------------------------------------------------------------------------
// Shared components
// ---------------------------------------------------------------------------
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

function OrderStatusBadge({ status }: { status: keyof typeof statusMap }) {
  const s = statusMap[status];
  if (status === 'shipped') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold tracking-widest"
        style={{ ...mono, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: s.color }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: s.color }} />
        </span>
        {s.label}
      </span>
    );
  }
  if (status === 'delivered') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold tracking-widest"
        style={{ ...mono, backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
      >
        <span style={{ fontSize: 11 }}>✓</span>
        {s.label}
      </span>
    );
  }
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

// ---------------------------------------------------------------------------
// Savings sparkline (5-point div chart)
// ---------------------------------------------------------------------------
function SavingsSparkline() {
  // Use last 5 months
  const points = savingsHistory.slice(-5);
  const max = Math.max(...points.map(p => p.saved));
  const min = Math.min(...points.map(p => p.saved));
  const range = max - min || 1;
  const H = 32;
  const W = 100;
  const step = W / (points.length - 1);

  const coords = points.map((p, i) => ({
    x: i * step,
    y: H - ((p.saved - min) / range) * H,
  }));

  const polyline = coords.map(c => `${c.x},${c.y}`).join(' ');

  return (
    <svg width={W} height={H + 4} viewBox={`0 0 ${W} ${H + 4}`} style={{ overflow: 'visible' }}>
      <polyline
        points={polyline}
        fill="none"
        stroke="#00D4AA"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="2" fill="#00D4AA" />
      ))}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Quote loading animation
// ---------------------------------------------------------------------------
type QuotePhase = 'idle' | 'loading' | 'ready';

function QuoteLoader({ onDone }: { onDone: () => void }) {
  const [dots, setDots] = useState(0);
  const [bar, setBar] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    // Animate dots
    const dotId = setInterval(() => {
      if (!mountedRef.current) return;
      setDots(d => (d + 1) % 4);
    }, 350);
    // Animate bar from 0 → 100 over ~1.4s
    let b = 0;
    const barId = setInterval(() => {
      if (!mountedRef.current) return;
      b += 5 + Math.random() * 4;
      if (b >= 100) {
        b = 100;
        clearInterval(barId);
        clearInterval(dotId);
        setTimeout(() => { if (mountedRef.current) onDone(); }, 150);
      }
      setBar(Math.min(b, 100));
    }, 70);
    return () => {
      mountedRef.current = false;
      clearInterval(dotId);
      clearInterval(barId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-3" style={{ border: '1px dashed #00D4AA44', borderRadius: 8 }}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold" style={{ ...mono, color: '#00D4AA' }}>
          Querying 8 distributors{'.'.repeat(dots)}
        </span>
      </div>
      <div className="w-64 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0F2040' }}>
        <div
          className="h-full rounded-full transition-all duration-75"
          style={{ width: `${bar}%`, background: 'linear-gradient(90deg, #00D4AA, #0D6EFD)' }}
        />
      </div>
      <p className="text-xs" style={{ ...sans, color: '#475569' }}>Fetching live pricing · comparing stock levels · calculating savings</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vendor scorecard with hover expand
// ---------------------------------------------------------------------------
function VendorCard({ v }: { v: (typeof vendorScorecards)[0] }) {
  const [hovered, setHovered] = useState(false);
  const recentOrders = VENDOR_RECENT_ORDERS[v.shortName] ?? [];

  return (
    <div
      key={v.name}
      className="p-4 rounded-xl transition-all duration-200"
      style={{
        backgroundColor: '#060D1A',
        border: hovered ? `1px solid ${v.color}44` : '1px solid #0F2040',
        boxShadow: hovered ? `0 0 0 1px ${v.color}22` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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

      {/* Hover-expanded last 3 orders */}
      {hovered && recentOrders.length > 0 && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${v.color}44` }}>
          <p className="text-xs font-bold mb-2" style={{ ...sans, color: '#94A3B8' }}>Last 3 orders</p>
          <div className="space-y-1.5">
            {recentOrders.map((o, i) => (
              <div key={i} className="rounded-md px-2 py-1.5" style={{ backgroundColor: '#0A1225' }}>
                <p className="text-xs font-medium leading-snug" style={{ ...sans, color: '#F1F5F9' }}>{o.items}</p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs" style={{ ...mono, color: '#475569', fontSize: 10 }}>{o.date}</span>
                  <span className="text-xs font-bold" style={{ ...mono, color: v.color, fontSize: 10 }}>{fmt(o.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// New Order panel
// ---------------------------------------------------------------------------
function NewOrderPanel() {
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [quotePhase, setQuotePhase] = useState<QuotePhase>('idle');
  const [searchedTerm, setSearchedTerm] = useState('');
  const [bestRowHighlighted, setBestRowHighlighted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = searchValue.trim()
    ? PRODUCT_CATALOGUE.filter(p => p.toLowerCase().includes(searchValue.toLowerCase()))
    : [];

  function selectProduct(product: string) {
    setSearchValue(product);
    setShowDropdown(false);
    inputRef.current?.focus();
  }

  function handleGetQuotes() {
    if (!searchValue.trim() || quotePhase !== 'idle') return;
    setSearchedTerm(searchValue.trim());
    setShowDropdown(false);
    setQuotePhase('loading');
    setBestRowHighlighted(false);
  }

  function handleQuotesDone() {
    setQuotePhase('ready');
    // Trigger best-row highlight sweep after a tick
    setTimeout(() => setBestRowHighlighted(true), 80);
  }

  function handleClear() {
    setQuotePhase('idle');
    setSearchValue('');
    setSearchedTerm('');
    setBestRowHighlighted(false);
    setShowDropdown(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleGetQuotes();
    if (e.key === 'Escape') setShowDropdown(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div className="col-span-2 rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>New Order — Multi-Distributor Price Comparison</h3>
          <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>Search product name or SKU · RZ fetches live quotes from 8 distributors</p>
        </div>
      </div>

      {/* Search row */}
      <div className="flex gap-2 mb-4 relative">
        <div className="relative flex-1" ref={dropdownRef}>
          {/* Search icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setShowDropdown(e.target.value.trim().length > 0);
            }}
            onFocus={() => {
              if (searchValue.trim().length > 0) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Dell Latitude 5540, Cisco C9200L, HP EliteDesk..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
            style={{
              ...sans,
              backgroundColor: '#060D1A',
              border: '1px solid #0F2040',
              color: '#F1F5F9',
            }}
          />
          {/* Dropdown */}
          {showDropdown && filtered.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-20"
              style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
            >
              {filtered.map((product) => (
                <button
                  key={product}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                  style={{ ...sans, color: '#F1F5F9', display: 'block' }}
                  onMouseDown={(e) => { e.preventDefault(); selectProduct(product); }}
                >
                  <span style={{ color: '#00D4AA', marginRight: 8 }}>›</span>
                  {product}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleGetQuotes}
          disabled={!searchValue.trim() || quotePhase === 'loading'}
          className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ ...sans, backgroundColor: '#00D4AA', color: '#070D1A' }}
        >
          Get Quotes
        </button>
        {quotePhase !== 'idle' && (
          <button
            onClick={handleClear}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ ...sans, backgroundColor: '#0F2040', color: '#94A3B8', border: '1px solid #1E3A5F' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* States */}
      {quotePhase === 'idle' && (
        <div className="flex items-center justify-center py-8" style={{ border: '1px dashed #0F2040', borderRadius: 8 }}>
          <p className="text-sm" style={{ ...sans, color: '#475569' }}>Enter a product name or SKU and click Get Quotes to compare pricing across all distributors.</p>
        </div>
      )}

      {quotePhase === 'loading' && <QuoteLoader onDone={handleQuotesDone} />}

      {quotePhase === 'ready' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs" style={{ ...sans, color: '#475569' }}>Quotes for:</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ ...mono, backgroundColor: '#0a1a2e', color: '#0D6EFD', border: '1px solid #0D6EFD44' }}>
              {searchedTerm}
            </span>
            <span className="text-xs ml-auto" style={{ ...sans, color: '#475569' }}>
              Best price highlighted ·{' '}
              <span style={{ color: '#00D4AA', fontWeight: 600 }}>
                save {fmtDec(mockQuoteResults.find(r => r.isBest)!.listPrice - mockQuoteResults.find(r => r.isBest)!.price)} vs list
              </span>
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
                  className="transition-all duration-500"
                  style={{
                    borderBottom: i < mockQuoteResults.length - 1 ? '1px solid #0a1830' : 'none',
                    backgroundColor: q.isBest
                      ? bestRowHighlighted
                        ? '#051a14'
                        : '#00D4AA18'
                      : 'transparent',
                    transition: 'background-color 0.6s ease-out',
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
  );
}

// ---------------------------------------------------------------------------
// Savings panel with sparkline
// ---------------------------------------------------------------------------
function SavingsPanel() {
  const totalSavings30d = savingsHistory[savingsHistory.length - 1].saved;
  const ordersCount = savingsHistory[savingsHistory.length - 1].ordersCount;

  return (
    <div className="space-y-3">
      {/* Savings Report */}
      <div className="rounded-xl p-4" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
        <h3 className="text-sm font-semibold mb-3" style={{ ...sans, color: '#F1F5F9' }}>Savings Report</h3>

        {/* Prominent stat + sparkline */}
        <div
          className="p-4 rounded-lg mb-3"
          style={{ backgroundColor: '#051a14', border: '1px solid #166534' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs" style={{ ...sans, color: '#475569' }}>Last 30 days vs single-vendor</p>
              <p className="text-3xl font-bold leading-none mt-1" style={{ ...mono, color: '#00D4AA' }}>
                {fmt(totalSavings30d)}
              </p>
              <p className="text-xs mt-1" style={{ ...sans, color: '#00D4AA' }}>
                saved across {ordersCount} orders
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 pt-1">
              <SavingsSparkline />
              <span className="text-xs" style={{ ...mono, color: '#475569', fontSize: 9 }}>6-month trend</span>
            </div>
          </div>
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
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProcurementPage() {
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
        <NewOrderPanel />
        <SavingsPanel />
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
                <td className="py-2.5 pr-4"><OrderStatusBadge status={order.status} /></td>
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
          <span className="text-xs" style={{ ...sans, color: '#475569' }}>YTD performance · 6 primary distributors · hover to see recent orders</span>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {vendorScorecards.map((v) => (
            <VendorCard key={v.name} v={v} />
          ))}
        </div>
      </div>
    </div>
  );
}
