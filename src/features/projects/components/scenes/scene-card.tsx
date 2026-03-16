'use client';

import { MapPin, Clock, Film, Users, Camera, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOOD_BADGE_CONFIG, TIME_BADGE_CONFIG } from '@/features/projects/constants/scenes';
import type { Scene, Character } from '@/features/projects/types';
import { cn } from '@/lib/utils';

interface SceneCardProps {
  scene: Scene;
  characters: Character[];
  isSelected: boolean;
  onSelect: (scene: Scene) => void;
  onEdit: (scene: Scene) => void;
  onDelete: (scene: Scene) => void;
}

export function SceneCard({ scene, characters, isSelected, onSelect, onEdit, onDelete }: SceneCardProps) {
  const mood = MOOD_BADGE_CONFIG[scene.mood] ?? MOOD_BADGE_CONFIG.dramatic;
  const time = TIME_BADGE_CONFIG[scene.time_of_day] ?? TIME_BADGE_CONFIG.day;

  // Map character IDs/names to actual character objects
  const sceneCharacters = characters.filter((c) =>
    scene.characters.some((sc) => sc.toLowerCase() === c.name.toLowerCase())
  );

  return (
    <Card
      className={cn(
        'py-0 cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-primary/30',
        isSelected && 'ring-1 ring-primary/50 bg-primary/[0.02]'
      )}
      onClick={() => onSelect(scene)}
    >
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header — order + title + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-[11px] font-bold text-amber-400 mt-0.5">
              {scene.order + 1}
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{scene.title}</h3>
              {scene.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                  {scene.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => { e.stopPropagation(); onEdit(scene); }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive/60 hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(scene); }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Tags row — location, time, mood */}
        <div className="flex flex-wrap items-center gap-1.5">
          {scene.location && (
            <Badge variant="outline" className="h-5 text-[10px] gap-1 font-normal border-border/40 text-muted-foreground">
              <MapPin className="h-2.5 w-2.5" /> {scene.location}
            </Badge>
          )}
          <Badge variant="outline" className="h-5 text-[10px] gap-1 font-normal border-border/40 text-muted-foreground">
            <Clock className="h-2.5 w-2.5" /> {time.icon} {time.label}
          </Badge>
          <Badge className={cn('h-5 text-[10px] gap-1 font-normal border', mood.bg, mood.text, mood.border)}>
            <Film className="h-2.5 w-2.5" /> {mood.label}
          </Badge>
        </div>

        {/* Action summary */}
        {scene.action && (
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed line-clamp-2 pl-0.5">
            {scene.action}
          </p>
        )}

        {/* Dialogue preview */}
        {scene.dialogue && (
          <div className="rounded-md bg-muted/30 px-2.5 py-1.5 border border-border/20">
            <p className="text-[11px] text-muted-foreground italic line-clamp-2 leading-relaxed">
              &ldquo;{scene.dialogue}&rdquo;
            </p>
          </div>
        )}

        {/* Characters + Camera notes row */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          {sceneCharacters.length > 0 && (
            <div className="flex items-center gap-1.5 min-w-0">
              <Users className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              <div className="flex flex-wrap gap-1">
                {sceneCharacters.slice(0, 4).map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/15"
                  >
                    {c.name}
                  </span>
                ))}
                {sceneCharacters.length > 4 && (
                  <span className="text-[10px] text-muted-foreground">+{sceneCharacters.length - 4}</span>
                )}
              </div>
            </div>
          )}
          {scene.camera_notes && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50 shrink-0">
              <Camera className="h-2.5 w-2.5" />
              <span className="truncate max-w-[120px]">{scene.camera_notes}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
