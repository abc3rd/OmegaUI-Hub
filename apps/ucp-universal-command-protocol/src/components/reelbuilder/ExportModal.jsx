import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, CheckCircle2, Film, Instagram, Youtube, Share2, Image as ImageIcon } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ExportModal({ 
  open, 
  onClose, 
  onExport,
  reelTitle = 'Untitled Reel',
  reelData
}) {
  const [exportMode, setExportMode] = useState('platform'); // 'platform' or 'custom'
  const [selectedPlatform, setSelectedPlatform] = useState('instagram_reels');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [resolution, setResolution] = useState('1080p');
  const [fps, setFps] = useState('30');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderComplete, setRenderComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  const platformPresets = {
    instagram_reels: {
      name: 'Instagram Reels',
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: '30',
      maxDuration: 90,
      maxFileSize: '4GB',
      icon: Instagram,
      color: '#E4405F'
    },
    tiktok: {
      name: 'TikTok',
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: '30',
      maxDuration: 180,
      maxFileSize: '287MB',
      icon: Film,
      color: '#000000'
    },
    instagram_feed: {
      name: 'Instagram Feed',
      aspectRatio: '1:1',
      resolution: '1080p',
      fps: '30',
      maxDuration: 60,
      maxFileSize: '4GB',
      icon: Instagram,
      color: '#E4405F'
    },
    youtube_shorts: {
      name: 'YouTube Shorts',
      aspectRatio: '9:16',
      resolution: '1080p',
      fps: '30',
      maxDuration: 60,
      maxFileSize: '256MB',
      icon: Youtube,
      color: '#FF0000'
    },
    youtube: {
      name: 'YouTube',
      aspectRatio: '16:9',
      resolution: '1080p',
      fps: '30',
      maxDuration: null,
      maxFileSize: '256GB',
      icon: Youtube,
      color: '#FF0000'
    },
    linkedin: {
      name: 'LinkedIn',
      aspectRatio: '1:1',
      resolution: '1080p',
      fps: '30',
      maxDuration: 600,
      maxFileSize: '5GB',
      icon: Share2,
      color: '#0A66C2'
    }
  };

  const generateThumbnail = () => {
    // Generate a simple thumbnail placeholder
    // In production, this would capture a frame from the video
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const [w, h] = aspectRatio.split(':').map(Number);
    canvas.width = w * 100;
    canvas.height = h * 100;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#ea00ea');
    gradient.addColorStop(1, '#2699fe');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add title text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(reelTitle, canvas.width / 2, canvas.height / 2);
    
    return canvas.toDataURL('image/png');
  };

  const handleRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderComplete(false);

    const currentSettings = exportMode === 'platform' 
      ? platformPresets[selectedPlatform]
      : { aspectRatio, resolution, fps };

    // Simulate render progress
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);

    // Generate downloadable file and thumbnail
    setTimeout(() => {
      clearInterval(interval);
      setRenderProgress(100);
      
      // Generate thumbnail
      const thumbnail = generateThumbnail();
      setThumbnailUrl(thumbnail);
      
      // Create export data
      const reelJson = JSON.stringify({
        ...reelData,
        title: reelTitle,
        aspect_ratio: currentSettings.aspectRatio,
        export_settings: { 
          resolution: currentSettings.resolution, 
          fps: parseInt(currentSettings.fps),
          platform: exportMode === 'platform' ? selectedPlatform : 'custom'
        },
        thumbnail_url: thumbnail,
        exported_date: new Date().toISOString()
      }, null, 2);
      
      const blob = new Blob([reelJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      setIsRendering(false);
      setRenderComplete(true);
      
      // Call export callback
      onExport?.({
        resolution: currentSettings.resolution,
        fps: parseInt(currentSettings.fps),
        aspect_ratio: currentSettings.aspectRatio,
        format: 'mp4',
        video_url: url,
        thumbnail_url: thumbnail,
        platform: exportMode === 'platform' ? selectedPlatform : 'custom'
      });
    }, 4000);
  };

  const handleClose = () => {
    setIsRendering(false);
    setRenderProgress(0);
    setRenderComplete(false);
    setDownloadUrl(null);
    setThumbnailUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#ea00ea]" />
            Export Reel
          </DialogTitle>
          <DialogDescription>
            Configure export settings for "{reelTitle}"
          </DialogDescription>
        </DialogHeader>

        {!renderComplete ? (
          <Tabs value={exportMode} onValueChange={setExportMode} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="platform">Platform Presets</TabsTrigger>
              <TabsTrigger value="custom">Custom Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="platform" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(platformPresets).map(([key, preset]) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedPlatform(key);
                        setAspectRatio(preset.aspectRatio);
                        setResolution(preset.resolution);
                        setFps(preset.fps);
                      }}
                      disabled={isRendering}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPlatform === key
                          ? 'border-[#ea00ea] bg-[#ea00ea]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${preset.color}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: preset.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm mb-1">{preset.name}</p>
                          <div className="space-y-0.5">
                            <Badge variant="secondary" className="text-xs">
                              {preset.aspectRatio}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {preset.resolution} • {preset.fps} FPS
                            </p>
                            {preset.maxDuration && (
                              <p className="text-xs text-gray-500">
                                Max: {preset.maxDuration}s
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <div>
                <Label className="text-sm">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={isRendering}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9:16">9:16 (Vertical - Reels/Stories)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square - Instagram Feed)</SelectItem>
                    <SelectItem value="16:9">16:9 (Landscape - YouTube)</SelectItem>
                    <SelectItem value="4:5">4:5 (Portrait - Instagram)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Resolution</Label>
                <Select value={resolution} onValueChange={setResolution} disabled={isRendering}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p (HD)</SelectItem>
                    <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Frame Rate</Label>
                <Select value={fps} onValueChange={setFps} disabled={isRendering}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 FPS (Cinematic)</SelectItem>
                    <SelectItem value="30">30 FPS (Standard)</SelectItem>
                    <SelectItem value="60">60 FPS (High Frame Rate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Format</Label>
                <div className="mt-2 px-3 py-2 rounded-md bg-gray-50 border text-sm text-gray-700">
                  MP4 (H.264)
                </div>
              </div>
            </TabsContent>

            {isRendering && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Rendering video and generating thumbnail...</span>
                  <span className="font-medium text-[#ea00ea]">{renderProgress}%</span>
                </div>
                <Progress value={renderProgress} className="h-2" />
              </div>
            )}
          </Tabs>
        ) : (
          <div className="py-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-1">Export Complete!</h4>
                <p className="text-sm text-gray-600">
                  Your reel and thumbnail are ready
                </p>
              </div>
            </div>

            {thumbnailUrl && (
              <div className="mb-4">
                <Label className="text-sm mb-2 block">Generated Thumbnail</Label>
                <div className="relative inline-block">
                  <img 
                    src={thumbnailUrl} 
                    alt="Thumbnail" 
                    className="rounded-lg border-2 border-gray-200 max-w-[200px]"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Auto-generated
                  </Badge>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Aspect Ratio:</span>
                <span className="font-medium">{aspectRatio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resolution:</span>
                <span className="font-medium">{resolution}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frame Rate:</span>
                <span className="font-medium">{fps} FPS</span>
              </div>
              {exportMode === 'platform' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span className="font-medium">{platformPresets[selectedPlatform].name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {!renderComplete ? (
            <>
              <Button variant="outline" onClick={handleClose} disabled={isRendering}>
                Cancel
              </Button>
              <Button 
                onClick={handleRender} 
                disabled={isRendering}
                className="bg-[#ea00ea] hover:bg-[#ea00ea]/90"
              >
                {isRendering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Rendering...
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4 mr-2" />
                    Render Reel
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = downloadUrl;
                  a.download = `${reelTitle.replace(/[^a-z0-9]/gi, '_')}_${aspectRatio.replace(':', 'x')}_${resolution}_${fps}fps.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="bg-[#4bce2a] hover:bg-[#4bce2a]/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Reel
              </Button>
              {thumbnailUrl && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = thumbnailUrl;
                    a.download = `${reelTitle.replace(/[^a-z0-9]/gi, '_')}_thumbnail.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Download Thumbnail
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}