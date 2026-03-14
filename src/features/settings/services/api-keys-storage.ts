import type { ApiKey, ApiKeyFormData, ApiKeyProvider } from '../types';
import { STORAGE_KEY } from '../constants';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Read all stored API keys from localStorage.
 */
export function getApiKeys(): ApiKey[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get a single key by provider (e.g. 'gemini').
 */
export function getApiKeyByProvider(provider: ApiKeyProvider): ApiKey | null {
  const keys = getApiKeys();
  return keys.find((k) => k.provider === provider) ?? null;
}

/**
 * Add a new API key entry.
 */
export function addApiKey(data: ApiKeyFormData): ApiKey {
  const keys = getApiKeys();
  const now = new Date().toISOString();
  const entry: ApiKey = {
    id: generateId(),
    label: data.label,
    provider: data.provider,
    key: data.key,
    created_at: now,
    updated_at: now,
  };
  keys.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  return entry;
}

/**
 * Update an existing API key entry.
 */
export function updateApiKey(id: string, data: Partial<ApiKeyFormData>): ApiKey | null {
  const keys = getApiKeys();
  const idx = keys.findIndex((k) => k.id === id);
  if (idx === -1) return null;

  keys[idx] = {
    ...keys[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  return keys[idx];
}

/**
 * Delete an API key entry.
 */
export function deleteApiKey(id: string): boolean {
  const keys = getApiKeys();
  const filtered = keys.filter((k) => k.id !== id);
  if (filtered.length === keys.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
