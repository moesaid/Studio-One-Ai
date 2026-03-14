'use client';

import { Users, Plus, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function CharactersStep() {
  return (
    <div className="flex h-full flex-col">
      {/* Step header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <Users className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Characters</h2>
            <p className="text-xs text-muted-foreground">Define your cast</p>
          </div>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add Character
        </Button>
      </div>

      {/* Characters content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          <Card className="py-0">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/5 ring-1 ring-violet-500/10">
                  <UserPlus className="h-6 w-6 text-violet-400/70" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Create Your Characters
                  </h3>
                  <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
                    Define each character&apos;s appearance, personality, and voice.
                    These will be used to generate consistent visuals across your scenes.
                  </p>
                </div>
                <Button size="sm" className="mt-2">
                  <UserPlus className="mr-2 h-3.5 w-3.5" />
                  Create First Character
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
