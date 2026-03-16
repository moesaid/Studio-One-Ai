'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Download,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video_url: string;
  audio_url?: string;
  title: string;
  frame_label: string;
  duration?: number;
  model?: string;
  resolution?: string;
}

export function VideoPreviewDialog({
  open,
  onOpenChange,
  video_url,
  audio_url,
  title,
  frame_label,
  duration,
  model,
  resolution,
}: VideoPreviewDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Auto-play on open
  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    if (!open) {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }
  }, [open]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  }, []);

  // Listen for fullscreen exit via ESC
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / (videoRef.current.duration || 1)) * 100;
    setProgress(pct);
    setCurrentTime(videoRef.current.currentTime);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  }, []);

  const handleDownload = useCallback(() => {
    const a = document.createElement('a');
    a.href = video_url;
    a.download = `${title}-${frame_label}.mp4`;
    a.click();
  }, [video_url, title, frame_label]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 overflow-hidden bg-black border-white/10">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">
          {title} — {frame_label}
        </DialogTitle>

        <div ref={containerRef} className="flex flex-col bg-black">
          {/* Video area */}
          <div
            className="relative w-full cursor-pointer group/player"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={video_url}
              className="w-full aspect-video object-contain bg-black"
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              playsInline
              loop={false}
            />

            {/* Center play/pause icon (shows briefly on click) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/player:opacity-100 transition-opacity pointer-events-none">
              <div className="rounded-full bg-black/50 p-4 backdrop-blur-sm">
                {isPlaying ? (
                  <Pause className="h-8 w-8 text-white" />
                ) : (
                  <Play className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
          </div>

          {/* Controls bar */}
          <div className="px-4 py-3 space-y-2 bg-black/90">
            {/* Progress bar */}
            <div
              className="group/progress w-full h-1.5 bg-white/20 rounded-full cursor-pointer"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-emerald-500 rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-md opacity-0 group-hover/progress:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Bottom controls */}
            <div className="flex items-center justify-between">
              {/* Left: play, mute, time */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <span className="text-xs text-white/70 font-mono tabular-nums">
                  {formatTime(currentTime)}
                  {duration ? ` / ${formatTime(duration)}` : ''}
                </span>
              </div>

              {/* Center: meta info */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80 font-medium">{title}</span>
                <Badge
                  variant="outline"
                  className="text-[9px] border-white/20 text-white/60"
                >
                  {frame_label}
                </Badge>
                {model && (
                  <Badge
                    variant="outline"
                    className="text-[9px] border-white/20 text-white/60 font-mono"
                  >
                    {model.replace('-generate-001', '').replace('-generate', '')}
                  </Badge>
                )}
                {resolution && (
                  <Badge
                    variant="outline"
                    className="text-[9px] border-white/20 text-white/60"
                  >
                    {resolution}
                  </Badge>
                )}
              </div>

              {/* Right: download, fullscreen */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  title="Download video"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  title="Toggle fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
