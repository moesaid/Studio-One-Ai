'use client';

import {
  ScrollText,
  Users,
  Clapperboard,
  Wand2,
  Film,
  Download,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type PipelineStep =
  | 'script'
  | 'characters'
  | 'scenes'
  | 'generate'
  | 'edit'
  | 'export';

interface StepItem {
  id: PipelineStep;
  label: string;
  icon: LucideIcon;
}

const STEPS: StepItem[] = [
  { id: 'script', label: 'Script', icon: ScrollText },
  { id: 'characters', label: 'Characters', icon: Users },
  { id: 'scenes', label: 'Scenes', icon: Clapperboard },
  { id: 'generate', label: 'Generate', icon: Wand2 },
  { id: 'edit', label: 'Edit', icon: Film },
  { id: 'export', label: 'Export', icon: Download },
];

interface PipelineSidebarProps {
  activeStep: PipelineStep;
  onStepChange: (step: PipelineStep) => void;
}

export function PipelineSidebar({ activeStep, onStepChange }: PipelineSidebarProps) {
  return (
    <div className="flex h-full w-[180px] shrink-0 flex-col border-r border-border/50 bg-background">
      {/* Steps nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {STEPS.map((step) => {
          const isActive = step.id === activeStep;

          return (
            <button
              key={step.id}
              onClick={() => onStepChange(step.id)}
              className={cn(
                'group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors',
                isActive
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              <step.icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              />
              <span className="text-sm font-medium">{step.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
