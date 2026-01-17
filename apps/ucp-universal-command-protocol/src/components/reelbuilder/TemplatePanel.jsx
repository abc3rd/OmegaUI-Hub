import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';

const defaultTemplates = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch',
    thumbnail: null,
    aspectRatio: '9:16',
  },
  {
    id: 'intro-outro',
    name: 'Intro + Outro',
    description: 'Professional intro and outro',
    thumbnail: null,
    aspectRatio: '9:16',
  },
  {
    id: 'split-screen',
    name: 'Split Screen',
    description: 'Two videos side by side',
    thumbnail: null,
    aspectRatio: '9:16',
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Customer testimonial style',
    thumbnail: null,
    aspectRatio: '9:16',
  },
  {
    id: 'product-showcase',
    name: 'Product Showcase',
    description: 'Highlight product features',
    thumbnail: null,
    aspectRatio: '9:16',
  },
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'Big text announcement style',
    thumbnail: null,
    aspectRatio: '9:16',
  },
];

export default function TemplatePanel({ templates = [], onTemplateSelect }) {
  const [searchTerm, setSearchTerm] = useState('');

  const allTemplates = [...defaultTemplates, ...templates];
  const filteredTemplates = allTemplates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Templates grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => onTemplateSelect(template)}
              className="relative rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-[#2699fe] transition-all group"
            >
              {/* Thumbnail */}
              <div className="aspect-[9/16] bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                {template.thumbnail ? (
                  <img 
                    src={template.thumbnail} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Sparkles className="w-8 h-8 mb-2" />
                    <span className="text-xs">{template.aspectRatio}</span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-[#2699fe]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    size="sm"
                    className="bg-[#2699fe] hover:bg-[#2699fe]/90"
                  >
                    Use Template
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 bg-white">
                <h4 className="font-semibold text-sm text-gray-900">
                  {template.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}