import type {
  Evaluation,
  EvalSource,
  GeneratedPrompt,
  HistoryItem,
  HistoryRecord,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string })?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export interface EvaluateResponse {
  id: string | null;
  evaluation: Evaluation;
  source: EvalSource;
}

export function evaluateRequirements(payload: {
  requirements: string;
  targetPlatform?: string;
}): Promise<EvaluateResponse> {
  return request<EvaluateResponse>('/api/evaluate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface GenerateResponse {
  id: string | null;
  generatedPrompt: GeneratedPrompt;
  source: EvalSource;
}

export function generatePrompt(payload: {
  id?: string | null;
  requirements?: string;
  targetPlatform?: string;
  evaluation?: Evaluation;
}): Promise<GenerateResponse> {
  return request<GenerateResponse>('/api/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchHistory(): Promise<{ items: HistoryItem[]; persistent: boolean }> {
  return request('/api/history');
}

export function fetchHistoryItem(id: string): Promise<HistoryRecord> {
  return request<HistoryRecord>(`/api/history/${id}`);
}

export function deleteHistoryItem(id: string): Promise<{ ok: boolean }> {
  return request(`/api/history/${id}`, { method: 'DELETE' });
}

export interface HealthResponse {
  ok: boolean;
  mongo: boolean;
  model: string;
}

export function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/api/health');
}
