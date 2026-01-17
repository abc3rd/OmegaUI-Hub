import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Download, 
  ArrowLeft, 
  Undo, 
  Redo, 
  Plus,
  Type as TypeIcon,
  Sparkles,
  Music,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from "sonner";

import MediaPanel from '@/components/reelbuilder/MediaPanel';
import TemplatePanel from '@/components/reelbuilder/TemplatePanel';
import BrandPanel from '@/components/reelbuilder/BrandPanel';
import AudioPanel from '@/components/reelbuilder/AudioPanel';
import ReelPreview from '@/components/reelbuilder/ReelPreview';
import Timeline from '@/components/reelbuilder/Timeline';
import Inspector from '@/components/reelbuilder/Inspector';
import ExportModal from '@/components/reelbuilder/ExportModal';

export default function ReelEditor() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const reelId = urlParams.get('id');

  // State
  const [reelData, setReelData] = useState({
    title: 'Untitled Reel',
    status: 'draft',
    aspect_ratio: '9:16',
    clips: [],
    text_overlays: [],
    audio_tracks: [],
    export_settings: { resolution: '1080p', fps: 30 },
  });
  
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load reel if editing
  const { data: existingReel } = useQuery({
    queryKey: ['reel', reelId],
    queryFn: () => base44.entities.Reel.get(reelId),
    enabled: !!reelId,
  });

  useEffect(() => {
    if (existingReel) {
      setReelData(existingReel);
      // Initialize history
      setHistory([existingReel]);
      setHistoryIndex(0);
    }
  }, [existingReel]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (reelId) {
        return base44.entities.Reel.update(reelId, data);
      }
      return base44.entities.Reel.create(data);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel saved');
      if (!reelId) {
        window.location.href = createPageUrl(`ReelEditor?id=${saved.id}`);
      }
    },
  });

  // Update reel data with history tracking
  const updateReelData = (updates) => {
    setReelData(prev => {
      const newData = { ...prev, ...updates };
      
      // Add to history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newData);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      return newData;
    });
  };

  // Undo/Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setReelData(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setReelData(history[historyIndex + 1]);
    }
  };

  // Media handlers
  const handleMediaAdd = (mediaItem) => {
    setMediaLibrary(prev => [...prev, mediaItem]);
  };

  const handleMediaSelect = (mediaItem) => {
    const newClip = {
      ...mediaItem,
      id: `clip-${Date.now()}`,
    };
    updateReelData({ clips: [...reelData.clips, newClip] });
    toast.success('Clip added to timeline');
  };

  // Template handlers
  const handleTemplateSelect = (template) => {
    if (template.id === 'blank') {
      updateReelData({ aspect_ratio: template.aspectRatio });
      toast.success('Blank canvas selected');
    } else {
      toast.info('Template applied');
    }
  };

  // Clip handlers
  const handleClipsReorder = (newClips) => {
    updateReelData({ clips: newClips });
  };

  const handleClipSelect = (clip) => {
    setSelectedElement(clip);
  };

  const handleClipRemove = (clipId) => {
    updateReelData({
      clips: reelData.clips.filter(c => c.id !== clipId),
    });
    if (selectedElement?.id === clipId) {
      setSelectedElement(null);
    }
  };

  // Text overlay handlers
  const handleAddTextOverlay = () => {
    const newOverlay = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      font: 'Inter',
      size: 32,
      color: '#ffffff',
      position: { x: 50, y: 50 },
      animation: 'fade',
      start_time: currentTime,
      end_time: currentTime + 5,
    };
    updateReelData({
      text_overlays: [...reelData.text_overlays, newOverlay],
    });
    setSelectedElement(newOverlay);
    toast.success('Text overlay added');
  };

  // Element update handler
  const handleElementUpdate = (updatedElement) => {
    if (updatedElement.type === 'text') {
      updateReelData({
        text_overlays: reelData.text_overlays.map(t => 
          t.id === updatedElement.id ? updatedElement : t
        ),
      });
    } else {
      updateReelData({
        clips: reelData.clips.map(c => 
          c.id === updatedElement.id ? updatedElement : c
        ),
      });
    }
    setSelectedElement(updatedElement);
  };

  const handleElementRemove = (elementId) => {
    updateReelData({
      clips: reelData.clips.filter(c => c.id !== elementId),
      text_overlays: reelData.text_overlays.filter(t => t.id !== elementId),
    });
    setSelectedElement(null);
  };

  // Save handler
  const handleSave = () => {
    const totalDuration = reelData.clips.reduce((sum, clip) => sum + (clip.duration || 0), 0);
    saveMutation.mutate({
      ...reelData,
      duration: totalDuration,
    });
  };

  // Export handler
  const handleExport = (settings) => {
    const totalDuration = reelData.clips.reduce((sum, clip) => sum + (clip.duration || 0), 0);
    
    updateReelData({
      export_settings: settings,
      status: 'completed',
      video_url: settings.video_url,
      duration: totalDuration,
    });
    
    saveMutation.mutate({
      ...reelData,
      export_settings: settings,
      status: 'completed',
      video_url: settings.video_url,
      duration: totalDuration,
    });
    
    toast.success('Reel exported successfully!');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <Input
            value={reelData.title}
            onChange={(e) => updateReelData({ title: e.target.value })}
            className="w-64 bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="text-white hover:bg-gray-700"
          >
            <Undo className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="text-white hover:bg-gray-700"
          >
            <Redo className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-gray-600 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddTextOverlay}
            className="text-white hover:bg-gray-700"
          >
            <TypeIcon className="w-4 h-4 mr-2" />
            Add Text
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="text-white hover:bg-gray-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="bg-[#ea00ea] hover:bg-[#ea00ea]/90"
            disabled={reelData.clips.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
          <Tabs defaultValue="media" className="flex-1 flex flex-col">
            <TabsList className="bg-gray-900 mx-4 mt-4 grid grid-cols-4">
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="brand">Brand</TabsTrigger>
            </TabsList>

            <TabsContent value="media" className="flex-1 mt-0 overflow-hidden">
              <MediaPanel
                media={mediaLibrary}
                onMediaAdd={handleMediaAdd}
                onMediaSelect={handleMediaSelect}
              />
            </TabsContent>

            <TabsContent value="audio" className="flex-1 mt-0 overflow-hidden">
              <AudioPanel
                audioTracks={reelData.audio_tracks}
                onAudioTracksUpdate={(tracks) => updateReelData({ audio_tracks: tracks })}
              />
            </TabsContent>

            <TabsContent value="templates" className="flex-1 mt-0 overflow-hidden">
              <TemplatePanel
                templates={[]}
                onTemplateSelect={handleTemplateSelect}
              />
            </TabsContent>

            <TabsContent value="brand" className="flex-1 mt-0 overflow-hidden">
              <BrandPanel
                onColorSelect={(color) => {
                  if (selectedElement?.type === 'text') {
                    handleElementUpdate({ ...selectedElement, color });
                  }
                }}
                onFontSelect={(font) => {
                  if (selectedElement?.type === 'text') {
                    handleElementUpdate({ ...selectedElement, font });
                  }
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Preview */}
        <div className="flex-1 flex flex-col bg-gray-900">
          <div className="flex-1 flex items-center justify-center p-8">
            <ReelPreview
              clips={reelData.clips}
              textOverlays={reelData.text_overlays}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              aspectRatio={reelData.aspect_ratio}
              isPlaying={isPlaying}
              onPlayPause={setIsPlaying}
            />
          </div>

          {/* Timeline */}
          <Timeline
            clips={reelData.clips}
            onClipsReorder={handleClipsReorder}
            onClipSelect={handleClipSelect}
            onClipRemove={handleClipRemove}
            selectedClipId={selectedElement?.id}
            currentTime={currentTime}
          />
        </div>

        {/* Right panel - Inspector */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-hidden">
          <Inspector
            selectedElement={selectedElement}
            onElementUpdate={handleElementUpdate}
            onElementRemove={handleElementRemove}
            aspectRatio={reelData.aspect_ratio}
            onAspectRatioChange={(ratio) => updateReelData({ aspect_ratio: ratio })}
          />
        </div>
      </div>

      {/* Export modal */}
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        reelTitle={reelData.title}
        reelData={reelData}
      />
    </div>
  );
}