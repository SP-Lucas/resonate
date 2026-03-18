'use client';

import { useEffect, useRef, useState } from 'react';
import { ModuleCard } from '@/components/dashboard/ModuleCard';
import { AIInsight } from '@/components/dashboard/AIInsight';

// ─── Types ────────────────────────────────────────────────────────────────────

type Health = 'good' | 'warning' | 'critical';
type Severity = 'info' | 'warning' | 'critical';

interface ModuleData {
  name: string;
  icon: string;
  metric: string;
  health: Health;
  path: string;
  color: string;
}

interface ActivityEvent {
  id: string;
  time: string;
  module: string;
  moduleColor: string;
  event: string;
  client: string;
}

interface InsightData {
  id: string;
  insight: string;
  confidence: number;
  severity: Severity;
  action: string;
  timestamp: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const MODULES: ModuleData[] = [
  {
    name: 'Service Desk',
    icon: '🎫',
    metric: '3 P1 tickets · SLA 94% · 41 open',
    health: 'warning',
    path: '/service-desk',
    color: '#00D4AA',
  },
  {
    name: 'NetOps',
    icon: '🛡️',
    metric: '2 active threats · 8s avg response · 99.7% uptime',
    health: 'warning',
    path: '/netops',
    color: '#0D6EFD',
  },
  {
    name: 'Finance',
    icon: '💰',
    metric: 'DSO: 11 days · $284K outstanding · 97% collected',
    health: 'good',
    path: '/finance',
    color: '#00D4AA',
  },
  {
    name: 'Procurement',
    icon: '📦',
    metric: '7 POs pending · $43K spend MTD · 3 vendors at risk',
    health: 'good',
    path: '/procurement',
    color: '#818CF8',
  },
  {
    name: 'CRM',
    icon: '🤝',
    metric: '247 clients · 4 at churn risk · NPS 71',
    health: 'warning',
    path: '/crm',
    color: '#F59E0B',
  },
  {
    name: 'Contracts',
    icon: '📋',
    metric: '8 renewals due · $1.2M ARR protected · 2 expired',
    health: 'critical',
    path: '/contracts',
    color: '#818CF8',
  },
  {
    name: 'Security',
    icon: '🔐',
    metric: '0 critical CVEs · 94% patch rate · 1 incident open',
    health: 'good',
    path: '/security',
    color: '#EF4444',
  },
];

const ACTIVITY: ActivityEvent[] = [
  { id: '1',  time: '2m ago',  module: 'Service Desk', moduleColor: '#00D4AA', event: 'P1 ticket resolved — Exchange outage at',                            client: 'Meridian Logistics'    },
  { id: '2',  time: '6m ago',  module: 'NetOps',       moduleColor: '#0D6EFD', event: 'Threat blocked — brute-force attempt from 192.0.2.47 for',           client: 'Pacific Dental Group'  },
  { id: '3',  time: '11m ago', module: 'Finance',      moduleColor: '#00D4AA', event: 'Invoice #INV-4421 sent ($18,400) to',                                 client: 'Acme Corp'             },
  { id: '4',  time: '18m ago', module: 'Contracts',    moduleColor: '#818CF8', event: 'Contract auto-renewed (3yr, $84K ARR) for',                           client: 'Starfield Capital'     },
  { id: '5',  time: '24m ago', module: 'Security',     moduleColor: '#EF4444', event: 'Vulnerability patched (CVE-2024-1971, CVSS 9.1) on 14 endpoints for', client: 'Harbor Health'         },
  { id: '6',  time: '31m ago', module: 'CRM',          moduleColor: '#F59E0B', event: 'QBR follow-up sent automatically to',                                 client: 'BlueSky Retail'        },
  { id: '7',  time: '45m ago', module: 'Procurement',  moduleColor: '#818CF8', event: 'PO #PO-882 approved ($7,200 — Cisco switches) for',                   client: 'Meridian Logistics'    },
  { id: '8',  time: '1h ago',  module: 'Service Desk', moduleColor: '#00D4AA', event: 'SLA breach prevented — auto-escalation triggered for',                client: 'Pacific Dental Group'  },
  { id: '9',  time: '1h ago',  module: 'Finance',      moduleColor: '#00D4AA', event: 'Payment received ($32,150) from',                                     client: 'Northgate Partners'    },
  { id: '10', time: '2h ago',  module: 'NetOps',       moduleColor: '#0D6EFD', event: 'Anomalous traffic pattern resolved — false positive confirmed for',    client: 'Acme Corp'             },
];

const INSIGHTS: InsightData[] = [
  {
    id: '1',
    insight: 'Acme Corp license utilization at 134% — 47 seats over contract limit. Invoice adjustment required to avoid margin erosion.',
    confidence: 98,
    severity: 'critical',
    action: 'Review contract',
    timestamp: '2m ago',
  },
  {
    id: '2',
    insight: '3 contracts totaling $218K ARR are within 14 days of expiration with no renewal activity recorded.',
    confidence: 94,
    severity: 'warning',
    action: 'View contracts',
    timestamp: '9m ago',
  },
  {
    id: '3',
    insight: 'Anomalous login pattern detected for Pacific Dental Group — 14 failed attempts across 3 accounts in 6 minutes.',
    confidence: 91,
    severity: 'critical',
    action: 'Investigate now',
    timestamp: '14m ago',
  },
  {
    id: '4',
    insight: 'Service Desk ticket volume up 23% this week for Harbor Health. Proactive outreach recommended before SLA risk escalates.',
    confidence: 87,
    severity: 'warning',
    action: 'Schedule call',
    timestamp: '31m ago',
  },
];

// ─── Clock Component ──────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      // "Tuesday, March 17" — no year
      setDate(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        })
      );
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-right">
      <div
        className="text-2xl font-bold text-[#00D4AA] tabular-nums"
        style={{ fontFamily: 'Space Mono, monospace' }}
      >
        {time}
      </div>
      <div
        className="text-xs text-[#475569] mt-0.5"
        style={{ fontFamily: 'Space Mono, monospace' }}
      >
        {date}
      </div>
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedCounter({ target, duration = 1400 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const steps = 60;
    const stepMs = duration / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += 1;
      // Ease-out: progress slows near the end
      const progress = 1 - Math.pow(1 - current / steps, 3);
      setValue(Math.round(progress * target));
      if (current >= steps) {
        setValue(target);
        clearInterval(interval);
      }
    }, stepMs);

    return () => clearInterval(interval);
  }, [target, duration]);

  return <>{value.toLocaleString()}</>;
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const firstRow = MODULES.slice(0, 4);
  const secondRow = MODULES.slice(4, 7);

  const [insights, setInsights] = useState<InsightData[]>(INSIGHTS);

  function dismissInsight(id: string) {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#070D1A] px-6 py-8 max-w-[1440px] mx-auto">

      {/* ── Row 1: Hero Section ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#F1F5F9] mb-1">
            Welcome back, Lucas
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-sm text-[#94A3B8]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00D4AA] shadow-[0_0_6px_rgba(0,212,170,0.7)]" />
              All systems operational
            </span>
            <span className="text-[#1E3A5F]">·</span>
            <span className="text-sm text-[#94A3B8]">247 clients monitored</span>
            <span className="text-[#1E3A5F]">·</span>
            <span
              className="text-sm font-semibold text-[#00D4AA]"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              RZ AI Active
            </span>
          </div>
        </div>
        <LiveClock />
      </div>

      {/* ── Row 2: ROI Banner ── */}
      <div className="relative mb-8 overflow-hidden rounded-xl border border-[#00D4AA]/25 bg-[#0A1225]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00D4AA]/8 via-transparent to-[#0D6EFD]/8" />
        {/* Top highlight line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00D4AA]/50 to-transparent" />

        <div className="relative flex items-center justify-between px-8 py-5 flex-wrap gap-4">
          {/* Left: label + description */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#00D4AA]/10 border border-[#00D4AA]/25 shadow-[0_0_16px_rgba(0,212,170,0.15)]">
              <span className="text-base font-bold text-[#00D4AA]" style={{ fontFamily: 'Space Mono, monospace' }}>RZ</span>
            </div>
            <div>
              <p className="text-xs text-[#475569] mb-1 tracking-widest uppercase" style={{ fontFamily: 'Space Mono, monospace' }}>
                This Month · AI Automation Impact
              </p>
              <p className="text-sm text-[#CBD5E1]">
                RZ automated{' '}
                <span className="font-bold text-[#00D4AA] text-base">
                  <AnimatedCounter target={4821} />
                </span>
                {' actions · '}saved{' '}
                <span className="font-bold text-[#F1F5F9]">487 hours</span>
                {' · '}
                <span className="font-bold text-[#00D4AA]">$127,400</span>{' '}
                in labor costs avoided
              </p>
            </div>
          </div>

          {/* Right: stat pills */}
          <div className="flex gap-5">
            <div className="text-center bg-[#070D1A]/60 border border-[#0F2040] rounded-xl px-5 py-3">
              <div
                className="text-2xl font-bold text-[#00D4AA] tabular-nums leading-none mb-1"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                <AnimatedCounter target={4821} />
              </div>
              <div className="text-[10px] text-[#475569] tracking-wider" style={{ fontFamily: 'Space Mono, monospace' }}>ACTIONS</div>
              <div className="text-[10px] text-[#334155] mt-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>vs. last month: +12%</div>
            </div>
            <div className="text-center bg-[#070D1A]/60 border border-[#0F2040] rounded-xl px-5 py-3">
              <div
                className="text-2xl font-bold text-[#F1F5F9] tabular-nums leading-none mb-1"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                <AnimatedCounter target={487} />h
              </div>
              <div className="text-[10px] text-[#475569] tracking-wider" style={{ fontFamily: 'Space Mono, monospace' }}>SAVED</div>
              <div className="text-[10px] text-[#334155] mt-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>vs. last month: +8%</div>
            </div>
            <div className="text-center bg-[#070D1A]/60 border border-[#0F2040] rounded-xl px-5 py-3">
              <div
                className="text-2xl font-bold text-[#00D4AA] tabular-nums leading-none mb-1"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                $<AnimatedCounter target={127} />K
              </div>
              <div className="text-[10px] text-[#475569] tracking-wider" style={{ fontFamily: 'Space Mono, monospace' }}>AVOIDED</div>
              <div className="text-[10px] text-[#334155] mt-0.5" style={{ fontFamily: 'Space Mono, monospace' }}>vs. last month: +19%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3 & 4: Module Grid ── */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-semibold text-[#475569] tracking-widest uppercase"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            Platform Modules
          </h2>
          <span className="text-xs text-[#475569]" style={{ fontFamily: 'Space Mono, monospace' }}>
            7 modules · last updated now
          </span>
        </div>

        {/* Row 3: 4 cards */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {firstRow.map((mod) => (
            <ModuleCard key={mod.name} {...mod} />
          ))}
        </div>

        {/* Row 4: 3 cards */}
        <div className="grid grid-cols-3 gap-4">
          {secondRow.map((mod) => (
            <ModuleCard key={mod.name} {...mod} />
          ))}
        </div>
      </section>

      {/* ── Row 5: Activity + AI Insights ── */}
      <div className="grid gap-6" style={{ gridTemplateColumns: '3fr 2fr' }}>

        {/* Activity Feed (60%) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xs font-semibold text-[#475569] tracking-widest uppercase"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              Recent Activity
            </h2>
            <span className="text-xs text-[#475569]" style={{ fontFamily: 'Space Mono, monospace' }}>
              Live · all modules
            </span>
          </div>

          <div
            className="bg-[#0A1225] border border-[#0F2040] rounded-xl overflow-y-auto"
            style={{ maxHeight: '360px' }}
          >
            {ACTIVITY.map((item, idx) => (
              <div
                key={item.id}
                className={`
                  flex items-start gap-3 px-4 py-3
                  ${idx < ACTIVITY.length - 1 ? 'border-b border-[#0F2040]' : ''}
                  hover:bg-[#0D1930] transition-colors duration-150 cursor-default
                `}
              >
                {/* Module color dot */}
                <div className="flex-shrink-0 mt-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: item.moduleColor,
                      boxShadow: `0 0 5px ${item.moduleColor}90`,
                    }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {item.event}{' '}
                    <span className="font-semibold text-[#F1F5F9]">{item.client}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: item.moduleColor, fontFamily: 'Space Mono, monospace' }}
                    >
                      {item.module}
                    </span>
                    <span
                      className="text-[10px] text-[#475569]"
                      style={{ fontFamily: 'Space Mono, monospace' }}
                    >
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Insights (40%) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2
                className="text-xs font-semibold text-[#475569] tracking-widest uppercase"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                RZ AI Insights
              </h2>
              <span className="inline-flex items-center gap-1 bg-[#00D4AA]/10 border border-[#00D4AA]/20 rounded-full px-2 py-0.5">
                <span className="w-1 h-1 rounded-full bg-[#00D4AA] animate-pulse" />
                <span className="text-[10px] text-[#00D4AA]" style={{ fontFamily: 'Space Mono, monospace' }}>LIVE</span>
              </span>
            </div>
            <span className="text-xs text-[#475569]" style={{ fontFamily: 'Space Mono, monospace' }}>
              {insights.length} active
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {insights.map((item) => (
              <AIInsight
                key={item.id}
                insight={item.insight}
                confidence={item.confidence}
                severity={item.severity}
                action={item.action}
                timestamp={item.timestamp}
                onDismiss={() => dismissInsight(item.id)}
              />
            ))}
            {insights.length === 0 && (
              <div className="text-xs text-[#334155] text-center py-8" style={{ fontFamily: 'Space Mono, monospace' }}>
                No active insights
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
