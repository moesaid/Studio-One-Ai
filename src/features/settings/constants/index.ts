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
    label: 'Google Vertex AI',
    description: 'Powers text generation (Gemini) and image generation (Imagen) via Vertex AI',
    url: 'https://console.cloud.google.com/vertex-ai',
    steps: [
      'Go to Google Cloud Console → Vertex AI (console.cloud.google.com/vertex-ai)',
      'Enable the Vertex AI API for your project',
      'AI features are now configured server-side — no API key needed in the app',
    ],
  },
];
