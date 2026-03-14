'use client';

import { Wand2, Play, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function GenerateStep() {
  return (
    <div className="flex h-full flex-col">
      {/* Step header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Wand2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Generate</h2>
            <p className="text-xs text-muted-foreground">AI-generate video clips for your scenes</p>
          </div>
        </div>
        <Button size="sm">
          <Zap className="mr-2 h-3.5 w-3.5" />
          Generate All
        </Button>
      </div>

      {/* Generate content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl">
          <Card className="py-0">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 ring-1 ring-emerald-500/10">
                  <Play className="h-6 w-6 text-emerald-400/70" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Generate Video Clips
                  </h3>
                  <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
                    Use AI to generate video clips for each scene. Review and regenerate
                    until you&apos;re happy with the results.
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm">
                    Preview Scene
                  </Button>
                  <Button size="sm">
                    <Wand2 className="mr-2 h-3.5 w-3.5" />
                    Generate First Clip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
