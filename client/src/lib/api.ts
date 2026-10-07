import { Ticket, EvidenceFile, EvidenceCorrelation, KnowledgeBaseItem, UserProfile } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ResolveResponse {
  success: boolean;
  ticket: Ticket;
  evidence_files: EvidenceFile[];
  evidence_correlations: EvidenceCorrelation[];
}

export async function resolveIssue(formData: FormData): Promise<ResolveResponse> {
  const response = await fetch(`${API_BASE_URL}/resolve`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Analysis failed (${response.status})`);
  }

  return response.json();
}

export async function getTickets(params?: {
  status?: string;
  severity?: string;
  domain?: string;
  search?: string;
}): Promise<{ success: boolean; count: number; tickets: Ticket[] }> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.severity) query.append('severity', params.severity);
  if (params?.domain) query.append('domain', params.domain);
  if (params?.search) query.append('search', params.search);

  const response = await fetch(`${API_BASE_URL}/tickets?${query.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tickets: ${response.statusText}`);
  }
  return response.json();
}

export async function getTicketById(id: string): Promise<{
  success: boolean;
  ticket: Ticket;
  evidence_files: EvidenceFile[];
  evidence_correlations: EvidenceCorrelation[];
}> {
  const response = await fetch(`${API_BASE_URL}/tickets/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ticket ${id}`);
  }
  return response.json();
}

export async function updateTicketStatus(
  id: string,
  status: string,
  severity?: string
): Promise<{ success: boolean; ticket: Ticket }> {
  const response = await fetch(`${API_BASE_URL}/tickets/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, severity }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update ticket status`);
  }
  return response.json();
}

export async function getKnowledgeBase(params?: {
  category?: string;
  search?: string;
}): Promise<{ success: boolean; count: number; items: KnowledgeBaseItem[] }> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);

  const response = await fetch(`${API_BASE_URL}/knowledge-base?${query.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch knowledge base');
  }
  return response.json();
}

export async function uploadKnowledgeBaseDoc(formData: FormData): Promise<{
  success: boolean;
  item: KnowledgeBaseItem;
}> {
  const response = await fetch(`${API_BASE_URL}/knowledge-base/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to upload knowledge base documentation');
  }
  return response.json();
}

export async function syncUserProfile(profile: UserProfile): Promise<{ success: boolean; profile: UserProfile }> {
  const response = await fetch(`${API_BASE_URL}/auth/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!response.ok) {
    throw new Error('Failed to sync profile');
  }
  return response.json();
}
