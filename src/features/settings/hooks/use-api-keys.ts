'use client';

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import type { ApiKey, ApiKeyFormData } from '../types';
import { STORAGE_KEY } from '../constants';
import * as storage from '../services/api-keys-storage';

export function useApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);

  // Load keys from localStorage on mount
  useEffect(() => {
    setKeys(storage.getApiKeys());
  }, []);

  const addKey = useCallback((data: ApiKeyFormData) => {
    const entry = storage.addApiKey(data);
    setKeys(storage.getApiKeys());
    toast.success('API key saved locally');
    return entry;
  }, []);

  const updateKey = useCallback((id: string, data: Partial<ApiKeyFormData>) => {
    const updated = storage.updateApiKey(id, data);
    if (updated) {
      setKeys(storage.getApiKeys());
      toast.success('API key updated');
    }
    return updated;
  }, []);

  const deleteKey = useCallback((id: string) => {
    const deleted = storage.deleteApiKey(id);
    if (deleted) {
      setKeys(storage.getApiKeys());
      toast.success('API key removed');
    }
    return deleted;
  }, []);

  return { keys, addKey, updateKey, deleteKey };
}
