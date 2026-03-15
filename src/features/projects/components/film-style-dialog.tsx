'use client';

import { useState, useMemo } from 'react';

import {
  Palette,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PRESET_FILM_STYLES } from '@/features/projects/constants';
import type { FilmStyle } from '@/features/projects/types';

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  Cinematic: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Animated: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Stylized: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'Sci-Fi & Fantasy': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Toy & Craft': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  Photography: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

interface FilmStyleDialogProps {
  open: boolean;
  onClose: () => void;
  current_style: FilmStyle | null;
  onSelect: (style: FilmStyle) => void;
  is_loading: boolean;
}

export function FilmStyleDialog({
  open,
  onClose,
  current_style,
  onSelect,
  is_loading,
}: FilmStyleDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    current_style?.id ?? null
  );

  // Group presets by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof PRESET_FILM_STYLES>();
    for (const style of PRESET_FILM_STYLES) {
      const list = map.get(style.category) ?? [];
      list.push(style);
      map.set(style.category, list);
    }
    return Array.from(map.entries());
  }, []);

  function handleConfirm() {
    const style = PRESET_FILM_STYLES.find((s) => s.id === selectedId);
    if (style) onSelect(style);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !is_loading && onClose()}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose Film Style
          </DialogTitle>
          <DialogDescription>
            Select a visual style that will shape all AI-generated images and videos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 pt-4">
          <ScrollArea className="h-[520px] pr-3">
            <div className="space-y-6 pb-6">
              {grouped.map(([category, styles]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${CATEGORY_BADGE_STYLES[category] ?? ''}`}
                    >
                      {category}
                    </Badge>
                    <div className="flex-1 h-px bg-border/40" />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {styles.map((style) => {
                      const isSelected = selectedId === style.id;
                      const isCurrent = current_style?.id === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => setSelectedId(style.id)}
                          className={`
                            group relative rounded-lg overflow-hidden transition-all
                            aspect-[3/4] border-2
                            hover:border-primary/60 hover:ring-2 hover:ring-primary/20 hover:scale-[1.02]
                            ${isSelected
                              ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
                              : 'border-transparent'
                            }
                          `}
                        >
                          {/* Full-bleed preview image */}
                          {style.preview_image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={style.preview_image}
                              alt={style.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          )}

                          {/* Gradient overlay at bottom */}
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                          {/* Style name at bottom */}
                          <div className="absolute inset-x-0 bottom-0 p-2">
                            <p className="text-xs font-semibold text-white leading-tight drop-shadow-md">
                              {style.name}
                            </p>
                          </div>

                          {/* Current badge */}
                          {isCurrent && (
                            <div className="absolute top-1.5 left-1.5">
                              <Badge
                                variant="secondary"
                                className="text-[8px] px-1 py-0 bg-white/90 text-black font-semibold"
                              >
                                Current
                              </Badge>
                            </div>
                          )}

                          {/* Selected check */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow-lg">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="px-6 pb-6 pt-3 border-t">
          <Button variant="outline" onClick={onClose} disabled={is_loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedId || is_loading}
          >
            {is_loading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="mr-2 h-3.5 w-3.5" />
            )}
            Set Style
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
