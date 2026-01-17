import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Link as LinkIcon, FileText, Star, Search, 
  ExternalLink, Plus, ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const categoryColors = {
  patent: 'bg-purple-100 text-purple-800',
  criminal: 'bg-red-100 text-red-800',
  corporate: 'bg-blue-100 text-blue-800',
  litigation: 'bg-orange-100 text-orange-800',
  contract: 'bg-green-100 text-green-800',
  general: 'bg-gray-100 text-gray-800',
  template: 'bg-yellow-100 text-yellow-800',
  research: 'bg-indigo-100 text-indigo-800',
  tool: 'bg-pink-100 text-pink-800',
};

const defaultResources = [
  { title: 'USPTO Homepage', category: 'patent', resource_type: 'link', url: 'https://www.uspto.gov', description: 'Official U.S. Patent and Trademark Office' },
  { title: 'Google Patents', category: 'patent', resource_type: 'tool', url: 'https://patents.google.com', description: 'Free patent search tool' },
  { title: 'Florida Bar', category: 'general', resource_type: 'link', url: 'https://www.floridabar.org', description: 'The Florida Bar official website' },
  { title: 'Westlaw', category: 'research', resource_type: 'tool', url: 'https://www.westlaw.com', description: 'Legal research database' },
  { title: 'Florida Statutes', category: 'litigation', resource_type: 'link', url: 'http://www.leg.state.fl.us/statutes/', description: 'Official Florida Statutes online' },
];

export default function Resources() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list('-created_date'),
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, is_favorite }) => 
      base44.entities.Resource.update(id, { is_favorite: !is_favorite }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['resources'] })
  });

  const allResources = resources.length > 0 ? resources : defaultResources;
  
  const filteredResources = allResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(allResources.map(r => r.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">Legal Resources</h1>
            <p className="text-gray-600">Essential resources, tools, and references</p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                    size="sm"
                  >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, idx) => (
            <Card key={resource.id || idx} className="shadow-lg border-0 hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={categoryColors[resource.category] || 'bg-gray-100'}>
                    {resource.category}
                  </Badge>
                  {resource.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavoriteMutation.mutate({ 
                        id: resource.id, 
                        is_favorite: resource.is_favorite 
                      })}
                    >
                      <Star className={`w-4 h-4 ${resource.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </Button>
                  )}
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{resource.description}</p>

                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Resource
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Resources Found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}