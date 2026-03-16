export interface ApiKey {
  /** Unique ID for the key entry */
  id: string;
  /** Display label (e.g. "My Gemini Key") */
  label: string;
  /** Provider slug */
  provider: ApiKeyProvider;
  /** The actual API key value */
  key: string;
  /** ISO timestamp when added */
  created_at: string;
  /** ISO timestamp when last updated */
  updated_at: string;
}

export type ApiKeyProvider = 'gemini';

export interface ApiKeyFormData {
  label: string;
  provider: ApiKeyProvider;
  key: string;
}
