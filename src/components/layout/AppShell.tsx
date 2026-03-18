'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RZStatusBadge } from './RZStatusBadge';
import { useAuthOptional } from '@/lib/auth-context';

type Module = {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  navItems: { label: string; path: string; icon: React.ReactNode }[];
};

const modules: Module[] = [
  {
    id: 'service-desk',
    label: 'Service Desk',
    path: '/service-desk',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    navItems: [
      {
        label: 'Tickets', path: '/service-desk/tickets', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" />
          </svg>
        )
      },
      {
        label: 'Queue', path: '/service-desk/queue', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        )
      },
      {
        label: 'SLA Dashboard', path: '/service-desk/sla', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        )
      },
      {
        label: 'Knowledge Base', path: '/service-desk/kb', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        )
      },
    ],
  },
  {
    id: 'netops',
    label: 'NetOps',
    path: '/netops',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
    navItems: [
      {
        label: 'Network Map', path: '/netops/map', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        )
      },
      {
        label: 'Devices', path: '/netops/devices', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
        )
      },
      {
        label: 'Alerts', path: '/netops/alerts', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )
      },
      {
        label: 'Performance', path: '/netops/performance', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        )
      },
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    path: '/finance',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    navItems: [
      {
        label: 'Overview', path: '/finance', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
          </svg>
        )
      },
      {
        label: 'Invoices', path: '/finance/invoices', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
          </svg>
        )
      },
      {
        label: 'Revenue', path: '/finance/revenue', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
          </svg>
        )
      },
      {
        label: 'Reports', path: '/finance/reports', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
        )
      },
    ],
  },
  {
    id: 'procurement',
    label: 'Procurement',
    path: '/procurement',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    navItems: [
      {
        label: 'Purchase Orders', path: '/procurement/orders', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="2" />
          </svg>
        )
      },
      {
        label: 'Vendors', path: '/procurement/vendors', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      },
      {
        label: 'Inventory', path: '/procurement/inventory', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        )
      },
      {
        label: 'Approvals', path: '/procurement/approvals', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )
      },
    ],
  },
  {
    id: 'crm',
    label: 'CRM',
    path: '/crm',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    navItems: [
      {
        label: 'Clients', path: '/crm/clients', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          </svg>
        )
      },
      {
        label: 'Pipeline', path: '/crm/pipeline', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        )
      },
      {
        label: 'Contacts', path: '/crm/contacts', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        )
      },
      {
        label: 'Activities', path: '/crm/activities', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      },
    ],
  },
  {
    id: 'contracts',
    label: 'Contracts',
    path: '/contracts',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    navItems: [
      {
        label: 'All Contracts', path: '/contracts', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
        )
      },
      {
        label: 'Templates', path: '/contracts/templates', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
          </svg>
        )
      },
      {
        label: 'Renewals', path: '/contracts/renewals', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        )
      },
      {
        label: 'Signatories', path: '/contracts/signatories', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        )
      },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    path: '/security',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    navItems: [
      {
        label: 'Overview', path: '/security', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        )
      },
      {
        label: 'Threats', path: '/security/threats', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )
      },
      {
        label: 'Compliance', path: '/security/compliance', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        )
      },
      {
        label: 'Audit Log', path: '/security/audit', icon: (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        )
      },
    ],
  },
];

const moduleDisplayNames: Record<string, string> = {
  'service-desk': 'Service Desk',
  'netops': 'NetOps',
  'finance': 'Finance',
  'procurement': 'Procurement',
  'crm': 'CRM',
  'contracts': 'Contracts',
  'security': 'Security',
};

interface AppShellProps {
  children: React.ReactNode;
  currentModule?: string;
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function AppShell({ children, currentModule }: AppShellProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const auth = useAuthOptional();

  // Don't render shell chrome on the login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  const userName = auth?.user?.name ?? 'Admin';
  const userInitials = auth?.user?.name
    ? auth.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  const activeModuleId = currentModule ?? modules.find((m) =>
    pathname.startsWith(m.path)
  )?.id ?? 'service-desk';

  const activeModule = modules.find((m) => m.id === activeModuleId) ?? modules[0];

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: '#070D1A' }}>
      {/* Top Nav Bar */}
      <header
        className="flex items-center justify-between flex-shrink-0 px-4 border-b"
        style={{
          height: '56px',
          backgroundColor: '#080E1C',
          borderColor: '#0F2040',
          zIndex: 50,
        }}
      >
        {/* Left: Logo + divider + user */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span
              className="text-base font-bold tracking-widest"
              style={{ fontFamily: "'Space Mono', monospace", color: '#00D4AA', letterSpacing: '0.2em' }}
            >
              RESONATE
            </span>
          </div>
          <div className="w-px h-5" style={{ backgroundColor: '#0F2040' }} />
          <div className="flex items-center gap-2">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold flex-shrink-0"
              style={{ backgroundColor: '#0D6EFD', color: '#F1F5F9' }}
            >
              {userInitials}
            </div>
            <span className="text-sm font-medium" style={{ color: '#94A3B8' }}>
              {userName}
            </span>
          </div>
        </div>

        {/* Center: Module nav */}
        <nav className="flex items-center gap-1">
          {modules.map((mod) => {
            const isActive = mod.id === activeModuleId;
            return (
              <Link
                key={mod.id}
                href={mod.path}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={{
                  color: isActive ? '#00D4AA' : '#64748B',
                  backgroundColor: isActive ? '#00D4AA14' : 'transparent',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span
                  style={{ color: isActive ? '#00D4AA' : '#475569' }}
                >
                  {mod.icon}
                </span>
                {mod.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Status + bell + user menu */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* System Healthy */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-2 h-2">
              <span
                className="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping"
                style={{ backgroundColor: '#00D4AA' }}
              />
              <span
                className="relative inline-flex rounded-full w-2 h-2"
                style={{ backgroundColor: '#00D4AA' }}
              />
            </div>
            <span
              className="text-xs font-medium"
              style={{ fontFamily: "'Space Mono', monospace", color: '#00D4AA', fontSize: '11px' }}
            >
              System Healthy
            </span>
          </div>

          <div className="w-px h-4" style={{ backgroundColor: '#0F2040' }} />

          {/* Notification bell */}
          <button
            className="relative flex items-center justify-center w-8 h-8 rounded-md transition-colors"
            style={{ color: '#64748B' }}
            aria-label="Notifications"
          >
            <BellIcon />
            <span
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#EF4444' }}
            />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors"
              style={{ color: '#94A3B8' }}
            >
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold"
                style={{ backgroundColor: '#1E3A5F', color: '#818CF8' }}
              >
                {userInitials}
              </div>
              <ChevronDownIcon />
            </button>
            {userMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-lg border shadow-lg py-1 z-50"
                style={{ backgroundColor: '#0A1225', borderColor: '#0F2040' }}
              >
                {[
                  { label: 'Profile', href: '/profile' },
                  { label: 'Settings', href: '/settings' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2 text-sm transition-colors"
                    style={{ color: '#94A3B8' }}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => { setUserMenuOpen(false); auth?.logout(); }}
                  className="block w-full text-left px-4 py-2 text-sm transition-colors"
                  style={{ color: '#EF4444' }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className="flex flex-col flex-shrink-0 border-r"
          style={{
            width: '220px',
            backgroundColor: '#080E1C',
            borderColor: '#0F2040',
          }}
        >
          {/* Module header */}
          <div
            className="flex items-center gap-2.5 px-4 py-4 border-b"
            style={{ borderColor: '#0F2040' }}
          >
            <span style={{ color: '#00D4AA' }}>{activeModule.icon}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: '#F1F5F9' }}
            >
              {moduleDisplayNames[activeModule.id]}
            </span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {activeModule.navItems.map((item) => {
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors"
                  style={{
                    color: isActive ? '#F1F5F9' : '#64748B',
                    backgroundColor: isActive ? '#0F2040' : 'transparent',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <span style={{ color: isActive ? '#00D4AA' : '#475569' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* RZ AI Status at bottom */}
          <div className="px-3 pb-4">
            <RZStatusBadge />
          </div>
        </aside>

        {/* Main content */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: '#070D1A' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
