import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, Copy, CheckCircle2, Instagram, ExternalLink } from 'lucide-react';
import { toast } from "sonner";

export default function ShareDialog({ open, onClose, reel }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = reel?.video_url || window.location.href;
  const embedCode = `<iframe src="${shareUrl}" width="360" height="640" frameborder="0" allowfullscreen></iframe>`;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    { 
      name: 'Instagram Reels', 
      icon: Instagram, 
      aspectRatio: '9:16', 
      color: '#E4405F',
      shareUrl: `https://www.instagram.com/create/story`,
      description: 'Upload via Instagram app'
    },
    { 
      name: 'TikTok', 
      icon: ExternalLink, 
      aspectRatio: '9:16', 
      color: '#000000',
      shareUrl: `https://www.tiktok.com/upload`,
      description: 'Open TikTok upload page'
    },
    { 
      name: 'LinkedIn', 
      icon: ExternalLink, 
      aspectRatio: '1:1', 
      color: '#0A66C2',
      shareUrl: `https://www.linkedin.com/feed/`,
      description: 'Share on LinkedIn feed'
    },
    { 
      name: 'YouTube Shorts', 
      icon: ExternalLink, 
      aspectRatio: '9:16', 
      color: '#FF0000',
      shareUrl: `https://studio.youtube.com/channel/UC/videos/upload?filter=%5B%5D&sort=%7B%22columnType%22%3A%22date%22%2C%22sortOrder%22%3A%22DESCENDING%22%7D`,
      description: 'Upload to YouTube Studio'
    },
    { 
      name: 'Facebook', 
      icon: ExternalLink, 
      aspectRatio: '1:1', 
      color: '#1877F2',
      shareUrl: `https://www.facebook.com/`,
      description: 'Post to Facebook'
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#2699fe]" />
            Share Reel
          </DialogTitle>
          <DialogDescription>
            Share "{reel?.title}" on social media or embed it on your website
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="platforms" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="platforms">Platforms</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms" className="space-y-3">
            <p className="text-sm text-gray-600">
              Optimal formats for each platform
            </p>
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${platform.color}15` }}
                  >
                    <platform.icon className="w-5 h-5" style={{ color: platform.color }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{platform.name}</p>
                    <p className="text-xs text-gray-500">{platform.aspectRatio} aspect ratio</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    window.open(platform.shareUrl, '_blank');
                    toast.success(`Opening ${platform.name}...`);
                  }}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="link" className="space-y-4">
            <div>
              <Label className="text-sm">Share Link</Label>
              <div className="flex gap-2 mt-2">
                <Input value={shareUrl} readOnly className="flex-1" />
                <Button
                  variant="outline"
                  onClick={() => handleCopy(shareUrl, 'Link')}
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Social Media Caption</h4>
              <p className="text-xs text-gray-600 mb-3">
                {reel?.title} 🎬
                <br />
                Created with ReelBuilder
                <br />
                #SocialMedia #VideoMarketing #Content
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(`${reel?.title} 🎬\nCreated with ReelBuilder\n#SocialMedia #VideoMarketing #Content`, 'Caption')}
              >
                Copy Caption
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <div>
              <Label className="text-sm">Embed Code</Label>
              <textarea
                value={embedCode}
                readOnly
                className="w-full mt-2 p-3 rounded-md border text-xs font-mono bg-gray-50 h-24"
              />
              <Button
                size="sm"
                className="mt-2"
                variant="outline"
                onClick={() => handleCopy(embedCode, 'Embed code')}
              >
                Copy Code
              </Button>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>💡 Paste this code into your website's HTML to embed the reel</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}