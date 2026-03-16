'use client';

import { Sparkles, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { SCENE_EXTRACT_STEPS } from '@/features/projects/constants/scenes';

interface SceneExtractDialogProps {
  open: boolean;
  currentStep: number;
  progress?: string;
}

export function SceneExtractDialog({ open, currentStep, progress }: SceneExtractDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm [&>button]:hidden">
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Extracting Scenes</h3>
            <p className="text-xs text-muted-foreground">AI is analyzing your screenplay and generating scene visuals</p>
          </div>
          <div className="w-full space-y-2">
            {SCENE_EXTRACT_STEPS.map((step, i) => {
              const stepNum = i + 1;
              const isActive = currentStep === stepNum;
              const isDone = currentStep > stepNum;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-500/10 border border-amber-500/20'
                      : isDone
                        ? 'bg-emerald-500/5'
                        : 'opacity-40'
                  }`}
                >
                  <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {isDone ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                    ) : (
                      <span className="text-xs text-muted-foreground/50">{step.icon}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs ${
                      isActive
                        ? 'text-foreground font-medium'
                        : isDone
                          ? 'text-emerald-400/80'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Current scene progress */}
          {progress && (
            <p className="text-[11px] text-amber-400/80 font-medium truncate max-w-full">
              {progress}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground/50">
            This may take 2-5 minutes depending on script length and number of scenes
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
