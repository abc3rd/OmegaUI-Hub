import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

export default function ImageUpload({ onImageUpload, isUploading }) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400'}`}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <UploadCloud className="w-12 h-12 text-slate-400" />
            {isUploading ? (
              <p className="text-slate-600">Uploading...</p>
            ) : isDragActive ? (
              <p className="text-slate-600">Drop the image here ...</p>
            ) : (
              <p className="text-slate-600">Drag & drop an image here, or click to select a file</p>
            )}
            <p className="text-xs text-slate-500">PNG, JPG, or WEBP</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}