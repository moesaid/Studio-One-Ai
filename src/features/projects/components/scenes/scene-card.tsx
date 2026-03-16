'use client';

import { useState } from 'react';
import { MapPin, Clock, Film, Users, Camera, Pencil, Trash2, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const mood = MOOD_BADGE_CONFIG[scene.mood] ?? MOOD_BADGE_CONFIG.dramatic;
  const time = TIME_BADGE_CONFIG[scene.time_of_day] ?? TIME_BADGE_CONFIG.day;

  const sceneCharacters = characters.filter((c) =>
    scene.characters.some((sc) => sc.toLowerCase() === c.name.toLowerCase())
  );

  const hasImages = scene.reference_images.length > 0;
  const totalSlides = scene.reference_images.length;
  const frameLabel = (i: number) => {
    if (i === 0) return 'OPEN';
    if (totalSlides > 1 && i === totalSlides - 1) return 'CLOSE';
    return `F${i + 1}`;
  };

  const goToSlide = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide(idx);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <Card
      className={cn(
        'py-0 cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-primary/30 overflow-hidden group',
        isSelected && 'ring-1 ring-primary/50 bg-primary/[0.02]'
      )}
      onClick={() => onSelect(scene)}
    >
      {/* Image slider */}
      {hasImages ? (
        <div className="relative aspect-video bg-black/20 overflow-hidden">
          {/* Slides */}
          <div
            className="flex h-full transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {scene.reference_images.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Scene ${scene.order + 1} — ${frameLabel(i)}`}
                className="h-full w-full flex-shrink-0 object-cover"
                loading="lazy"
              />
            ))}
          </div>

          {/* Frame label */}
          <span className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold tracking-wider text-white/90 uppercase backdrop-blur-sm">
            {frameLabel(currentSlide)}
          </span>

          {/* Scene number badge */}
          <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/90 text-[11px] font-bold text-white shadow-lg">
            {scene.order + 1}
          </span>

          {/* Prev / Next arrows (visible on hover) */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black/70"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-black/70"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {totalSlides > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {scene.reference_images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => goToSlide(i, e)}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    i === currentSlide
                      ? 'w-4 bg-white'
                      : 'w-1.5 bg-white/40 hover:bg-white/60'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* No-image placeholder */
        <div className="relative aspect-video bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 text-muted-foreground/30">
            <ImageIcon className="h-8 w-8" />
            <span className="text-[10px] font-medium">No frames yet</span>
          </div>
          <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/90 text-[11px] font-bold text-white shadow-lg">
            {scene.order + 1}
          </span>
        </div>
      )}

      <CardContent className="pt-3 pb-3 space-y-2">
        {/* Title + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground truncate">{scene.title}</h3>
              {hasImages && (
                <ImageIcon className="h-3 w-3 text-emerald-400 shrink-0" />
              )}
            </div>
            {scene.description && (
              <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                {scene.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
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

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-1">
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

        {/* Characters */}
        {sceneCharacters.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            <div className="flex flex-wrap gap-1">
              {sceneCharacters.slice(0, 3).map((c) => (
                <span
                  key={c.id}
                  className="inline-flex items-center rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-violet-400 ring-1 ring-violet-500/15"
                >
                  {c.name}
                </span>
              ))}
              {sceneCharacters.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{sceneCharacters.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Camera notes */}
        {scene.camera_notes && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <Camera className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{scene.camera_notes}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
