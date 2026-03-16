'use client';

import { Key, Plus, Pencil, Trash2, Eye, EyeOff, ShieldCheck, HardDrive } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useApiKeys } from '@/features/settings/hooks/use-api-keys';
import { PROVIDERS } from '@/features/settings/constants';
import type { ApiKey as ApiKeyType, ApiKeyFormData, ApiKeyProvider } from '@/features/settings/types';

export default function SettingsPage() {
  const { keys, addKey, updateKey, deleteKey } = useApiKeys();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyType | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<ApiKeyType | null>(null);

  // Form state
  const [label, setLabel] = useState('');
  const [provider, setProvider] = useState<ApiKeyProvider>('gemini');
  const [keyValue, setKeyValue] = useState('');

  // Visibility toggles per key
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  function openAdd() {
    setEditingKey(null);
    setLabel('');
    setProvider('gemini');
    setKeyValue('');
    setDialogOpen(true);
  }

  function openEdit(entry: ApiKeyType) {
    setEditingKey(entry);
    setLabel(entry.label);
    setProvider(entry.provider);
    setKeyValue(entry.key);
    setDialogOpen(true);
  }

  function handleSave() {
    const data: ApiKeyFormData = { label: label.trim() || providerLabel(provider), provider, key: keyValue.trim() };
    if (!data.key) return;

    if (editingKey) {
      updateKey(editingKey.id, data);
    } else {
      addKey(data);
    }
    setDialogOpen(false);
  }

  function handleDelete() {
    if (deleteTarget) {
      deleteKey(deleteTarget.id);
      setDeleteTarget(null);
    }
  }

  function toggleVisibility(id: string) {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function providerLabel(p: ApiKeyProvider) {
    return PROVIDERS.find((pr) => pr.value === p)?.label ?? p;
  }

  function maskKey(key: string) {
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your API keys and preferences.
        </p>
      </div>

      <Separator />

      {/* Security notice */}
      <Card className="border-blue-500/20 bg-blue-500/5 py-0">
        <CardContent className="flex items-start gap-3 py-4">
          <div className="rounded-md bg-blue-500/10 p-2">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Local-only storage</p>
            <p className="text-xs text-muted-foreground">
              Your API keys are saved <strong>only in your browser&apos;s localStorage</strong>. They never leave your device,
              are never sent to our servers, and persist until you manually remove them.
            </p>
          </div>
          <Badge variant="outline" className="shrink-0 gap-1 text-xs ml-auto">
            <HardDrive className="h-3 w-3" />
            Local
          </Badge>
        </CardContent>
      </Card>

      {/* API Keys section */}
      <Card className="py-0">
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Add your provider API keys to enable AI features.
              </CardDescription>
            </div>
            <Button size="sm" onClick={openAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Key
            </Button>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="py-0">
          {keys.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Key className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No API keys yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                Add your first API key to start using AI-powered features like script generation and image creation.
              </p>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={openAdd}>
                <Plus className="h-3.5 w-3.5" />
                Add your first key
              </Button>
            </div>
          ) : (
            /* Key list */
            <div className="divide-y divide-border">
              {keys.map((entry) => {
                const isVisible = visibleKeys.has(entry.id);
                return (
                  <div key={entry.id} className="flex items-center gap-3 py-3">
                    <div className="rounded-md bg-muted p-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{entry.label}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {providerLabel(entry.provider)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                        {isVisible ? entry.key : maskKey(entry.key)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleVisibility(entry.id)}
                      >
                        {isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(entry)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(entry)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingKey ? 'Edit API Key' : 'Add API Key'}</DialogTitle>
            <DialogDescription>
              {editingKey
                ? 'Update your API key details below.'
                : 'Enter your API key. It will be stored locally in your browser.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="provider">Provider</Label>
              <Select value={provider} onValueChange={(v) => setProvider(v as ApiKeyProvider)}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {PROVIDERS.find((p) => p.value === provider)?.description}
              </p>
            </div>

            {/* How to get your key — step-by-step guide */}
            {!editingKey && (() => {
              const currentProvider = PROVIDERS.find((p) => p.value === provider);
              if (!currentProvider) return null;
              return (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                  <p className="text-xs font-medium text-foreground">
                    How to get your {currentProvider.label} API key
                  </p>
                  <ol className="text-[11px] text-muted-foreground space-y-1 list-decimal list-inside">
                    {currentProvider.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  <a
                    href={currentProvider.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-500 hover:underline mt-1"
                  >
                    Open {currentProvider.label} →
                  </a>
                </div>
              );
            })()}

            <div className="space-y-2">
              <Label htmlFor="label">Label (optional)</Label>
              <Input
                id="label"
                placeholder={`e.g. My ${providerLabel(provider)} Key`}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Paste your API key here"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!keyValue.trim()}>
              {editingKey ? 'Update' : 'Save Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>&ldquo;{deleteTarget?.label}&rdquo;</strong>?
              This will remove the key from your browser. AI features using this key will stop working.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
