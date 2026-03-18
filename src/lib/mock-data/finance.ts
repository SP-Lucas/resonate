// Finance module mock data and types

export interface KpiCard {
  label: string;
  value: string;
  sub: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  color: string;
}

export interface LicenseRow {
  client: string;
  licensed: number;
  deployed: number;
  delta: number;
  monthlyCost: number;
  status: 'match' | 'over' | 'under';
}

export interface PayrollEntry {
  name: string;
  type: 'W2' | '1099';
  role: string;
  amount: number;
  hours?: number;
  nextPayDate: string;
}

export interface ARAgingBucket {
  label: string;
  amount: number;
  count: number;
  color: string;
}

export interface RecentTransaction {
  id: string;
  client: string;
  amount: number;
  type: string;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
}

export const financeKpis: KpiCard[] = [
  {
    label: 'Monthly Recurring Revenue',
    value: '$847,320',
    sub: 'Mar 2026 · 247 clients',
    trend: 'up',
    trendValue: '+8.4% MoM',
    color: '#00D4AA',
  },
  {
    label: 'Outstanding AR',
    value: '$124,850',
    sub: '38 open invoices',
    trend: 'down',
    trendValue: '-12.1% vs last month',
    color: '#F59E0B',
  },
  {
    label: 'Days Sales Outstanding',
    value: '11',
    sub: 'Industry avg: 45 days',
    trend: 'up',
    trendValue: '76% below avg',
    color: '#00D4AA',
  },
  {
    label: 'Gross Margin',
    value: '68.4%',
    sub: '$579,567 gross profit',
    trend: 'up',
    trendValue: '+1.2pp vs Q1 avg',
    color: '#00D4AA',
  },
  {
    label: 'Month-End Close',
    value: '4 hrs',
    sub: 'Closed Mar 5 · On schedule',
    trend: 'up',
    trendValue: 'Industry: 5 days',
    color: '#818CF8',
  },
];

export const licenseRows: LicenseRow[] = [
  { client: 'Axiom Healthcare Group', licensed: 420, deployed: 418, delta: -2, monthlyCost: 9240, status: 'under' },
  { client: 'Vertex Capital Partners', licensed: 85, deployed: 91, delta: 6, monthlyCost: 1870, status: 'over' },
  { client: 'Cascade Engineering', licensed: 210, deployed: 210, delta: 0, monthlyCost: 4620, status: 'match' },
  { client: 'BlueHarbor Financial', licensed: 156, deployed: 148, delta: -8, monthlyCost: 3432, status: 'under' },
  { client: 'Meridian Law Group', licensed: 62, deployed: 62, delta: 0, monthlyCost: 1364, status: 'match' },
  { client: 'Northgate Logistics', licensed: 340, deployed: 355, delta: 15, monthlyCost: 7480, status: 'over' },
  { client: 'Solstice Biotech', licensed: 188, deployed: 187, delta: -1, monthlyCost: 4136, status: 'under' },
  { client: 'Pacific Rim Trading Co.', licensed: 74, deployed: 74, delta: 0, monthlyCost: 1628, status: 'match' },
  { client: 'Summit Data Services', licensed: 512, deployed: 498, delta: -14, monthlyCost: 11264, status: 'under' },
  { client: 'Ironclad Security Inc.', licensed: 95, deployed: 100, delta: 5, monthlyCost: 2090, status: 'over' },
];

export const payrollEntries: PayrollEntry[] = [
  { name: 'Marcus Rivera', type: 'W2', role: 'Sr. Network Engineer', amount: 9583, nextPayDate: 'Mar 15, 2026' },
  { name: 'Priya Nakamura', type: 'W2', role: 'vCISO', amount: 12500, nextPayDate: 'Mar 15, 2026' },
  { name: 'Derek Walsh', type: 'W2', role: 'Help Desk Lead', amount: 6250, nextPayDate: 'Mar 15, 2026' },
  { name: 'Samantha Chen', type: 'W2', role: 'Project Manager', amount: 8333, nextPayDate: 'Mar 15, 2026' },
  { name: 'Troy Okafor', type: 'W2', role: 'Cloud Architect', amount: 11458, nextPayDate: 'Mar 15, 2026' },
  { name: 'Brad Simmons', type: '1099', role: 'Fiber Contractor', amount: 4800, hours: 120, nextPayDate: 'Mar 20, 2026' },
  { name: 'Elena Voss', type: '1099', role: 'Compliance Auditor', amount: 3200, hours: 64, nextPayDate: 'Mar 20, 2026' },
  { name: 'Kofi Mensah', type: '1099', role: 'Penetration Tester', amount: 5500, hours: 88, nextPayDate: 'Mar 20, 2026' },
];

export const arAgingBuckets: ARAgingBucket[] = [
  { label: 'Current (0–30)', amount: 78420, count: 22, color: '#00D4AA' },
  { label: '31–60 Days', amount: 29840, count: 9, color: '#F59E0B' },
  { label: '61–90 Days', amount: 12650, count: 5, color: '#EF4444' },
  { label: '90+ Days', amount: 3940, count: 2, color: '#7F1D1D' },
];

export const recentTransactions: RecentTransaction[] = [
  { id: 'INV-20260301', client: 'Axiom Healthcare Group', amount: 38500, type: 'Monthly Managed Services', date: 'Mar 1, 2026', status: 'paid' },
  { id: 'INV-20260302', client: 'Vertex Capital Partners', amount: 9200, type: 'Microsoft 365 + Azure', date: 'Mar 1, 2026', status: 'paid' },
  { id: 'INV-20260303', client: 'Northgate Logistics', amount: 21750, type: 'Network Monitoring + NOC', date: 'Mar 1, 2026', status: 'pending' },
  { id: 'INV-20260304', client: 'BlueHarbor Financial', amount: 14900, type: 'Compliance + vCISO', date: 'Mar 1, 2026', status: 'pending' },
  { id: 'INV-20260305', client: 'Summit Data Services', amount: 47300, type: 'Enterprise Managed IT', date: 'Feb 1, 2026', status: 'overdue' },
];
