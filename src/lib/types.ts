// Core platform types shared across all modules

export type Priority = 1 | 2 | 3;
export type HealthStatus = 'good' | 'warning' | 'critical';
export type ModuleId = 'service-desk' | 'netops' | 'finance' | 'procurement' | 'crm' | 'contracts' | 'security';

export interface Module {
  id: ModuleId;
  name: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  tier?: number;
}

export interface Client {
  id: string;
  name: string;
  site?: string;
  mrr: number;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  activeTickets: number;
  healthScore: number;
}

export interface AIInsight {
  id: string;
  module: ModuleId;
  severity: 'critical' | 'high' | 'medium' | 'info';
  message: string;
  confidence: number;
  actionLabel?: string;
  timestamp: string;
}

export interface ActivityEvent {
  id: string;
  module: ModuleId;
  type: string;
  description: string;
  timestamp: string;
  actor?: string;
  outcome?: 'success' | 'warning' | 'failure';
}
