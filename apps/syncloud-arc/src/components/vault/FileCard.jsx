import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Image, Film, Music, Archive, 
  File, Shield, Clock, MoreVertical 
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const fileTypeIcons = {
  'image': Image,
  'video': Film,
  'audio': Music,
  'archive': Archive,
  'document': FileText,
  'default': File
};

const getFileCategory = (fileType) => {
  if (!fileType) return 'default';
  if (fileType.includes('image')) return 'image';
  if (fileType.includes('video')) return 'video';
  if (fileType.includes('audio')) return 'audio';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return 'archive';
  if (fileType.includes('pdf') || fileType.includes('doc') || fileType.includes('text')) return 'document';
  return 'default';
};

const formatFileSize = (sizeKb) => {
  if (!sizeKb) return '0 KB';
  if (sizeKb < 1024) return `${sizeKb.toFixed(1)} KB`;
  return `${(sizeKb / 1024).toFixed(1)} MB`;
};

export default function FileCard({ file, onRestore, onView }) {
  const category = getFileCategory(file.file_type);
  const FileIcon = fileTypeIcons[category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-4 group hover:border-slate-700 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
          <FileIcon className="w-5 h-5 text-slate-400" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{file.file_name}</h4>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-slate-500">{formatFileSize(file.file_size_kb)}</span>
            {file.is_encrypted && (
              <div className="flex items-center gap-1 text-[#4bce2a]">
                <Shield className="w-3 h-3" />
                <span className="text-xs">Encrypted</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {file.snapshot_count || 1} snapshots
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
              <DropdownMenuItem onClick={() => onView?.(file)} className="text-slate-300">
                View File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRestore?.(file)} className="text-slate-300">
                Restore Snapshot
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {file.last_modified && (
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-600">
            Modified: {format(new Date(file.last_modified), 'MMM d, yyyy HH:mm')}
          </span>
          <span className="text-xs font-mono text-slate-600">
            {file.source_provider}
          </span>
        </div>
      )}
    </motion.div>
  );
}