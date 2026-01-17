import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Clock, MoreVertical, Play, Archive, ArchiveRestore, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  draft: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  rendering: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
};

export default function ReelCard({ reel, onEdit, onDelete, onDuplicate, onDownload, onArchive, onShare }) {
  const statusStyle = statusColors[reel.status] || statusColors.draft;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {/* Thumbnail */}
        <div 
          className="relative aspect-[9/16] bg-gradient-to-br from-[#ea00ea]/10 to-[#2699fe]/10 flex items-center justify-center overflow-hidden"
          onClick={() => onEdit(reel)}
        >
          {reel.thumbnail_url ? (
            <img 
              src={reel.thumbnail_url} 
              alt={reel.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Video className="w-12 h-12 text-gray-400" />
          )}
          
          {/* Play overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
              <Play className="w-6 h-6 text-[#ea00ea] ml-1" />
            </div>
          </div>

          {/* Template badge */}
          {reel.is_template && (
            <Badge 
              className="absolute top-2 left-2 bg-[#4bce2a] text-white border-none"
            >
              Template
            </Badge>
          )}

          {/* Duration */}
          {reel.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.floor(reel.duration)}s
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {reel.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(reel.created_date), 'MMM d, yyyy')}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(reel)}>
                  Edit
                </DropdownMenuItem>
                {reel.status === 'completed' && reel.video_url && (
                  <>
                    <DropdownMenuItem onClick={() => onDownload?.(reel)}>
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShare?.(reel)}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem onClick={() => onDuplicate(reel)}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive?.(reel)}>
                  {reel.archived ? (
                    <>
                      <ArchiveRestore className="w-4 h-4 mr-2" />
                      Unarchive
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(reel)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary"
              className={`${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}
            >
              {reel.status}
            </Badge>
            {reel.aspect_ratio && (
              <Badge variant="outline" className="text-xs">
                {reel.aspect_ratio}
              </Badge>
            )}
          </div>

          {reel.project && (
            <p className="text-xs text-gray-500 mt-2 truncate">
              Project: {reel.project}
            </p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}