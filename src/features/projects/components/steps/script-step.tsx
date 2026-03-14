'use client';

import { ScrollText, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ScriptStep() {
  return (
    <div className="flex h-full flex-col">
      {/* Step header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <ScrollText className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Script</h2>
            <p className="text-xs text-muted-foreground">Write your screenplay or story</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            AI Assist
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-3.5 w-3.5" />
            New Scene
          </Button>
        </div>
      </div>

      {/* Script content area */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <Card className="py-0">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 ring-1 ring-blue-500/10">
                  <ScrollText className="h-6 w-6 text-blue-400/70" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Start Your Script
                  </h3>
                  <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
                    Write your screenplay here or use AI Assist to generate a script from a prompt.
                    Each scene you write will flow into the next steps of your pipeline.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Generate with AI
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
