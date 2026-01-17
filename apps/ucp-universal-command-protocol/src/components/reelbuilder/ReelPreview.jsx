import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

// Helper to get CSS filter styles
const getFilterStyle = (filter) => {
  switch (filter) {
    case 'blackwhite':
      return 'grayscale(100%)';
    case 'sepia':
      return 'sepia(100%)';
    case 'vintage':
      return 'sepia(50%) contrast(110%) brightness(110%)';
    case 'cool':
      return 'hue-rotate(180deg) saturate(120%)';
    case 'warm':
      return 'sepia(30%) saturate(130%) brightness(105%)';
    default:
      return 'none';
  }
};

// Helper to interpolate keyframes
const interpolateKeyframes = (keyframes, time) => {
  if (!keyframes || keyframes.length === 0) return null;
  if (keyframes.length === 1) return keyframes[0];

  // Find surrounding keyframes
  let before = null;
  let after = null;

  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i].time <= time) {
      before = keyframes[i];
    }
    if (keyframes[i].time >= time && !after) {
      after = keyframes[i];
    }
  }

  if (!before) return after;
  if (!after) return before;
  if (before === after) return before;

  // Linear interpolation
  const t = (time - before.time) / (after.time - before.time);
  return {
    x: before.x + (after.x - before.x) * t,
    y: before.y + (after.y - before.y) * t,
    scale: before.scale + (after.scale - before.scale) * t,
    opacity: before.opacity + (after.opacity - before.opacity) * t,
  };
};

export default function ReelPreview({ 
  clips = [], 
  textOverlays = [], 
  currentTime = 0,
  onTimeUpdate,
  aspectRatio = '9:16',
  isPlaying,
  onPlayPause 
}) {
  const [localTime, setLocalTime] = useState(currentTime);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  // Aspect ratio styles
  const aspectRatioClasses = {
    '9:16': 'aspect-[9/16] max-h-[600px]',
    '1:1': 'aspect-square max-h-[500px]',
    '16:9': 'aspect-video max-h-[400px]',
  };

  const totalDuration = clips.reduce((sum, clip) => sum + (clip.duration || 0), 0);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setLocalTime(prev => {
        const newTime = prev + deltaTime;
        if (newTime >= totalDuration) {
          onPlayPause?.(false);
          return 0;
        }
        onTimeUpdate?.(newTime);
        return newTime;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, totalDuration, onTimeUpdate, onPlayPause]);

  // Sync with external time updates
  useEffect(() => {
    setLocalTime(currentTime);
  }, [currentTime]);

  // Find current clip
  const getCurrentClip = () => {
    let accumulatedTime = 0;
    for (const clip of clips) {
      const clipDuration = clip.duration || 0;
      if (localTime >= accumulatedTime && localTime < accumulatedTime + clipDuration) {
        return { clip, startTime: accumulatedTime };
      }
      accumulatedTime += clipDuration;
    }
    return null;
  };

  const currentClipInfo = getCurrentClip();

  // Get visible text overlays
  const visibleOverlays = textOverlays.filter(overlay => 
    localTime >= overlay.start_time && localTime <= overlay.end_time
  );

  const handleSkipForward = () => {
    const newTime = Math.min(localTime + 5, totalDuration);
    setLocalTime(newTime);
    onTimeUpdate?.(newTime);
  };

  const handleSkipBack = () => {
    const newTime = Math.max(localTime - 5, 0);
    setLocalTime(newTime);
    onTimeUpdate?.(newTime);
  };

  const handleReset = () => {
    setLocalTime(0);
    onTimeUpdate?.(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Phone frame preview */}
      <div className="relative">
        {/* Phone frame */}
        <div 
          className={`relative ${aspectRatioClasses[aspectRatio]} w-[320px] rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-gray-800`}
        >
          {/* Notch (for 9:16 only) */}
          {aspectRatio === '9:16' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />
          )}

          {/* Content area */}
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            {/* Current clip with filter */}
            {currentClipInfo?.clip ? (
              <div 
                className="w-full h-full"
                style={{
                  filter: getFilterStyle(currentClipInfo.clip.filter),
                }}
              >
                {currentClipInfo.clip.type === 'video' ? (
                  <video
                    src={currentClipInfo.clip.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={currentClipInfo.clip.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="text-white/50 text-sm">No clips added</div>
            )}

            {/* Text overlays with keyframe animation */}
            {visibleOverlays.map((overlay) => {
              const keyframeValues = overlay.keyframes && overlay.keyframes.length > 0
                ? interpolateKeyframes(overlay.keyframes, localTime)
                : null;

              const x = keyframeValues?.x ?? overlay.position?.x ?? 50;
              const y = keyframeValues?.y ?? overlay.position?.y ?? 50;
              const scale = keyframeValues?.scale ?? 1;
              const opacity = keyframeValues?.opacity ?? 1;

              return (
                <motion.div
                  key={overlay.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    opacity: opacity,
                    color: overlay.color || '#ffffff',
                    fontSize: `${overlay.size || 24}px`,
                    fontFamily: overlay.font || 'Inter',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                    maxWidth: '90%',
                  }}
                >
                  {overlay.content}
                </motion.div>
              );
            })}
          </div>

          {/* Time indicator */}
          <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-black/70 text-white text-xs z-20">
            {Math.floor(localTime)}s / {Math.floor(totalDuration)}s
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleSkipBack}
          disabled={localTime === 0}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          size="icon"
          onClick={() => onPlayPause?.(!isPlaying)}
          className="w-12 h-12 bg-[#ea00ea] hover:bg-[#ea00ea]/90"
          disabled={clips.length === 0}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-1" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleSkipForward}
          disabled={localTime >= totalDuration}
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[320px]">
        <input
          type="range"
          min="0"
          max={totalDuration || 100}
          value={localTime}
          onChange={(e) => {
            const newTime = parseFloat(e.target.value);
            setLocalTime(newTime);
            onTimeUpdate?.(newTime);
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ea00ea 0%, #ea00ea ${(localTime / totalDuration) * 100}%, #e5e7eb ${(localTime / totalDuration) * 100}%, #e5e7eb 100%)`,
          }}
        />
      </div>
    </div>
  );
}