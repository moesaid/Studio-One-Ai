'use client';

import { Clapperboard, Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ScenesStep() {
  return (
    <div className="flex h-full flex-col">
      {/* Step header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
            <Clapperboard className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Scenes</h2>
            <p className="text-xs text-muted-foreground">Break your story into visual scenes</p>
          </div>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-3.5 w-3.5" />
          Add Scene
        </Button>
      </div>

      {/* Scenes content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          <Card className="py-0">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 ring-1 ring-amber-500/10">
                  <Layers className="h-6 w-6 text-amber-400/70" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Build Your Scenes
                  </h3>
                  <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
                    Break your script into individual scenes. Assign characters, set locations,
                    and describe the visual direction for each scene.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  <Layers className="mr-2 h-3.5 w-3.5" />
                  Auto-Split from Script
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
