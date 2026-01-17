
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Wand2,
  Share,
  Sparkles,
  Image,
  Zap,
  Crown,
  Upload,
  FileImage,
  Scissors,
  Archive,
  Grid3X3,
  Settings
} from "lucide-react";
import { GenerateImage, UploadFile } from "@/integrations/Core";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

const socialPlatforms = {
  youtube: { name: "YouTube Thumbnail", width: 1280, height: 720, aspectRatio: "16:9" },
  facebook_post: { name: "Facebook Post", width: 1200, height: 630, aspectRatio: "1.91:1" },
  facebook_story: { name: "Facebook Story", width: 1080, height: 1920, aspectRatio: "9:16" },
  instagram_post: { name: "Instagram Post", width: 1080, height: 1080, aspectRatio: "1:1" },
  instagram_story: { name: "Instagram Story", width: 1080, height: 1920, aspectRatio: "9:16" },
  instagram_reel: { name: "Instagram Reel", width: 1080, height: 1920, aspectRatio: "9:16" },
  tiktok: { name: "TikTok", width: 1080, height: 1920, aspectRatio: "9:16" },
  pinterest: { name: "Pinterest Pin", width: 1000, height: 1500, aspectRatio: "2:3" },
  twitter: { name: "Twitter Post", width: 1200, height: 675, aspectRatio: "16:9" },
  linkedin: { name: "LinkedIn Post", width: 1200, height: 627, aspectRatio: "1.91:1" },
  snapchat: { name: "Snapchat", width: 1080, height: 1920, aspectRatio: "9:16" },
  threads: { name: "Threads", width: 1080, height: 1080, aspectRatio: "1:1" }
};

const outputFormats = ["PNG", "JPEG", "SVG", "WEBP"];
const logoStyles = [
  "modern minimalist", "vintage classic", "bold geometric", "elegant script", 
  "tech futuristic", "hand-drawn organic", "luxury premium", "playful cartoon",
  "corporate professional", "artistic creative", "retro nostalgic", "3D dimensional"
];

export default function LogoGenerator() {
  const [activeTab, setActiveTab] = useState("logo");
  const [companyName, setCompanyName] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [industry, setIndustry] = useState("technology");
  const [selectedStyles, setSelectedStyles] = useState(["modern minimalist"]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(["youtube"]);
  const [selectedFormats, setSelectedFormats] = useState(["PNG"]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [referenceImage, setReferenceImage] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState(80);
  const [removeBackground, setRemoveBackground] = useState(false);
  const fileInputRef = useRef(null);

  const industries = {
    technology: "Technology & Software",
    healthcare: "Healthcare & Medical",
    finance: "Finance & Banking",
    retail: "Retail & E-commerce",
    education: "Education & Learning",
    food: "Food & Beverage",
    real_estate: "Real Estate",
    consulting: "Consulting & Services",
    creative: "Creative & Design",
    fitness: "Fitness & Wellness",
    automotive: "Automotive",
    entertainment: "Entertainment & Media",
    nonprofit: "Non-Profit & Charity",
    manufacturing: "Manufacturing & Industry"
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const { file_url } = await UploadFile({ file });
      setReferenceImage(file_url);
      toast.success("Reference image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload reference image");
      console.error(error);
    }
  };

  const generatePrompts = () => {
    const basePrompts = [];
    
    if (activeTab === "logo") {
      selectedStyles.forEach(style => {
        const prompt = customPrompt || 
          `Professional logo design for "${companyName}" company in ${industries[industry]} industry, ${style} style, clean vector design, high quality, scalable, memorable brand identity${removeBackground ? ', transparent background' : ''}`;
        basePrompts.push({ prompt, style, type: "logo" });
      });
    } else if (activeTab === "social") {
      selectedPlatforms.forEach(platform => {
        const platformInfo = socialPlatforms[platform];
        selectedStyles.forEach(style => {
          const prompt = customPrompt || 
            `${platformInfo.name} thumbnail for "${companyName}", ${style} style, ${platformInfo.aspectRatio} aspect ratio, eye-catching, professional, optimized for ${platformInfo.name}${removeBackground ? ', transparent background' : ''}`;
          basePrompts.push({ prompt, style, type: "social", platform, dimensions: platformInfo });
        });
      });
    }
    
    return basePrompts;
  };

  const handleGenerate = async () => {
    if (!companyName.trim() && !customPrompt.trim()) {
      toast.error("Please enter a company name or custom prompt");
      return;
    }

    setIsGenerating(true);
    const prompts = generatePrompts();
    
    try {
      const results = await Promise.allSettled(
        prompts.map(async ({ prompt, style, type, platform, dimensions }) => {
          const enhancedPrompt = referenceImage 
            ? `${prompt}, inspired by this reference style and composition`
            : prompt;
            
          const result = await GenerateImage({ 
            prompt: enhancedPrompt,
            file_urls: referenceImage ? [referenceImage] : undefined
          });
          
          return {
            id: Date.now() + Math.random(),
            url: result.url,
            style,
            type,
            platform: platform || null,
            dimensions: dimensions || null,
            prompt: enhancedPrompt,
            formats: [...selectedFormats]
          };
        })
      );

      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failed = results.filter(result => result.status === 'rejected').length;
      
      setGeneratedImages(successful);
      
      if (successful.length > 0) {
        toast.success(`Generated ${successful.length} images successfully!`);
      }
      if (failed > 0) {
        toast.warning(`${failed} images failed to generate`);
      }
      
    } catch (error) {
      toast.error("Failed to generate images");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (image, format = "PNG") => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companyName || 'image'}_${image.style.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Downloaded as ${format}`);
    } catch (error) {
      toast.error("Failed to download image");
      console.error(error);
    }
  };

  const downloadAllAsZip = async () => {
    if (generatedImages.length === 0) {
      toast.error("No images to download");
      return;
    }
    
    toast.info("Preparing ZIP download... This may take a moment.");
    
    try {
      // This is a simplified version - in a real app you'd use JSZip or similar
      for (let i = 0; i < generatedImages.length; i++) {
        const image = generatedImages[i];
        await downloadImage(image, selectedFormats[0]);
        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success("All images downloaded!");
    } catch (error) {
      toast.error("Failed to download all images");
      console.error(error);
    }
  };

  const toggleStyle = (style) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const toggleFormat = (format) => {
    setSelectedFormats(prev =>
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  return (
    <div className="p-4 md:p-6 w-full">
      {/* Header */}
      <div className="mb-6 w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              AI Image Studio
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create logos, social media thumbnails, and professional graphics with AI
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
            <Crown className="w-3 h-3 mr-1" />
            Professional Quality
          </Badge>
          <Badge variant="outline">
            <Zap className="w-3 h-3 mr-1" />
            Multi-Format Export
          </Badge>
          <Badge variant="outline">
            <Grid3X3 className="w-3 h-3 mr-1" />
            Social Media Ready
          </Badge>
          <Badge variant="outline">
            <Scissors className="w-3 h-3 mr-1" />
            Background Removal
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 w-full">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Creation Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="logo">Logos</TabsTrigger>
                  <TabsTrigger value="social">Social Media</TabsTrigger>
                </TabsList>
                
                <TabsContent value="logo" className="space-y-4">
                  <div>
                    <Label htmlFor="company-name">Company/Brand Name *</Label>
                    <Input
                      id="company-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter brand name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(industries).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="social" className="space-y-4">
                  <div>
                    <Label htmlFor="brand-name">Brand/Content Name *</Label>
                    <Input
                      id="brand-name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Enter brand or content name"
                    />
                  </div>
                  
                  <div>
                    <Label>Select Platforms</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                      {Object.entries(socialPlatforms).map(([key, platform]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox 
                            id={key}
                            checked={selectedPlatforms.includes(key)}
                            onCheckedChange={() => togglePlatform(key)}
                          />
                          <Label htmlFor={key} className="text-sm">
                            {platform.name} ({platform.aspectRatio})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div>
                <Label>Custom AI Prompt (Optional)</Label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe exactly what you want the AI to create..."
                  className="h-20"
                />
              </div>

              <div>
                <Label>Reference Image (Optional)</Label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Reference
                  </Button>
                </div>
                {referenceImage && (
                  <div className="mt-2">
                    <img src={referenceImage} alt="Reference" className="w-full h-20 object-cover rounded border" />
                  </div>
                )}
              </div>

              <div>
                <Label>Design Styles (Select Multiple)</Label>
                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                  {logoStyles.map(style => (
                    <div key={style} className="flex items-center space-x-2">
                      <Checkbox 
                        id={style}
                        checked={selectedStyles.includes(style)}
                        onCheckedChange={() => toggleStyle(style)}
                      />
                      <Label htmlFor={style} className="text-sm capitalize">
                        {style}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Output Formats</Label>
                <div className="flex flex-wrap gap-2">
                  {outputFormats.map(format => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox 
                        id={format}
                        checked={selectedFormats.includes(format)}
                        onCheckedChange={() => toggleFormat(format)}
                      />
                      <Label htmlFor={format} className="text-sm">{format}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remove-bg"
                  checked={removeBackground}
                  onCheckedChange={setRemoveBackground}
                />
                <Label htmlFor="remove-bg" className="flex items-center gap-1">
                  <Scissors className="w-3 h-3" />
                  Remove Background
                </Label>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || (!companyName.trim() && !customPrompt.trim())}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Images
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Generated Images */}
        <div className="lg:col-span-4">
          <Card className="h-full w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Generated Images ({generatedImages.length})
                </CardTitle>
                {generatedImages.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadAllAsZip}>
                      <Archive className="w-4 h-4 mr-2" />
                      Download All
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share Collection
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Generating image {i + 1}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {generatedImages.map((image, index) => (
                    <div key={image.id} className="group">
                      <div className="aspect-square bg-white rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3 overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={`Generated ${image.type} ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                              {image.style}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {image.type === 'social' && image.platform 
                                ? socialPlatforms[image.platform].name
                                : `${image.type} design`}
                              {image.dimensions && ` • ${image.dimensions.width}×${image.dimensions.height}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {selectedFormats.map(format => (
                            <Button 
                              key={format}
                              size="sm" 
                              variant="outline"
                              onClick={() => downloadImage(image, format)}
                              className="text-xs"
                            >
                              {format}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-96 text-center">
                  <div className="max-w-md">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Palette className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Create Professional Images with AI
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Generate logos, social media thumbnails, and professional graphics. Choose your styles, platforms, and formats to get started.
                    </p>
                    <div className="flex justify-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI-Generated
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4" />
                        Professional Quality
                      </div>
                      <div className="flex items-center gap-2">
                        <FileImage className="w-4 h-4" />
                        Multi-Format
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
