// ── NetOps / SOC Mock Data ──────────────────────────────────────────────────

export type ThreatSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type ThreatStatus = 'Auto-Remediated' | 'Human Review Required' | 'Investigating';

export interface ThreatEvent {
  id: string;
  timestamp: string;
  threatType: string;
  sourceIp: string;
  targetClient: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  protocol?: string;
  port?: number;
}

export interface ComplianceFramework {
  name: string;
  score: number;
  status: 'compliant' | 'partial' | 'at-risk';
  lastAudit: string;
  nextReview: string;
}

export interface VulnerabilityEntry {
  cve: string;
  description: string;
  cvss: number;
  affectedClients: number;
  patchStatus: 'Patched' | 'Pending' | 'Critical';
  published: string;
}

export interface EndpointCell {
  id: string;
  client: string;
  hostname: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
}

export interface SOCMetrics {
  threatsToday: number;
  autoRemediatedPct: number;
  avgResponseTime: string;
  clientsMonitored: number;
  openIncidents: number;
}

export const SOC_METRICS: SOCMetrics = {
  threatsToday: 4217,
  autoRemediatedPct: 95,
  avgResponseTime: '8s',
  clientsMonitored: 47,
  openIncidents: 3,
};

export const THREAT_FEED: ThreatEvent[] = [
  {
    id: 't001',
    timestamp: '14:32:07',
    threatType: 'Brute Force Attempt',
    sourceIp: '185.220.101.47',
    targetClient: 'Apex Dynamics',
    severity: 'High',
    status: 'Auto-Remediated',
    protocol: 'SSH',
    port: 22,
  },
  {
    id: 't002',
    timestamp: '14:31:44',
    threatType: 'Malware Detection',
    sourceIp: '10.0.14.22',
    targetClient: 'CloudVault Systems',
    severity: 'Critical',
    status: 'Human Review Required',
    protocol: 'HTTP',
    port: 80,
  },
  {
    id: 't003',
    timestamp: '14:31:12',
    threatType: 'Port Scan',
    sourceIp: '92.118.37.200',
    targetClient: 'NovaTech Partners',
    severity: 'Medium',
    status: 'Auto-Remediated',
    protocol: 'TCP',
  },
  {
    id: 't004',
    timestamp: '14:30:58',
    threatType: 'Privilege Escalation',
    sourceIp: '10.0.8.55',
    targetClient: 'Apex Dynamics',
    severity: 'Critical',
    status: 'Human Review Required',
  },
  {
    id: 't005',
    timestamp: '14:30:33',
    threatType: 'SQL Injection Attempt',
    sourceIp: '45.155.205.110',
    targetClient: 'MedCore Health',
    severity: 'High',
    status: 'Auto-Remediated',
    protocol: 'HTTPS',
    port: 443,
  },
  {
    id: 't006',
    timestamp: '14:29:51',
    threatType: 'DDoS Traffic Spike',
    sourceIp: '103.76.228.14',
    targetClient: 'Meridian Logistics',
    severity: 'High',
    status: 'Auto-Remediated',
    protocol: 'UDP',
  },
  {
    id: 't007',
    timestamp: '14:29:17',
    threatType: 'Phishing Link Blocked',
    sourceIp: '198.54.117.198',
    targetClient: 'SkyBridge Capital',
    severity: 'Medium',
    status: 'Auto-Remediated',
    protocol: 'SMTP',
    port: 25,
  },
  {
    id: 't008',
    timestamp: '14:28:44',
    threatType: 'Ransomware Signature',
    sourceIp: '10.0.3.88',
    targetClient: 'CloudVault Systems',
    severity: 'Critical',
    status: 'Auto-Remediated',
  },
  {
    id: 't009',
    timestamp: '14:28:09',
    threatType: 'Unauthorized API Access',
    sourceIp: '91.214.124.143',
    targetClient: 'Pinnacle DevOps',
    severity: 'High',
    status: 'Auto-Remediated',
    protocol: 'HTTPS',
    port: 443,
  },
  {
    id: 't010',
    timestamp: '14:27:38',
    threatType: 'Lateral Movement',
    sourceIp: '10.0.12.71',
    targetClient: 'NovaTech Partners',
    severity: 'High',
    status: 'Investigating',
  },
  {
    id: 't011',
    timestamp: '14:27:02',
    threatType: 'Credential Stuffing',
    sourceIp: '159.89.49.22',
    targetClient: 'Apex Dynamics',
    severity: 'Medium',
    status: 'Auto-Remediated',
    protocol: 'HTTPS',
    port: 443,
  },
  {
    id: 't012',
    timestamp: '14:26:29',
    threatType: 'DNS Tunneling',
    sourceIp: '185.107.56.17',
    targetClient: 'MedCore Health',
    severity: 'High',
    status: 'Auto-Remediated',
    protocol: 'DNS',
    port: 53,
  },
  {
    id: 't013',
    timestamp: '14:25:55',
    threatType: 'Exploit Kit Activity',
    sourceIp: '91.108.4.200',
    targetClient: 'SkyBridge Capital',
    severity: 'Critical',
    status: 'Auto-Remediated',
  },
  {
    id: 't014',
    timestamp: '14:25:18',
    threatType: 'Zero-Day Probe',
    sourceIp: '77.83.247.101',
    targetClient: 'Meridian Logistics',
    severity: 'Low',
    status: 'Auto-Remediated',
  },
  {
    id: 't015',
    timestamp: '14:24:44',
    threatType: 'Insider Anomaly',
    sourceIp: '10.0.5.130',
    targetClient: 'Pinnacle DevOps',
    severity: 'Medium',
    status: 'Auto-Remediated',
  },
];

export const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  { name: 'NIST CSF', score: 96, status: 'compliant', lastAudit: '2026-01-15', nextReview: '2026-07-15' },
  { name: 'CIS Controls', score: 91, status: 'compliant', lastAudit: '2026-02-01', nextReview: '2026-08-01' },
  { name: 'PCI DSS', score: 88, status: 'partial', lastAudit: '2026-01-28', nextReview: '2026-04-28' },
  { name: 'HIPAA', score: 94, status: 'compliant', lastAudit: '2026-02-10', nextReview: '2026-08-10' },
  { name: 'SOC 2', score: 82, status: 'partial', lastAudit: '2026-01-05', nextReview: '2026-04-05' },
];

export const TOP_VULNERABILITIES: VulnerabilityEntry[] = [
  {
    cve: 'CVE-2025-44832',
    description: 'OpenSSL Remote Code Execution',
    cvss: 9.8,
    affectedClients: 3,
    patchStatus: 'Critical',
    published: '2026-03-10',
  },
  {
    cve: 'CVE-2025-39217',
    description: 'Windows SMB Protocol Flaw',
    cvss: 8.5,
    affectedClients: 7,
    patchStatus: 'Pending',
    published: '2026-03-01',
  },
  {
    cve: 'CVE-2026-10043',
    description: 'Apache Log4j2 Deserialization',
    cvss: 7.9,
    affectedClients: 2,
    patchStatus: 'Patched',
    published: '2026-02-18',
  },
  {
    cve: 'CVE-2025-51102',
    description: 'Cisco IOS XE Auth Bypass',
    cvss: 9.1,
    affectedClients: 4,
    patchStatus: 'Pending',
    published: '2026-03-08',
  },
  {
    cve: 'CVE-2026-00284',
    description: 'Linux Kernel Privilege Escalation',
    cvss: 7.2,
    affectedClients: 5,
    patchStatus: 'Patched',
    published: '2026-02-25',
  },
];

const CLIENT_NAMES = [
  'Apex', 'CloudVault', 'NovaTech', 'MedCore', 'Meridian',
  'SkyBridge', 'Pinnacle', 'OrbitX', 'Vector9', 'Stratos',
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateEndpointGrid(): EndpointCell[] {
  const cells: EndpointCell[] = [];
  const statuses: EndpointCell['status'][] = ['healthy', 'healthy', 'healthy', 'healthy', 'healthy', 'healthy', 'healthy', 'warning', 'critical', 'offline'];
  for (let i = 0; i < 100; i++) {
    const clientIdx = Math.floor(i / 10);
    const endpointIdx = i % 10;
    const statusIdx = Math.floor(Math.random() * 10);
    cells.push({
      id: `ep-${i}`,
      client: CLIENT_NAMES[clientIdx],
      hostname: `${CLIENT_NAMES[clientIdx].toLowerCase()}-ep-${String(endpointIdx + 1).padStart(2, '0')}`,
      status: statuses[statusIdx],
    });
  }
  return cells;
}

// Deterministic grid — not random per render
export const ENDPOINT_GRID: EndpointCell[] = (() => {
  const pattern: EndpointCell['status'][] = [
    'healthy','healthy','healthy','healthy','healthy','healthy','healthy','warning','healthy','healthy',
    'healthy','healthy','warning','healthy','healthy','healthy','healthy','healthy','critical','healthy',
    'healthy','healthy','healthy','healthy','offline','healthy','healthy','healthy','healthy','healthy',
    'healthy','warning','healthy','healthy','healthy','healthy','healthy','healthy','healthy','healthy',
    'healthy','healthy','healthy','healthy','healthy','critical','healthy','healthy','healthy','warning',
    'healthy','healthy','healthy','healthy','healthy','healthy','healthy','healthy','healthy','healthy',
    'healthy','healthy','healthy','warning','healthy','healthy','healthy','healthy','healthy','healthy',
    'healthy','healthy','healthy','healthy','healthy','healthy','offline','healthy','healthy','healthy',
    'healthy','critical','healthy','healthy','healthy','healthy','healthy','warning','healthy','healthy',
    'healthy','healthy','healthy','healthy','healthy','healthy','healthy','healthy','healthy','healthy',
  ];
  return pattern.map((status, i) => ({
    id: `ep-${i}`,
    client: CLIENT_NAMES[Math.floor(i / 10)],
    hostname: `${CLIENT_NAMES[Math.floor(i / 10)].toLowerCase()}-ep-${String((i % 10) + 1).padStart(2, '0')}`,
    status,
  }));
})();

export const ALERT_SEVERITY_COUNTS = {
  critical: 12,
  high: 47,
  medium: 183,
  low: 341,
};
