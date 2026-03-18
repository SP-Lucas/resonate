export const MODULES = [
  {
    id: 'service-desk',
    name: 'Service Desk',
    description: 'Ticket management, SLA tracking, and client support automation',
    icon: '🎫',
    path: '/service-desk',
    color: '#00D4AA',
  },
  {
    id: 'netops',
    name: 'NetOps',
    description: 'Network monitoring, threat detection, and infrastructure health',
    icon: '🛡️',
    path: '/netops',
    color: '#0D6EFD',
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Invoicing, collections, DSO tracking, and financial reporting',
    icon: '💰',
    path: '/finance',
    color: '#00D4AA',
  },
  {
    id: 'procurement',
    name: 'Procurement',
    description: 'Vendor management, purchase orders, and spend analytics',
    icon: '📦',
    path: '/procurement',
    color: '#818CF8',
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Client relationships, pipeline management, and account health',
    icon: '🤝',
    path: '/crm',
    color: '#F59E0B',
  },
  {
    id: 'contracts',
    name: 'Contracts',
    description: 'Contract lifecycle, renewals, and compliance tracking',
    icon: '📋',
    path: '/contracts',
    color: '#818CF8',
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Vulnerability management, compliance posture, and incident response',
    icon: '🔐',
    path: '/security',
    color: '#EF4444',
  },
] as const;

export type ModuleId = (typeof MODULES)[number]['id'];

export const PLATFORM_CONFIG = {
  version: '1.0.0',
  name: 'Resonate MSP OS',
  tagline: 'The operating system for modern MSPs — AI-native, fully automated, built for scale.',
  supportEmail: 'support@resonate.msp',
  docsUrl: 'https://docs.resonate.msp',
};

export const COLOR_TOKENS = {
  background: '#070D1A',
  card: '#0A1225',
  nav: '#080E1C',
  input: '#060D1A',
  borderSubtle: '#0F2040',
  borderStrong: '#1E3A5F',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  teal: '#00D4AA',
  blue: '#0D6EFD',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#818CF8',
} as const;
