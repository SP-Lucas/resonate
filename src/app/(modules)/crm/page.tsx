'use client';

import { useState } from 'react';
import {
  pipelineStages,
  activeDeals,
  scoredLeads,
  quoteServices,
  salesReps,
  mockQuoteLineItems,
} from '@/lib/mock-data/crm';

const mono = { fontFamily: "'Space Mono', monospace" };
const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" };

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
function fmtK(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
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

function AiScoreBadge({ score, confidence }: { score: number; confidence: 'high' | 'medium' | 'low' }) {
  const color = score >= 85 ? '#00D4AA' : score >= 70 ? '#F59E0B' : '#94A3B8';
  const bg = score >= 85 ? '#051a14' : score >= 70 ? '#2d1a00' : '#1c1917';
  const border = score >= 85 ? '#166534' : score >= 70 ? '#78350f' : '#44403c';
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold"
      style={{ ...mono, backgroundColor: bg, color, border: `1px solid ${border}` }}
    >
      <span style={{ color: '#475569', fontWeight: 400 }}>AI</span>
      {score}
      <span className="text-xs" style={{ color: confidence === 'high' ? '#00D4AA' : confidence === 'medium' ? '#F59E0B' : '#475569', fontWeight: 400 }}>
        {confidence === 'high' ? '●' : confidence === 'medium' ? '◐' : '○'}
      </span>
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Prospect: { bg: '#1c1917', color: '#94A3B8' },
    Qualified: { bg: '#0a1a2e', color: '#0D6EFD' },
    Proposal: { bg: '#1c1028', color: '#818CF8' },
    Negotiation: { bg: '#2d1a00', color: '#F59E0B' },
    'Closed Won': { bg: '#052e16', color: '#00D4AA' },
  };
  const s = map[stage] ?? { bg: '#0F2040', color: '#94A3B8' };
  return (
    <span className="px-2 py-0.5 rounded text-xs font-bold tracking-wide" style={{ ...mono, backgroundColor: s.bg, color: s.color }}>
      {stage.toUpperCase()}
    </span>
  );
}

function ScoreCircle({ score, size = 48 }: { score: number; size?: number }) {
  const color = score >= 85 ? '#00D4AA' : score >= 70 ? '#F59E0B' : '#94A3B8';
  const r = (size / 2) - 4;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#0F2040" strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="text-xs font-bold" style={{ ...mono, color }}>{score}</span>
    </div>
  );
}

export default function CRMPage() {
  const [selectedClient, setSelectedClient] = useState('Helion Energy');
  const [selectedServices, setSelectedServices] = useState<string[]>(['mms-pro', 'edr', 'm365-bp', 'backup', 'vciso']);
  const [quoteGenerated, setQuoteGenerated] = useState(false);
  const [quoteUserCount, setQuoteUserCount] = useState('85');

  function toggleService(id: string) {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
    setQuoteGenerated(false);
  }

  const totalPipelineValue = pipelineStages.reduce((s, st) => s + st.value, 0);

  const quoteLines = mockQuoteLineItems.filter(line =>
    selectedServices.some(id => quoteServices.find(s => s.id === id)?.name === line.service)
  );
  const quoteTotal = quoteLines.reduce((s, l) => s + l.total, 0);

  const clients = ['Helion Energy', 'Redwood Analytics', 'Coastal Credit Union', 'Silvergate Wealth Mgmt', 'Orbital Defense Systems', 'Luminary Biotech'];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#070D1A' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#475569' }}>RESONATE MSP</span>
            <span style={{ color: '#0F2040' }}>/</span>
            <span className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#00D4AA' }}>CRM & SALES</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ ...sans, color: '#F1F5F9' }}>Sales & CRM</h1>
          <p className="text-sm mt-1" style={{ ...sans, color: '#475569' }}>
            90%+ AI lead accuracy · 34%+ close rate · 5-min quote gen · 3x faster sales cycle · Mar 17, 2026
          </p>
        </div>
        <RZBadge label="RZ AI SCORING" sub="models refreshed 12m ago" />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Pipeline Value', value: fmtK(totalPipelineValue), sub: `${pipelineStages.reduce((s, st) => s + st.count, 0)} active opportunities`, color: '#F1F5F9' },
          { label: 'Weighted Pipeline', value: fmtK(activeDeals.reduce((s, d) => s + d.value * d.probability / 100, 0)), sub: 'probability-adjusted', color: '#818CF8' },
          { label: 'MTD Closed Won', value: '$720K', sub: '6 deals · Mar 2026', color: '#00D4AA' },
          { label: 'Avg Close Rate', value: '34.2%', sub: 'vs 28% industry avg', color: '#00D4AA' },
          { label: 'Avg Quote Time', value: '5 min', sub: 'vs 2 hrs manual', color: '#00D4AA' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl p-4" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
            <p className="text-xs mb-2" style={{ ...sans, color: '#475569' }}>{kpi.label}</p>
            <p className="text-2xl font-bold leading-none mb-1" style={{ ...mono, color: kpi.color }}>{kpi.value}</p>
            <p className="text-xs" style={{ ...sans, color: '#475569' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Funnel */}
      <div className="rounded-xl p-5 mb-4" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>Pipeline Funnel</h3>
            <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>
              {pipelineStages.reduce((s, st) => s + st.count, 0)} opportunities · {fmtK(totalPipelineValue)} total value
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {pipelineStages.map((stage, i) => (
            <div key={stage.name} className="flex items-center gap-4">
              <div className="w-24 text-right">
                <span className="text-xs font-medium" style={{ ...sans, color: '#94A3B8' }}>{stage.name}</span>
              </div>
              <div className="flex-1 relative" style={{ marginLeft: `${(100 - stage.widthPct) / 2}%`, marginRight: `${(100 - stage.widthPct) / 2}%` }}>
                <div
                  className="h-9 rounded flex items-center px-4 justify-between transition-all"
                  style={{ backgroundColor: stage.color, opacity: 0.9 - i * 0.05 }}
                >
                  <span className="text-xs font-bold" style={{ ...mono, color: '#F1F5F9' }}>{stage.count} deals</span>
                  <span className="text-xs font-bold" style={{ ...mono, color: '#F1F5F9' }}>{fmtK(stage.value)}</span>
                </div>
              </div>
              <div className="w-20">
                {i < pipelineStages.length - 1 && (
                  <span className="text-xs" style={{ ...mono, color: '#475569' }}>
                    {((pipelineStages[i + 1].count / stage.count) * 100).toFixed(0)}% conv
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle grid: Active Deals + Lead Scoring */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Active Deals table — 2 cols */}
        <div className="col-span-2 rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>Active Deals</h3>
            <span className="text-xs" style={{ ...sans, color: '#475569' }}>
              {activeDeals.length} deals · {fmtK(activeDeals.reduce((s, d) => s + d.value, 0))} total value
            </span>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid #0F2040' }}>
                  {['Company / Contact', 'Stage', 'Value', 'Prob', 'AI Score', 'Last Activity', 'Next Action'].map(h => (
                    <th key={h} className="pb-2 text-left font-medium whitespace-nowrap pr-3" style={{ ...sans, color: '#475569' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeDeals.map((deal, i) => (
                  <tr
                    key={deal.id}
                    className="hover:bg-white/5 transition-colors"
                    style={{ borderBottom: i < activeDeals.length - 1 ? '1px solid #0a1830' : 'none' }}
                  >
                    <td className="py-2.5 pr-3">
                      <p className="font-semibold" style={{ ...sans, color: '#F1F5F9' }}>{deal.company}</p>
                      <p style={{ ...sans, color: '#475569' }}>{deal.contact} · {deal.contactTitle}</p>
                    </td>
                    <td className="py-2.5 pr-3 whitespace-nowrap"><StageBadge stage={deal.stage} /></td>
                    <td className="py-2.5 pr-3 font-bold whitespace-nowrap" style={{ ...mono, color: '#F1F5F9' }}>{fmtK(deal.value)}</td>
                    <td className="py-2.5 pr-3">
                      <span style={{ ...mono, color: deal.probability >= 70 ? '#00D4AA' : deal.probability >= 50 ? '#F59E0B' : '#94A3B8', fontWeight: 700 }}>
                        {deal.probability}%
                      </span>
                    </td>
                    <td className="py-2.5 pr-3"><AiScoreBadge score={deal.aiScore} confidence={deal.aiConfidence} /></td>
                    <td className="py-2.5 pr-3 whitespace-nowrap" style={{ ...mono, color: '#475569' }}>{deal.lastActivity}</td>
                    <td className="py-2.5" style={{ ...sans, color: '#94A3B8' }}>{deal.nextAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lead Scoring Leaderboard */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>AI Lead Scoring</h3>
            <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ ...mono, backgroundColor: '#051a14', color: '#00D4AA' }}>90%+ ACCURACY</span>
          </div>
          <div className="space-y-3">
            {scoredLeads.map((lead, i) => (
              <div
                key={lead.company}
                className="p-3 rounded-lg"
                style={{ backgroundColor: '#060D1A', border: i === 0 ? '1px solid #00D4AA33' : '1px solid #0F2040' }}
              >
                <div className="flex items-start gap-3">
                  <ScoreCircle score={lead.score} size={44} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold" style={{ ...sans, color: '#F1F5F9' }}>{lead.company}</p>
                      <span className="text-xs" style={{ ...mono, color: '#475569' }}>{lead.confidence}% conf</span>
                    </div>
                    <p className="text-xs mb-1.5" style={{ ...sans, color: '#475569' }}>{lead.contact} · {lead.title}</p>
                    <div className="flex flex-wrap gap-1">
                      {lead.signals.slice(0, 2).map((sig) => (
                        <span
                          key={sig}
                          className="px-1.5 py-0.5 rounded text-xs"
                          style={{ ...sans, backgroundColor: '#0F2040', color: '#94A3B8', fontSize: 10 }}
                        >
                          {sig}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs" style={{ ...sans, color: '#475569' }}>{lead.industry}</span>
                  <span className="text-xs font-bold" style={{ ...mono, color: '#00D4AA' }}>Est. {fmtK(lead.estimatedValue)}/yr</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid: CPQ + Commission */}
      <div className="grid grid-cols-3 gap-4">
        {/* CPQ Quick Quote — 2 cols */}
        <div className="col-span-2 rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>CPQ — Quick Quote Generator</h3>
              <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>Configure services and generate formatted quote in under 5 minutes</p>
            </div>
            <RZBadge label="RZ CPQ" sub="5-min quotes" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ ...sans, color: '#475569' }}>Client</label>
              <select
                value={selectedClient}
                onChange={(e) => { setSelectedClient(e.target.value); setQuoteGenerated(false); }}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ ...sans, backgroundColor: '#060D1A', border: '1px solid #0F2040', color: '#F1F5F9' }}
              >
                {clients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ ...sans, color: '#475569' }}>User Count</label>
              <input
                type="number"
                value={quoteUserCount}
                onChange={(e) => { setQuoteUserCount(e.target.value); setQuoteGenerated(false); }}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ ...sans, backgroundColor: '#060D1A', border: '1px solid #0F2040', color: '#F1F5F9' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium mb-2 block" style={{ ...sans, color: '#475569' }}>Services to Include</label>
            <div className="grid grid-cols-2 gap-1.5">
              {quoteServices.map((svc) => {
                const selected = selectedServices.includes(svc.id);
                return (
                  <button
                    key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className="flex items-center gap-2 p-2 rounded-lg text-left transition-all"
                    style={{
                      backgroundColor: selected ? '#051a14' : '#060D1A',
                      border: selected ? '1px solid #00D4AA44' : '1px solid #0F2040',
                    }}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: selected ? '#00D4AA' : '#0F2040' }}
                    >
                      {selected && <span style={{ color: '#070D1A', fontSize: 9, fontWeight: 900 }}>✓</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ ...sans, color: selected ? '#F1F5F9' : '#94A3B8' }}>{svc.name}</p>
                      <p className="text-xs" style={{ ...mono, color: selected ? '#00D4AA' : '#475569' }}>{fmtK(svc.unitPrice * 85)}{svc.unit.includes('flat') ? '' : '/mo'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setQuoteGenerated(true)}
              disabled={selectedServices.length === 0}
              className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
              style={{ ...sans, backgroundColor: '#00D4AA', color: '#070D1A' }}
            >
              Generate Quote
            </button>
            <button
              onClick={() => { setSelectedServices([]); setQuoteGenerated(false); }}
              className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ ...sans, backgroundColor: '#0F2040', color: '#94A3B8', border: '1px solid #1E3A5F' }}
            >
              Clear
            </button>
          </div>

          {quoteGenerated && (
            <div className="rounded-xl p-4" style={{ backgroundColor: '#060D1A', border: '1px solid #0F2040' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#00D4AA' }}>RESONATE MSP — QUOTE PREVIEW</p>
                  <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>{selectedClient} · Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 rounded text-xs font-bold" style={{ ...sans, backgroundColor: '#0a1a2e', color: '#0D6EFD', border: '1px solid #0D6EFD44' }}>Export PDF</button>
                  <button className="px-3 py-1 rounded text-xs font-bold" style={{ ...sans, backgroundColor: '#051a14', color: '#00D4AA', border: '1px solid #166534' }}>Send to Client</button>
                </div>
              </div>
              <table className="w-full text-xs mb-3">
                <thead>
                  <tr style={{ borderBottom: '1px solid #0F2040' }}>
                    {['Service', 'Qty', 'Unit', 'Unit Price', 'Monthly Total'].map(h => (
                      <th key={h} className="pb-1.5 text-left font-medium" style={{ ...sans, color: '#475569' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {quoteLines.map((line, i) => (
                    <tr key={line.service} style={{ borderBottom: i < quoteLines.length - 1 ? '1px solid #0a1830' : 'none' }}>
                      <td className="py-2 pr-4" style={{ ...sans, color: '#F1F5F9' }}>{line.service}</td>
                      <td className="py-2 pr-4" style={{ ...mono, color: '#94A3B8' }}>{line.qty}</td>
                      <td className="py-2 pr-4" style={{ ...sans, color: '#475569' }}>{line.unit}</td>
                      <td className="py-2 pr-4" style={{ ...mono, color: '#94A3B8' }}>${line.unitPrice}</td>
                      <td className="py-2 font-bold" style={{ ...mono, color: '#F1F5F9' }}>{fmt(line.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #0F2040' }}>
                <div>
                  <p className="text-xs" style={{ ...sans, color: '#475569' }}>Annual Contract Value</p>
                  <p className="text-xl font-bold" style={{ ...mono, color: '#F1F5F9' }}>{fmt(quoteTotal * 12)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ ...sans, color: '#475569' }}>Monthly Recurring</p>
                  <p className="text-2xl font-bold" style={{ ...mono, color: '#00D4AA' }}>{fmt(quoteTotal)}<span className="text-sm font-normal" style={{ color: '#475569' }}>/mo</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Commission Tracker */}
        <div className="rounded-xl p-5" style={{ backgroundColor: '#0A1225', border: '1px solid #0F2040' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ ...sans, color: '#F1F5F9' }}>Commission Tracker</h3>
            <span className="text-xs" style={{ ...sans, color: '#475569' }}>MTD · Mar 2026</span>
          </div>
          <div className="space-y-4">
            {salesReps.map((rep) => {
              const pct = Math.min((rep.mtdRevenue / rep.quota) * 100, 100);
              const commission = rep.mtdRevenue * 0.08;
              return (
                <div key={rep.name} className="p-4 rounded-xl" style={{ backgroundColor: '#060D1A', border: '1px solid #0F2040' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ ...mono, backgroundColor: rep.color + '22', color: rep.color, border: `1px solid ${rep.color}44` }}
                    >
                      {rep.initials}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold leading-none" style={{ ...sans, color: '#F1F5F9' }}>{rep.name}</p>
                      <p className="text-xs mt-0.5" style={{ ...sans, color: '#475569' }}>{rep.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ ...mono, color: rep.color }}>{fmt(commission)}</p>
                      <p className="text-xs" style={{ ...sans, color: '#475569' }}>earned MTD</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs" style={{ ...sans, color: '#475569' }}>Quota Progress</span>
                      <span className="text-xs font-bold" style={{ ...mono, color: pct >= 100 ? '#00D4AA' : pct >= 75 ? '#F59E0B' : '#94A3B8' }}>
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                    <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0F2040' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#00D4AA' : pct >= 75 ? '#F59E0B' : '#0D6EFD' }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs" style={{ ...mono, color: '#475569' }}>{fmtK(rep.mtdRevenue)}</span>
                      <span className="text-xs" style={{ ...mono, color: '#475569' }}>quota: {fmtK(rep.quota)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-center flex-1 pt-2" style={{ borderTop: '1px solid #0F2040' }}>
                      <p className="text-xs font-bold" style={{ ...mono, color: '#F1F5F9' }}>{rep.deals}</p>
                      <p className="text-xs" style={{ ...sans, color: '#475569' }}>deals</p>
                    </div>
                    <div className="text-center flex-1 pt-2" style={{ borderTop: '1px solid #0F2040' }}>
                      <p className="text-xs font-bold" style={{ ...mono, color: rep.closeRate >= 38 ? '#00D4AA' : '#94A3B8' }}>{rep.closeRate}%</p>
                      <p className="text-xs" style={{ ...sans, color: '#475569' }}>close rate</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Team total */}
          <div
            className="mt-3 p-3 rounded-lg"
            style={{ backgroundColor: '#051a14', border: '1px solid #166534' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest" style={{ ...mono, color: '#00D4AA' }}>TEAM MTD COMMISSION</span>
              <span className="text-sm font-bold" style={{ ...mono, color: '#00D4AA' }}>
                {fmt(salesReps.reduce((s, r) => s + r.mtdRevenue * 0.08, 0))}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ ...sans, color: '#475569' }}>
              on {fmt(salesReps.reduce((s, r) => s + r.mtdRevenue, 0))} revenue · {(salesReps.reduce((s, r) => s + r.mtdRevenue, 0) / salesReps.reduce((s, r) => s + r.quota, 0) * 100).toFixed(0)}% of combined quota
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
