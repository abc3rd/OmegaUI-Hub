import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Palette, Type, Image } from 'lucide-react';
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const brandColors = [
  { name: 'Magenta Neon', value: '#ea00ea' },
  { name: 'Electric Blue', value: '#2699fe' },
  { name: 'Tech Green', value: '#4bce2a' },
  { name: 'Graphite Gray', value: '#3c3c3c' },
  { name: 'Bronze Accent', value: '#c4653a' },
];

const brandFonts = [
  'Inter',
  'Poppins',
  'Montserrat',
  'Roboto',
  'Open Sans',
  'Outfit',
  'Space Grotesk',
];

export default function BrandPanel({ onColorSelect, onFontSelect, onLogoUpload }) {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setLogoUrl(file_url);
      onLogoUpload?.(file_url);
      toast.success('Logo uploaded');
    } catch (error) {
      toast.error('Failed to upload logo');
      console.error(error);
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Brand Colors */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-gray-500" />
          <Label className="font-semibold">Brand Colors</Label>
        </div>
        <div className="space-y-2">
          {brandColors.map((color) => (
            <div
              key={color.value}
              onClick={() => onColorSelect?.(color.value)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
            >
              <div
                className="w-10 h-10 rounded-lg border-2 border-gray-200 group-hover:border-gray-400 transition-colors"
                style={{ background: color.value }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{color.name}</p>
                <p className="text-xs text-gray-500">{color.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Fonts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-gray-500" />
          <Label className="font-semibold">Brand Fonts</Label>
        </div>
        <div className="space-y-1">
          {brandFonts.map((font) => (
            <button
              key={font}
              onClick={() => onFontSelect?.(font)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ fontFamily: font }}
            >
              <span className="text-sm text-gray-900">{font}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4 text-gray-500" />
          <Label className="font-semibold">Brand Logo</Label>
        </div>
        
        {logoUrl ? (
          <div className="relative">
            <div className="aspect-video rounded-lg border-2 border-gray-200 overflow-hidden bg-white p-4 flex items-center justify-center">
              <img 
                src={logoUrl} 
                alt="Brand logo"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLogoUrl(null);
                onLogoUpload?.(null);
              }}
              className="w-full mt-2"
            >
              Remove Logo
            </Button>
          </div>
        ) : (
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              disabled={uploadingLogo}
            />
            <div className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#2699fe] hover:bg-gray-50 transition-all">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG or SVG</p>
            </div>
          </label>
        )}
      </div>

      {/* Custom Color Picker */}
      <div>
        <Label className="font-semibold mb-2 block">Custom Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            className="w-16 h-10 p-1 cursor-pointer"
            onChange={(e) => onColorSelect?.(e.target.value)}
          />
          <Input
            type="text"
            placeholder="#000000"
            className="flex-1"
            onChange={(e) => {
              if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                onColorSelect?.(e.target.value);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}