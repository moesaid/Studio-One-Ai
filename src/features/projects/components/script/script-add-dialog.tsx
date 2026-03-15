'use client';

import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ScriptAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function ScriptAddDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onSubmit,
  isPending,
}: ScriptAddDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Chapter</DialogTitle>
          <DialogDescription>Give your chapter a short, descriptive title.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="chapter-title">Title</Label>
            <Input
              id="chapter-title"
              placeholder="e.g. The Arrival"
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
            {isPending ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-2 h-3.5 w-3.5" />}
            Add Chapter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
