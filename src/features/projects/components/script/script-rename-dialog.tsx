'use client';

import { Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ScriptRenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function ScriptRenameDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onSubmit,
  isPending,
}: ScriptRenameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename Chapter</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="rename-title">Title</Label>
            <Input
              id="rename-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!title.trim() || isPending}>
            {isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Pencil className="mr-2 h-3.5 w-3.5" />}
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
