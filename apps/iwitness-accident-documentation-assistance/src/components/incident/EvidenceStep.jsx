import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, Video, FileText, Upload, X, Image, 
  File, Mic, AlertCircle, CheckCircle, Loader2 
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const FILE_TYPES = {
  'image/jpeg': { icon: Image, type: 'photo', label: 'Photo' },
  'image/png': { icon: Image, type: 'photo', label: 'Photo' },
  'image/heic': { icon: Image, type: 'photo', label: 'Photo' },
  'video/mp4': { icon: Video, type: 'video', label: 'Video' },
  'video/quicktime': { icon: Video, type: 'video', label: 'Video' },
  'audio/mpeg': { icon: Mic, type: 'audio', label: 'Audio' },
  'audio/wav': { icon: Mic, type: 'audio', label: 'Audio' },
  'application/pdf': { icon: FileText, type: 'document', label: 'Document' }
};

export default function EvidenceStep({ incidentId, userId, evidenceFiles, setEvidenceFiles }) {
  const [uploading, setUploading] = useState({});
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files) => {
    for (const file of files) {
      const fileId = `${Date.now()}-${file.name}`;
      setUploading(prev => ({ ...prev, [fileId]: { name: file.name, progress: 0 } }));

      try {
        // Upload to storage
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const fileInfo = FILE_TYPES[file.type] || { icon: File, type: 'other', label: 'File' };
        
        // Create evidence record
        const evidence = await base44.entities.EvidenceFile.create({
          incident_id: incidentId,
          uploader_user_id: userId,
          file_type: fileInfo.type,
          filename: file.name,
          file_url,
          file_size: file.size,
          mime_type: file.type,
          tags: [],
          metadata: {}
        });

        setEvidenceFiles(prev => [...prev, evidence]);
        setUploading(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
      } catch (error) {
        console.error('Upload failed:', error);
        setUploading(prev => {
          const newState = { ...prev };
          delete newState[fileId];
          return newState;
        });
      }
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [incidentId, userId]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const removeFile = async (fileId) => {
    try {
      await base44.entities.EvidenceFile.delete(fileId);
      setEvidenceFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Failed to remove file:', error);
    }
  };

  const getFileIcon = (file) => {
    const config = FILE_TYPES[file.mime_type] || { icon: File };
    const Icon = config.icon;
    return <Icon className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-50">
          <Camera className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Evidence & Documents</h2>
          <p className="text-sm text-slate-500">Upload photos, videos, and documents related to the incident</p>
        </div>
      </div>

      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-all",
          dragActive 
            ? "border-indigo-500 bg-indigo-50" 
            : "border-slate-200 hover:border-slate-300"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className={cn(
            "p-4 rounded-full mb-4 transition-colors",
            dragActive ? "bg-indigo-100" : "bg-slate-100"
          )}>
            <Upload className={cn(
              "w-8 h-8",
              dragActive ? "text-indigo-600" : "text-slate-400"
            )} />
          </div>
          <h3 className="font-medium text-slate-700 mb-2">
            {dragActive ? "Drop files here" : "Drag & drop files here"}
          </h3>
          <p className="text-sm text-slate-500 text-center max-w-sm mb-4">
            or click below to browse. Supports photos, videos, audio, and PDF documents.
          </p>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <label className="cursor-pointer">
                <Camera className="w-4 h-4 mr-2" />
                Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(Array.from(e.target.files))}
                />
              </label>
            </Button>
            <Button asChild variant="outline">
              <label className="cursor-pointer">
                <Video className="w-4 h-4 mr-2" />
                Videos
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(Array.from(e.target.files))}
                />
              </label>
            </Button>
            <Button asChild variant="outline">
              <label className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Documents
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(Array.from(e.target.files))}
                />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      <AnimatePresence>
        {Object.entries(uploading).map(([id, file]) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-0 shadow-sm bg-blue-50">
              <CardContent className="flex items-center gap-4 py-4">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-500">Uploading...</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Uploaded Files */}
      {evidenceFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700">Uploaded Evidence ({evidenceFiles.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence mode="popLayout">
              {evidenceFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border-0 shadow-sm">
                    <CardContent className="flex items-center gap-3 py-3 px-4">
                      {file.file_type === 'photo' && file.file_url ? (
                        <img 
                          src={file.file_url} 
                          alt={file.filename}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                          {getFileIcon(file)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.filename}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {FILE_TYPES[file.mime_type]?.label || 'File'}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {formatFileSize(file.file_size)}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(file.id)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Tips */}
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="flex items-start gap-3 pt-4">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-800">What to Upload</p>
            <ul className="text-sm text-emerald-700 mt-1 list-disc list-inside space-y-1">
              <li>Photos of vehicle damage</li>
              <li>Photos of the accident scene</li>
              <li>Insurance documents and correspondence</li>
              <li>Medical bills and records (if applicable)</li>
              <li>Police report (if you have a copy)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}