import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Music, Mic, Volume2, Trash2, Play, Pause } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AudioPanel({ audioTracks = [], onAudioTracksUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [playingId, setPlayingId] = useState(null);

  const handleAudioUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const newTrack = {
        id: `audio-${Date.now()}`,
        name: file.name,
        type: type,
        url: file_url,
        volume: 0.5,
        start_offset: 0,
        duration: 0,
        trim_start: 0,
        fade_in: 0.5,
        fade_out: 0.5,
      };

      onAudioTracksUpdate([...audioTracks, newTrack]);
      toast.success(`${type} track added`);
    } catch (error) {
      toast.error('Failed to upload audio');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleTrackUpdate = (id, updates) => {
    onAudioTracksUpdate(
      audioTracks.map(track => track.id === id ? { ...track, ...updates } : track)
    );
  };

  const handleTrackRemove = (id) => {
    onAudioTracksUpdate(audioTracks.filter(track => track.id !== id));
  };

  const getTrackIcon = (type) => {
    switch (type) {
      case 'music': return Music;
      case 'voiceover': return Mic;
      default: return Volume2;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Upload buttons */}
      <div className="p-4 border-b space-y-2">
        <label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleAudioUpload(e, 'music')}
            className="hidden"
            disabled={uploading}
          />
          <Button 
            className="w-full bg-[#2699fe] hover:bg-[#2699fe]/90"
            disabled={uploading}
            asChild
          >
            <span>
              <Music className="w-4 h-4 mr-2" />
              Add Background Music
            </span>
          </Button>
        </label>

        <label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => handleAudioUpload(e, 'voiceover')}
            className="hidden"
            disabled={uploading}
          />
          <Button 
            variant="outline"
            className="w-full"
            disabled={uploading}
            asChild
          >
            <span>
              <Mic className="w-4 h-4 mr-2" />
              Add Voiceover
            </span>
          </Button>
        </label>
      </div>

      {/* Audio tracks list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {audioTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Volume2 className="w-12 h-12 mb-2" />
            <p className="text-sm">No audio tracks</p>
            <p className="text-xs mt-1">Add music or voiceover</p>
          </div>
        ) : (
          audioTracks.map((track) => {
            const Icon = getTrackIcon(track.type);
            
            return (
              <div key={track.id} className="bg-white rounded-lg border p-3 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className="w-4 h-4 text-[#2699fe] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{track.type}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTrackRemove(track.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Volume */}
                <div>
                  <Label className="text-xs">
                    Volume ({Math.round(track.volume * 100)}%)
                  </Label>
                  <Slider
                    value={[track.volume * 100]}
                    onValueChange={(value) => handleTrackUpdate(track.id, { volume: value[0] / 100 })}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>

                {/* Start offset */}
                <div>
                  <Label className="text-xs">Start at (seconds)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={track.start_offset}
                    onChange={(e) => handleTrackUpdate(track.id, { start_offset: parseFloat(e.target.value) })}
                    className="mt-1"
                  />
                </div>

                {/* Fade controls */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Fade In (s)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={track.fade_in}
                      onChange={(e) => handleTrackUpdate(track.id, { fade_in: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Fade Out (s)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={track.fade_out}
                      onChange={(e) => handleTrackUpdate(track.id, { fade_out: parseFloat(e.target.value) })}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}