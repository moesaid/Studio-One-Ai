'use client';

import { Download, FileVideo, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ExportStep() {
  return (
    <div className="flex h-full flex-col">
      {/* Step header */}
      <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
            <Download className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Export</h2>
            <p className="text-xs text-muted-foreground">Combine clips into your final movie</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings2 className="mr-2 h-3.5 w-3.5" />
            Settings
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-3.5 w-3.5" />
            Export Movie
          </Button>
        </div>
      </div>

      {/* Export content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <Card className="py-0">
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/10 to-pink-500/5 ring-1 ring-rose-500/10">
                  <FileVideo className="h-6 w-6 text-rose-400/70" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Export Your Movie
                  </h3>
                  <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
                    When your clips are edited and arranged, export them as a single movie file.
                    Choose resolution, format, and quality settings.
                  </p>
                </div>
                <Button size="sm" className="mt-2" disabled>
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Export When Ready
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
