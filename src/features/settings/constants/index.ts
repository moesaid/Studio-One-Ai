import type { ApiKeyProvider } from '../types';

export const STORAGE_KEY = 'studio-one-api-keys';

export interface ProviderConfig {
  value: ApiKeyProvider;
  label: string;
  description: string;
  url: string;
  steps: string[];
}

export const PROVIDERS: ProviderConfig[] = [
  {
    value: 'gemini',
    label: 'Google Gemini',
    description: 'Powers text generation (Gemini) and image generation (Imagen)',
    url: 'https://aistudio.google.com/apikey',
    steps: [
      'Go to Google AI Studio (aistudio.google.com/apikey)',
      'Sign in with your Google account',
      'Click "Create API Key"',
      'Select or create a Google Cloud project',
      'Copy the generated API key and paste it below',
    ],
  },
];
