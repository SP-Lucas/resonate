// Typed API client for the Resonate MSP FastAPI backend

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ─── DTO / Response Types ────────────────────────────────────────────────────

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

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  client_id?: string;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  sla_breach?: boolean;
}

export interface CreateTicketDto {
  title: string;
  description?: string;
  priority?: number;
  client_id?: string;
  assignee_id?: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: number;
  assignee_id?: string;
}

export interface QueueStats {
  open: number;
  in_progress: number;
  breached: number;
  resolved_today: number;
  avg_resolution_minutes: number;
}

export interface Threat {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  source_ip?: string;
  target?: string;
  detected_at: string;
  resolved: boolean;
}

export interface NetOpsStats {
  devices_online: number;
  devices_total: number;
  active_alerts: number;
  bandwidth_utilization: number;
  uptime_percent: number;
}

export interface ComplianceScore {
  framework: string;
  score: number;
  last_assessed: string;
  controls_passed: number;
  controls_total: number;
}

export interface DispatchResult {
  ticket_id: string;
  assigned_to?: string;
  estimated_resolution?: string;
  actions_taken: string[];
  confidence: number;
}

export interface AIInsight {
  id: string;
  module: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  message: string;
  confidence: number;
  actionLabel?: string;
  timestamp: string;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const body = await res.json();
      message = body?.detail ?? body?.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return '';
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

// ─── API Surface ─────────────────────────────────────────────────────────────

export const api = {
  tickets: {
    list(params?: { status?: string; priority?: number; client_id?: string }): Promise<Ticket[]> {
      return request<Ticket[]>(`/tickets${buildQuery(params)}`);
    },
    get(id: string): Promise<Ticket> {
      return request<Ticket>(`/tickets/${id}`);
    },
    create(data: CreateTicketDto): Promise<Ticket> {
      return request<Ticket>('/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update(id: string, data: UpdateTicketDto): Promise<Ticket> {
      return request<Ticket>(`/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    complete(id: string): Promise<Ticket> {
      return request<Ticket>(`/tickets/${id}/complete`, { method: 'POST' });
    },
    stats(): Promise<QueueStats> {
      return request<QueueStats>('/tickets/stats');
    },
  },

  clients: {
    list(): Promise<Client[]> {
      return request<Client[]>('/clients');
    },
    get(id: string): Promise<Client> {
      return request<Client>(`/clients/${id}`);
    },
  },

  netops: {
    threats(params?: { hours?: number }): Promise<Threat[]> {
      return request<Threat[]>(`/netops/threats${buildQuery(params)}`);
    },
    stats(): Promise<NetOpsStats> {
      return request<NetOpsStats>('/netops/stats');
    },
    compliance(): Promise<ComplianceScore[]> {
      return request<ComplianceScore[]>('/netops/compliance');
    },
  },

  ai: {
    dispatch(ticketId: string): Promise<DispatchResult> {
      return request<DispatchResult>(`/ai/dispatch/${ticketId}`, { method: 'POST' });
    },
    insights(): Promise<AIInsight[]> {
      return request<AIInsight[]>('/ai/insights');
    },
    summarize(ticketId: string): Promise<string> {
      return request<string>(`/ai/summarize/${ticketId}`);
    },
  },

  auth: {
    login(email: string, password: string): Promise<{ access_token: string; user: User }> {
      return request<{ access_token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    logout(): Promise<void> {
      return request<void>('/auth/logout', { method: 'POST' });
    },
    me(): Promise<User> {
      return request<User>('/auth/me');
    },
  },
};
