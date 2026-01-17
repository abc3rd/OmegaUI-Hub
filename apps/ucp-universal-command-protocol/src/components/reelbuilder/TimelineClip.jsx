import React from 'react';
import { X, Video, Image as ImageIcon } from 'lucide-react';

export default function TimelineClip({ 
  clip, 
  isSelected, 
  isCurrent,
  onClick, 
  onRemove,
  isDragging 
}) {
  return (
    <div
      onClick={onClick}
      className={`
        relative w-24 h-20 rounded-lg overflow-hidden cursor-pointer transition-all
        ${isSelected ? 'ring-2 ring-[#ea00ea]' : 'ring-1 ring-gray-300'}
        ${isCurrent ? 'ring-2 ring-[#4bce2a]' : ''}
        ${isDragging ? 'opacity-50 rotate-3' : 'hover:scale-105'}
      `}
    >
      {/* Thumbnail */}
      <img
        src={clip.thumbnail || clip.url}
        alt={clip.name}
        className="w-full h-full object-cover"
      />

      {/* Type icon */}
      <div className="absolute top-1 left-1 w-4 h-4 rounded bg-black/70 flex items-center justify-center">
        {clip.type === 'video' ? (
          <Video className="w-2.5 h-2.5 text-white" />
        ) : (
          <ImageIcon className="w-2.5 h-2.5 text-white" />
        )}
      </div>

      {/* Duration */}
      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px]">
        {clip.duration?.toFixed(1)}s
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
      >
        <X className="w-2.5 h-2.5 text-white" />
      </button>

      {/* Current indicator */}
      {isCurrent && (
        <div className="absolute inset-0 border-2 border-[#4bce2a] pointer-events-none animate-pulse" />
      )}
    </div>
  );
}