import React from 'react';
import { Search, Filter, Grid3X3, List, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'communication', label: 'Communication' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'development', label: 'Development' },
  { value: 'other', label: 'Other' },
];

export default function SearchFilter({ 
  searchQuery, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  showFavorites,
  onShowFavoritesChange,
  viewMode,
  onViewModeChange 
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
      {/* Search */}
      <div className="relative flex-1 max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search applications..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white border-slate-200 focus:border-slate-300"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Favorites Toggle */}
        <Button
          variant={showFavorites ? "default" : "outline"}
          size="sm"
          onClick={() => onShowFavoritesChange(!showFavorites)}
          className={showFavorites ? "bg-amber-500 hover:bg-amber-600" : ""}
        >
          <Star className={`w-4 h-4 mr-1 ${showFavorites ? 'fill-white' : ''}`} />
          Favorites
        </Button>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              {categories.find(c => c.value === selectedCategory)?.label || 'Category'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((cat) => (
              <DropdownMenuItem
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={selectedCategory === cat.value ? 'bg-slate-100' : ''}
              >
                {cat.label}
                {selectedCategory === cat.value && (
                  <Badge variant="secondary" className="ml-auto">Active</Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className={`rounded-none ${viewMode === 'grid' ? 'bg-slate-100' : ''}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange('list')}
            className={`rounded-none ${viewMode === 'list' ? 'bg-slate-100' : ''}`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}