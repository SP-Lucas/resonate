// ── Security & Compliance Mock Data ─────────────────────────────────────────

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type ComplianceStatus = 'Certified' | 'In Progress' | 'Partial' | 'Gap';
export type SessionStatus = 'Active' | 'Idle' | 'Suspicious';

export interface SecurityPostureCategory {
  name: string;
  score: number;
  maxScore: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ZeroTrustMetric {
  name: string;
  value: string | number;
  unit?: string;
  status: 'good' | 'warn' | 'bad';
  detail: string;
}

export interface ActiveSession {
  id: string;
  user: string;
  role: string;
  location: string;
  ip: string;
  device: string;
  os: string;
  lastActivity: string;
  riskScore: number;
  status: SessionStatus;
  mfa: boolean;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  resource: string;
  resourceType: string;
  timestamp: string;
  ip: string;
  result: 'Success' | 'Failure' | 'Blocked';
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface ComplianceFramework {
  name: string;
  fullName: string;
  progress: number;
  status: ComplianceStatus;
  controls: { total: number; passed: number; failing: number };
  nextAction: string;
  nextActionDue: string;
  certExpiry?: string;
}

export interface VulnScanResult {
  lastScan: string;
  duration: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
  totalHosts: number;
  patchedLast7Days: number;
}

export const SECURITY_POSTURE_SCORE = 94;
export const POSTURE_TREND: 'up' | 'down' | 'stable' = 'up';
export const POSTURE_TREND_DELTA = '+2 from last week';

export const POSTURE_CATEGORIES: SecurityPostureCategory[] = [
  { name: 'Identity & Access', score: 97, maxScore: 100, trend: 'stable' },
  { name: 'Network Security', score: 91, maxScore: 100, trend: 'up' },
  { name: 'Data Protection', score: 98, maxScore: 100, trend: 'stable' },
  { name: 'Endpoint Security', score: 89, maxScore: 100, trend: 'up' },
  { name: 'Incident Response', score: 95, maxScore: 100, trend: 'up' },
  { name: 'Vulnerability Mgmt', score: 86, maxScore: 100, trend: 'down' },
];

export const ZERO_TRUST_METRICS: ZeroTrustMetric[] = [
  {
    name: 'MFA Enforcement',
    value: 98.4,
    unit: '%',
    status: 'good',
    detail: '472 / 480 accounts enforced',
  },
  {
    name: 'SSO Coverage',
    value: 94,
    unit: '%',
    status: 'good',
    detail: '113 / 120 apps integrated',
  },
  {
    name: 'Privileged Access Reviews',
    value: 'Current',
    status: 'good',
    detail: 'Last reviewed: 2026-03-01',
  },
  {
    name: 'Device Compliance',
    value: 91.2,
    unit: '%',
    status: 'good',
    detail: '438 / 480 endpoints compliant',
  },
  {
    name: 'Network Segmentation',
    value: 'Enforced',
    status: 'good',
    detail: '47 micro-segments active',
  },
  {
    name: 'Least Privilege Violations',
    value: 3,
    status: 'warn',
    detail: 'Pending remediation review',
  },
];

export const ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: 's001',
    user: 'rachel.kim@apexdynamics.io',
    role: 'Admin',
    location: 'San Francisco, CA',
    ip: '38.102.149.44',
    device: 'MacBook Pro 16"',
    os: 'macOS 15.2',
    lastActivity: '2 min ago',
    riskScore: 12,
    status: 'Active',
    mfa: true,
  },
  {
    id: 's002',
    user: 'jason.park@cloudvault.com',
    role: 'Engineer',
    location: 'Austin, TX',
    ip: '104.28.214.87',
    device: 'ThinkPad X1',
    os: 'Ubuntu 24.04',
    lastActivity: '8 min ago',
    riskScore: 18,
    status: 'Active',
    mfa: true,
  },
  {
    id: 's003',
    user: 'unknown@185.220.101.0',
    role: 'Unknown',
    location: 'Frankfurt, DE',
    ip: '185.220.101.62',
    device: 'Unknown',
    os: 'Linux x86_64',
    lastActivity: 'Just now',
    riskScore: 91,
    status: 'Suspicious',
    mfa: false,
  },
  {
    id: 's004',
    user: 'priya.sharma@novatech.ai',
    role: 'Data Scientist',
    location: 'Seattle, WA',
    ip: '73.140.228.19',
    device: 'MacBook Air M3',
    os: 'macOS 15.2',
    lastActivity: '1 min ago',
    riskScore: 8,
    status: 'Active',
    mfa: true,
  },
  {
    id: 's005',
    user: 'marcus.webb@pinnacledevops.co',
    role: 'DevOps',
    location: 'Chicago, IL',
    ip: '96.250.141.33',
    device: 'Windows 11 Pro',
    os: 'Windows 11',
    lastActivity: '47 min ago',
    riskScore: 34,
    status: 'Idle',
    mfa: true,
  },
  {
    id: 's006',
    user: 'evelyn.cho@skybridgecap.com',
    role: 'CFO',
    location: 'New York, NY',
    ip: '203.0.113.101',
    device: 'iPad Pro',
    os: 'iPadOS 18.2',
    lastActivity: '12 min ago',
    riskScore: 21,
    status: 'Active',
    mfa: true,
  },
  {
    id: 's007',
    user: 'svc-deploy@pinnacledevops.co',
    role: 'Service Account',
    location: 'Unknown / Cloud',
    ip: '34.102.136.180',
    device: 'GCP Compute',
    os: 'Container',
    lastActivity: 'Just now',
    riskScore: 55,
    status: 'Active',
    mfa: false,
  },
];

export const AUDIT_LOG: AuditLogEntry[] = [
  {
    id: 'al001',
    actor: 'rz-security-agent',
    actorRole: 'Automation',
    action: 'BLOCK_IP',
    resource: '185.220.101.47',
    resourceType: 'Network Rule',
    timestamp: '14:32:07',
    ip: 'internal',
    result: 'Success',
    severity: 'Warning',
  },
  {
    id: 'al002',
    actor: 'rachel.kim',
    actorRole: 'Admin',
    action: 'POLICY_UPDATE',
    resource: 'mfa-enforcement-policy',
    resourceType: 'IAM Policy',
    timestamp: '14:28:11',
    ip: '38.102.149.44',
    result: 'Success',
    severity: 'Info',
  },
  {
    id: 'al003',
    actor: 'unknown@185.220.101.62',
    actorRole: 'Unknown',
    action: 'LOGIN_ATTEMPT',
    resource: 'admin-portal',
    resourceType: 'Application',
    timestamp: '14:25:03',
    ip: '185.220.101.62',
    result: 'Blocked',
    severity: 'Critical',
  },
  {
    id: 'al004',
    actor: 'rz-security-agent',
    actorRole: 'Automation',
    action: 'QUARANTINE_ENDPOINT',
    resource: 'cloudvault-ep-09',
    resourceType: 'Endpoint',
    timestamp: '14:21:44',
    ip: 'internal',
    result: 'Success',
    severity: 'Warning',
  },
  {
    id: 'al005',
    actor: 'jason.park',
    actorRole: 'Engineer',
    action: 'SECRET_ACCESS',
    resource: 'vault/prod/db-credentials',
    resourceType: 'Vault Secret',
    timestamp: '14:18:29',
    ip: '104.28.214.87',
    result: 'Success',
    severity: 'Info',
  },
  {
    id: 'al006',
    actor: 'svc-deploy',
    actorRole: 'Service Account',
    action: 'ROLE_BIND',
    resource: 'cluster-admin',
    resourceType: 'K8s RBAC',
    timestamp: '14:14:52',
    ip: '34.102.136.180',
    result: 'Failure',
    severity: 'Critical',
  },
  {
    id: 'al007',
    actor: 'rz-security-agent',
    actorRole: 'Automation',
    action: 'KEY_ROTATION',
    resource: 'vault/transit/data-key',
    resourceType: 'Encryption Key',
    timestamp: '14:00:00',
    ip: 'internal',
    result: 'Success',
    severity: 'Info',
  },
  {
    id: 'al008',
    actor: 'evelyn.cho',
    actorRole: 'CFO',
    action: 'EXPORT_REPORT',
    resource: 'financial-audit-q1-2026',
    resourceType: 'Document',
    timestamp: '13:55:17',
    ip: '203.0.113.101',
    result: 'Success',
    severity: 'Info',
  },
];

export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  {
    name: 'SOC 2',
    fullName: 'SOC 2 Type II',
    progress: 78,
    status: 'In Progress',
    controls: { total: 64, passed: 50, failing: 4 },
    nextAction: 'Complete evidence collection for CC6.1–CC6.6',
    nextActionDue: '2026-04-01',
  },
  {
    name: 'ISO 27001',
    fullName: 'ISO/IEC 27001:2022',
    progress: 91,
    status: 'Certified',
    controls: { total: 93, passed: 85, failing: 2 },
    nextAction: 'Annual surveillance audit',
    nextActionDue: '2026-07-15',
    certExpiry: '2027-06-30',
  },
  {
    name: 'HIPAA',
    fullName: 'HIPAA Security Rule',
    progress: 94,
    status: 'Certified',
    controls: { total: 42, passed: 40, failing: 0 },
    nextAction: 'BA Agreement audit — MedCore Health',
    nextActionDue: '2026-06-01',
    certExpiry: '2027-01-14',
  },
  {
    name: 'PCI DSS',
    fullName: 'PCI DSS v4.0',
    progress: 83,
    status: 'Partial',
    controls: { total: 12, passed: 10, failing: 2 },
    nextAction: 'Remediate Req. 6.4 and 10.7',
    nextActionDue: '2026-04-15',
  },
  {
    name: 'GDPR',
    fullName: 'EU General Data Protection Regulation',
    progress: 96,
    status: 'Certified',
    controls: { total: 28, passed: 27, failing: 0 },
    nextAction: 'DPIA review for new EU data processor',
    nextActionDue: '2026-05-01',
    certExpiry: '2026-12-31',
  },
];

export const VULN_SCAN: VulnScanResult = {
  lastScan: '2026-03-17 06:00:01',
  duration: '14m 33s',
  critical: 3,
  high: 12,
  medium: 47,
  low: 119,
  totalHosts: 483,
  patchedLast7Days: 28,
};

export const ENCRYPTION_STATUS = [
  { label: 'Data at Rest', standard: 'AES-256-GCM', status: 'Active', provider: 'HashiCorp Vault', verified: '2026-03-17' },
  { label: 'Data in Transit', standard: 'TLS 1.3', status: 'Active', provider: 'Cloudflare / Internal PKI', verified: '2026-03-17' },
  { label: 'Key Rotation', standard: '90-day policy', status: 'Active', provider: 'HashiCorp Vault Transit', verified: '2026-03-17' },
  { label: 'Backup Encryption', standard: 'AES-256', status: 'Active', provider: 'Restic / S3 SSE', verified: '2026-03-15' },
];
