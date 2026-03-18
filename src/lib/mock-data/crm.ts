// CRM/Sales module mock data and types

export interface PipelineStage {
  name: string;
  shortName: string;
  count: number;
  value: number;
  color: string;
  widthPct: number;
}

export interface Deal {
  id: string;
  company: string;
  contact: string;
  contactTitle: string;
  stage: string;
  value: number;
  probability: number;
  aiScore: number;
  aiConfidence: 'high' | 'medium' | 'low';
  lastActivity: string;
  nextAction: string;
  daysInStage: number;
}

export interface ScoredLead {
  company: string;
  contact: string;
  title: string;
  score: number;
  confidence: number;
  signals: string[];
  estimatedValue: number;
  industry: string;
}

export interface QuoteService {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  unit: string;
}

export interface SalesRep {
  name: string;
  initials: string;
  role: string;
  mtdRevenue: number;
  quota: number;
  deals: number;
  closeRate: number;
  color: string;
}

export interface QuoteLineItem {
  service: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export const pipelineStages: PipelineStage[] = [
  { name: 'Prospect', shortName: 'Prospect', count: 84, value: 3_240_000, color: '#475569', widthPct: 100 },
  { name: 'Qualified', shortName: 'Qualified', count: 41, value: 2_180_000, color: '#0D6EFD', widthPct: 80 },
  { name: 'Proposal', shortName: 'Proposal', count: 22, value: 1_640_000, color: '#818CF8', widthPct: 60 },
  { name: 'Negotiation', shortName: 'Negotiation', count: 11, value: 980_000, color: '#F59E0B', widthPct: 40 },
  { name: 'Closed Won', shortName: 'Won', count: 6, value: 720_000, color: '#00D4AA', widthPct: 22 },
];

export const activeDeals: Deal[] = [
  {
    id: 'OPP-2026-0041',
    company: 'Helion Energy',
    contact: 'Jenna Park',
    contactTitle: 'CTO',
    stage: 'Negotiation',
    value: 284000,
    probability: 82,
    aiScore: 94,
    aiConfidence: 'high',
    lastActivity: '2h ago',
    nextAction: 'Contract redline review',
    daysInStage: 4,
  },
  {
    id: 'OPP-2026-0038',
    company: 'Redwood Analytics',
    contact: 'Carlos Muñoz',
    contactTitle: 'VP IT',
    stage: 'Proposal',
    value: 156000,
    probability: 65,
    aiScore: 87,
    aiConfidence: 'high',
    lastActivity: '1d ago',
    nextAction: 'Follow up on SOW questions',
    daysInStage: 7,
  },
  {
    id: 'OPP-2026-0035',
    company: 'Luminary Biotech',
    contact: 'Fatima Al-Hassan',
    contactTitle: 'Director IT',
    stage: 'Proposal',
    value: 98500,
    probability: 58,
    aiScore: 79,
    aiConfidence: 'medium',
    lastActivity: '3d ago',
    nextAction: 'Schedule security assessment call',
    daysInStage: 12,
  },
  {
    id: 'OPP-2026-0031',
    company: 'Silvergate Wealth Mgmt',
    contact: 'Tom Bridwell',
    contactTitle: 'COO',
    stage: 'Qualified',
    value: 220000,
    probability: 45,
    aiScore: 83,
    aiConfidence: 'high',
    lastActivity: '2d ago',
    nextAction: 'Send compliance framework deck',
    daysInStage: 9,
  },
  {
    id: 'OPP-2026-0028',
    company: 'Orbital Defense Systems',
    contact: 'Maj. Dana Krebs (ret.)',
    contactTitle: 'CISO',
    stage: 'Qualified',
    value: 415000,
    probability: 38,
    aiScore: 91,
    aiConfidence: 'high',
    lastActivity: '4d ago',
    nextAction: 'CMMC gap analysis presentation',
    daysInStage: 14,
  },
  {
    id: 'OPP-2026-0024',
    company: 'Coastal Credit Union',
    contact: 'Brenda Holloway',
    contactTitle: 'SVP Operations',
    stage: 'Negotiation',
    value: 178000,
    probability: 75,
    aiScore: 88,
    aiConfidence: 'high',
    lastActivity: '6h ago',
    nextAction: 'Pricing finalization call',
    daysInStage: 6,
  },
  {
    id: 'OPP-2026-0019',
    company: 'Zenith Manufacturing',
    contact: 'Igor Petrov',
    contactTitle: 'Plant IT Manager',
    stage: 'Prospect',
    value: 67000,
    probability: 22,
    aiScore: 61,
    aiConfidence: 'low',
    lastActivity: '8d ago',
    nextAction: 'Discovery call — schedule',
    daysInStage: 22,
  },
];

export const scoredLeads: ScoredLead[] = [
  {
    company: 'Helion Energy',
    contact: 'Jenna Park',
    title: 'CTO',
    score: 94,
    confidence: 97,
    signals: ['Recent Series C', 'LinkedIn hiring 12 IT roles', 'Used competitor — public review'],
    estimatedValue: 284000,
    industry: 'Clean Energy',
  },
  {
    company: 'Orbital Defense Systems',
    contact: 'Maj. Dana Krebs (ret.)',
    title: 'CISO',
    score: 91,
    confidence: 93,
    signals: ['CMMC Level 2 mandate', 'Gov contract expansion', 'No MSSP on record'],
    estimatedValue: 415000,
    industry: 'Defense',
  },
  {
    company: 'Silvergate Wealth Mgmt',
    contact: 'Tom Bridwell',
    title: 'COO',
    score: 83,
    confidence: 89,
    signals: ['SEC cybersecurity rule deadline', 'Growing AUM > $2B', 'Incumbent contract expires Q2'],
    estimatedValue: 220000,
    industry: 'Finance',
  },
  {
    company: 'Coastal Credit Union',
    contact: 'Brenda Holloway',
    title: 'SVP Operations',
    score: 88,
    confidence: 91,
    signals: ['NCUA exam failed IT controls', 'Merger activity', 'RFP issued'],
    estimatedValue: 178000,
    industry: 'Banking',
  },
  {
    company: 'Redwood Analytics',
    contact: 'Carlos Muñoz',
    title: 'VP IT',
    score: 87,
    confidence: 88,
    signals: ['SOC 2 Type II requirement', 'AWS migration underway', 'Referral from Axiom'],
    estimatedValue: 156000,
    industry: 'SaaS / Data',
  },
];

export const quoteServices: QuoteService[] = [
  { id: 'mms-basic', name: 'Managed IT — Standard', category: 'Managed Services', unitPrice: 95, unit: '/user/mo' },
  { id: 'mms-pro', name: 'Managed IT — Pro (24/7)', category: 'Managed Services', unitPrice: 145, unit: '/user/mo' },
  { id: 'edr', name: 'EDR / Endpoint Protection', category: 'Security', unitPrice: 12, unit: '/endpoint/mo' },
  { id: 'siem', name: 'SIEM + SOC (co-managed)', category: 'Security', unitPrice: 28, unit: '/user/mo' },
  { id: 'backup', name: 'Cloud Backup (per TB)', category: 'Backup & DR', unitPrice: 85, unit: '/TB/mo' },
  { id: 'dr', name: 'Disaster Recovery as a Service', category: 'Backup & DR', unitPrice: 1800, unit: '/mo flat' },
  { id: 'm365-bp', name: 'Microsoft 365 Business Premium', category: 'Licensing', unitPrice: 22, unit: '/user/mo' },
  { id: 'azure', name: 'Azure CSP Management', category: 'Cloud', unitPrice: 350, unit: '/mo flat' },
  { id: 'vciso', name: 'vCISO Advisory (8 hrs/mo)', category: 'Compliance', unitPrice: 2400, unit: '/mo' },
  { id: 'noc', name: 'NOC — Network Monitoring', category: 'Infrastructure', unitPrice: 18, unit: '/device/mo' },
];

export const salesReps: SalesRep[] = [
  { name: 'Alicia Thornton', initials: 'AT', role: 'Account Executive', mtdRevenue: 184200, quota: 200000, deals: 3, closeRate: 41, color: '#00D4AA' },
  { name: 'James Osei', initials: 'JO', role: 'Senior AE', mtdRevenue: 247800, quota: 250000, deals: 4, closeRate: 38, color: '#818CF8' },
  { name: 'Mei-Ling Cho', initials: 'MC', role: 'Account Executive', mtdRevenue: 112400, quota: 175000, deals: 2, closeRate: 29, color: '#0D6EFD' },
  { name: 'Rafael Dominguez', initials: 'RD', role: 'Enterprise AE', mtdRevenue: 321000, quota: 300000, deals: 2, closeRate: 45, color: '#F59E0B' },
];

export const mockQuoteLineItems: QuoteLineItem[] = [
  { service: 'Managed IT — Pro (24/7)', qty: 85, unit: 'users', unitPrice: 145, total: 12325 },
  { service: 'EDR / Endpoint Protection', qty: 92, unit: 'endpoints', unitPrice: 12, total: 1104 },
  { service: 'SIEM + SOC (co-managed)', qty: 85, unit: 'users', unitPrice: 28, total: 2380 },
  { service: 'Microsoft 365 Business Premium', qty: 85, unit: 'users', unitPrice: 22, total: 1870 },
  { service: 'Cloud Backup (per TB)', qty: 12, unit: 'TB', unitPrice: 85, total: 1020 },
  { service: 'Disaster Recovery as a Service', qty: 1, unit: 'flat', unitPrice: 1800, total: 1800 },
  { service: 'vCISO Advisory (8 hrs/mo)', qty: 1, unit: 'mo', unitPrice: 2400, total: 2400 },
];
