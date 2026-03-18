// ── Types ──────────────────────────────────────────────────────────────────

export type Priority = 1 | 2 | 3;

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_client'
  | 'escalated'
  | 'resolved';

export interface Ticket {
  id: string;
  priority: Priority;
  category: string;
  summary: string;
  client: string;
  site: string;
  /** Seconds remaining until SLA breach */
  slaSeconds: number;
  /** Original SLA window in seconds (for ring %) */
  slaTotalSeconds: number;
  status: TicketStatus;
  assignedTo: string | null;
  assignedToInitials: string | null;
  createdAt: string;
  assignedAt: string | null;
  notes: string;
  contact: { name: string; phone: string };
  dispatchScore: number;
  dispatchReason: string;
}

export interface Technician {
  id: string;
  name: string;
  initials: string;
  tier: number;
  status: 'available' | 'busy' | 'wrapping' | 'break';
  shift: { label: string; totalMinutes: number; remainingMinutes: number };
  skills: Array<{ name: string; level: number }>;
  closedToday: number;
  slaMet: number;
  avgHandleMin: number;
  escalated: number;
}

export interface QueueStats {
  total: number;
  p1: number;
  p2: number;
  p3: number;
  atRisk: number;
  closedToday: number;
  avgResolutionMin: number;
  slaCompliance: number;
  aiAutoResolved: number;
}

// ── Mock Tickets ───────────────────────────────────────────────────────────

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TKT-4521',
    priority: 1,
    category: 'Server / Exchange',
    summary: 'Exchange server not responding — email down company-wide',
    client: 'Acme Corporation',
    site: 'Danville HQ',
    slaSeconds: 1394,
    slaTotalSeconds: 3600,
    status: 'in_progress',
    assignedTo: 'Marcus Chen',
    assignedToInitials: 'MC',
    createdAt: '09:32 AM',
    assignedAt: '09:47 AM',
    notes:
      'Client called in. All 47 users affected. CEO escalated directly to account manager.',
    contact: { name: 'David Reyes', phone: '(925) 555-0147' },
    dispatchScore: 98,
    dispatchReason: 'P1 · SLA 23m · Skill match: Exchange L4',
  },
  {
    id: 'TKT-4522',
    priority: 1,
    category: 'Network / Firewall',
    summary: 'FortiGate firewall offline — entire office subnet unreachable',
    client: 'Bay Area Logistics',
    site: 'Oakland DC',
    slaSeconds: 420,
    slaTotalSeconds: 3600,
    status: 'escalated',
    assignedTo: 'Sofia Reyes',
    assignedToInitials: 'SR',
    createdAt: '10:05 AM',
    assignedAt: '10:08 AM',
    notes:
      'Managed switch also unresponsive. On-site dispatch may be required. ISP confirmed no outage on their end.',
    contact: { name: 'Paul Tanaka', phone: '(510) 555-0281' },
    dispatchScore: 95,
    dispatchReason: 'P1 · SLA 7m · Skill match: Firewall L5',
  },
  {
    id: 'TKT-4525',
    priority: 2,
    category: 'Network / VPN',
    summary: 'VPN connectivity failing for 3 remote workers since 9 AM',
    client: 'Pacific Dental Group',
    site: 'Remote',
    slaSeconds: 7240,
    slaTotalSeconds: 14400,
    status: 'in_progress',
    assignedTo: 'Marcus Chen',
    assignedToInitials: 'MC',
    createdAt: '09:58 AM',
    assignedAt: '10:12 AM',
    notes:
      'Users unable to connect to internal systems. Firewall log review needed. IT lead on standby.',
    contact: { name: 'Sandra Kim', phone: '(415) 555-0192' },
    dispatchScore: 84,
    dispatchReason: 'P2 · SLA 2h · Skill match: Firewall L4',
  },
  {
    id: 'TKT-4528',
    priority: 2,
    category: 'Cloud / Azure',
    summary: 'Azure AD sync broken — new hires cannot log into any SaaS app',
    client: 'Meridian Wealth Mgmt',
    site: 'SF Main',
    slaSeconds: 5100,
    slaTotalSeconds: 14400,
    status: 'open',
    assignedTo: null,
    assignedToInitials: null,
    createdAt: '10:14 AM',
    assignedAt: null,
    notes:
      '4 employees affected. HR onboarding blocked. Azure Connect health shows sync errors since 08:40.',
    contact: { name: 'Renee Park', phone: '(628) 555-0044' },
    dispatchScore: 0,
    dispatchReason: '',
  },
  {
    id: 'TKT-4530',
    priority: 2,
    category: 'Security',
    summary: 'Phishing alert — employee clicked suspicious link, possible creds compromised',
    client: 'Marin County Law',
    site: 'San Rafael',
    slaSeconds: 3900,
    slaTotalSeconds: 14400,
    status: 'in_progress',
    assignedTo: 'James Okafor',
    assignedToInitials: 'JO',
    createdAt: '10:22 AM',
    assignedAt: '10:25 AM',
    notes:
      'User opened email link from spoofed domain. Password reset initiated. Awaiting MFA audit from Azure AD.',
    contact: { name: 'Lisa Grant', phone: '(415) 555-0311' },
    dispatchScore: 91,
    dispatchReason: 'P2 · SLA 65m · Skill match: Security L4',
  },
  {
    id: 'TKT-4531',
    priority: 3,
    category: 'Workstation',
    summary: 'Laptop won\'t boot after Windows update — attorney blocked',
    client: 'Marin County Law',
    site: 'San Rafael',
    slaSeconds: 14400,
    slaTotalSeconds: 28800,
    status: 'open',
    assignedTo: null,
    assignedToInitials: null,
    createdAt: '10:30 AM',
    assignedAt: null,
    notes:
      'Update KB5034441 suspected. Remote session or on-site needed. User on mobile in the meantime.',
    contact: { name: 'Tom Briggs', phone: '(415) 555-0312' },
    dispatchScore: 0,
    dispatchReason: '',
  },
  {
    id: 'TKT-4533',
    priority: 3,
    category: 'Printing',
    summary: 'HP LaserJet offline — accounting dept cannot print invoices',
    client: 'Coastal Realty Group',
    site: 'Walnut Creek',
    slaSeconds: 19800,
    slaTotalSeconds: 28800,
    status: 'open',
    assignedTo: 'Priya Nair',
    assignedToInitials: 'PN',
    createdAt: '09:15 AM',
    assignedAt: '09:20 AM',
    notes:
      'Print queue stuck. Driver reinstall did not resolve. IP conflict suspected on subnet.',
    contact: { name: 'Carol Wu', phone: '(925) 555-0500' },
    dispatchScore: 60,
    dispatchReason: 'P3 · SLA 5.5h · Skill match: Workstation L3',
  },
  {
    id: 'TKT-4535',
    priority: 3,
    category: 'Software / M365',
    summary: 'Outlook calendar not syncing to Teams for 2 users',
    client: 'Sunrise Healthcare',
    site: 'Concord Clinic',
    slaSeconds: 22500,
    slaTotalSeconds: 28800,
    status: 'waiting_client',
    assignedTo: 'Priya Nair',
    assignedToInitials: 'PN',
    createdAt: '08:50 AM',
    assignedAt: '09:05 AM',
    notes:
      'Known M365 tenant issue. Microsoft support case open. Waiting on callback from vendor.',
    contact: { name: 'Dr. Amy Lee', phone: '(925) 555-0221' },
    dispatchScore: 55,
    dispatchReason: 'P3 · SLA 6h · Skill match: M365 L3',
  },
  {
    id: 'TKT-4537',
    priority: 2,
    category: 'Backup / DR',
    summary: 'Veeam backup job failing nightly — last successful backup 4 days ago',
    client: 'Bay Area Logistics',
    site: 'Oakland DC',
    slaSeconds: 8700,
    slaTotalSeconds: 14400,
    status: 'open',
    assignedTo: null,
    assignedToInitials: null,
    createdAt: '07:45 AM',
    assignedAt: null,
    notes:
      'Error: "Unable to truncate transaction logs." SQL Server backup chain broken. Compliance risk.',
    contact: { name: 'Nick Torres', phone: '(510) 555-0399' },
    dispatchScore: 0,
    dispatchReason: '',
  },
  {
    id: 'TKT-4539',
    priority: 1,
    category: 'Server / Hardware',
    summary: 'RAID degraded alert — NAS reporting failed drive, data at risk',
    client: 'Meridian Wealth Mgmt',
    site: 'SF Colocation',
    slaSeconds: 800,
    slaTotalSeconds: 3600,
    status: 'open',
    assignedTo: null,
    assignedToInitials: null,
    createdAt: '10:41 AM',
    assignedAt: null,
    notes:
      'Synology NAS DS3622xs+. RAID 6 with one failed drive. Second drive showing reallocated sectors. Replacement drive on order.',
    contact: { name: 'Marc Levy', phone: '(628) 555-0178' },
    dispatchScore: 0,
    dispatchReason: '',
  },
];

// ── Mock Technicians ───────────────────────────────────────────────────────

export const MOCK_TECHS: Technician[] = [
  {
    id: 'mchen',
    name: 'Marcus Chen',
    initials: 'MC',
    tier: 3,
    status: 'busy',
    shift: { label: '08:00 – 17:00', totalMinutes: 540, remainingMinutes: 263 },
    skills: [
      { name: 'Network L3', level: 5 },
      { name: 'Azure', level: 4 },
      { name: 'Windows Server', level: 5 },
      { name: 'Firewall', level: 4 },
      { name: 'Office 365', level: 3 },
    ],
    closedToday: 7,
    slaMet: 100,
    avgHandleMin: 23,
    escalated: 1,
  },
  {
    id: 'sreyes',
    name: 'Sofia Reyes',
    initials: 'SR',
    tier: 3,
    status: 'busy',
    shift: { label: '08:00 – 17:00', totalMinutes: 540, remainingMinutes: 280 },
    skills: [
      { name: 'Firewall', level: 5 },
      { name: 'Network L3', level: 5 },
      { name: 'Security', level: 4 },
      { name: 'Windows Server', level: 3 },
      { name: 'Cisco', level: 4 },
    ],
    closedToday: 5,
    slaMet: 100,
    avgHandleMin: 31,
    escalated: 0,
  },
  {
    id: 'jokafor',
    name: 'James Okafor',
    initials: 'JO',
    tier: 2,
    status: 'busy',
    shift: { label: '09:00 – 18:00', totalMinutes: 540, remainingMinutes: 410 },
    skills: [
      { name: 'Security', level: 4 },
      { name: 'M365', level: 5 },
      { name: 'Azure AD', level: 4 },
      { name: 'Workstation', level: 3 },
      { name: 'Backup', level: 2 },
    ],
    closedToday: 9,
    slaMet: 98,
    avgHandleMin: 18,
    escalated: 2,
  },
  {
    id: 'pnair',
    name: 'Priya Nair',
    initials: 'PN',
    tier: 1,
    status: 'available',
    shift: { label: '08:00 – 17:00', totalMinutes: 540, remainingMinutes: 250 },
    skills: [
      { name: 'Workstation', level: 4 },
      { name: 'M365', level: 4 },
      { name: 'Printing', level: 3 },
      { name: 'Help Desk', level: 5 },
      { name: 'VoIP', level: 2 },
    ],
    closedToday: 11,
    slaMet: 95,
    avgHandleMin: 14,
    escalated: 3,
  },
  {
    id: 'lwang',
    name: 'Leo Wang',
    initials: 'LW',
    tier: 2,
    status: 'break',
    shift: { label: '10:00 – 19:00', totalMinutes: 540, remainingMinutes: 490 },
    skills: [
      { name: 'Veeam / Backup', level: 5 },
      { name: 'VMware', level: 4 },
      { name: 'Windows Server', level: 4 },
      { name: 'SQL Server', level: 3 },
      { name: 'Azure', level: 3 },
    ],
    closedToday: 3,
    slaMet: 100,
    avgHandleMin: 41,
    escalated: 0,
  },
];

// ── Mock Queue Stats ───────────────────────────────────────────────────────

export const MOCK_QUEUE_STATS: QueueStats = {
  total: 10,
  p1: 3,
  p2: 4,
  p3: 3,
  atRisk: 3,
  closedToday: 22,
  avgResolutionMin: 34,
  slaCompliance: 94,
  aiAutoResolved: 18,
};
