'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface TagInputProps {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}

export function TagInput({ label, values, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState('');

  function addTag() {
    const t = input.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setInput('');
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1.5 min-h-[32px] rounded-md border border-border/40 bg-background/50 px-2 py-1.5">
        {values.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 text-[11px] h-5 px-2 bg-muted/50">
            {tag}
            <button type="button" onClick={() => onChange(values.filter((t) => t !== tag))} className="ml-0.5 hover:text-foreground transition-colors">
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          onBlur={addTag}
          placeholder={values.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] bg-transparent text-xs outline-none placeholder:text-muted-foreground/40"
        />
      </div>
    </div>
  );
}
