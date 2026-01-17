import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image, Video, Search } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function MediaPanel({ media, onMediaAdd, onMediaSelect }) {
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const mediaItem = {
          id: `media-${Date.now()}-${Math.random()}`,
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url: file_url,
          name: file.name,
          duration: file.type.startsWith('video/') ? 5 : 3, // Default durations
          thumbnail: file_url,
        };

        onMediaAdd(mediaItem);
      }
      toast.success('Media uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload media');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const filteredMedia = media.filter(item => 
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Upload button */}
      <div className="p-4 border-b">
        <label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button 
            className="w-full bg-[#ea00ea] hover:bg-[#ea00ea]/90"
            disabled={uploading}
            asChild
          >
            <span>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Media'}
            </span>
          </Button>
        </label>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Media grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Upload className="w-12 h-12 mb-2" />
            <p className="text-sm">No media uploaded yet</p>
            <p className="text-xs mt-1">Upload videos or images to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => onMediaSelect(item)}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:ring-2 hover:ring-[#ea00ea] transition-all group"
              >
                <img
                  src={item.thumbnail || item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Type indicator */}
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center">
                  {item.type === 'video' ? (
                    <Video className="w-3 h-3 text-white" />
                  ) : (
                    <Image className="w-3 h-3 text-white" />
                  )}
                </div>

                {/* Duration */}
                {item.duration && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs">
                    {item.duration}s
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#ea00ea]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}