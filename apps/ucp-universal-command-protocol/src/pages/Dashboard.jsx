import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Film, LayoutTemplate, Archive, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReelCard from '@/components/reelbuilder/ReelCard';
import DeleteConfirmDialog from '@/components/reelbuilder/DeleteConfirmDialog';
import ShareDialog from '@/components/reelbuilder/ShareDialog';
import { toast } from "sonner";

export default function Dashboard() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('reels');
  const [sortBy, setSortBy] = useState('date');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, reel: null });
  const [shareDialog, setShareDialog] = useState({ open: false, reel: null });

  const queryClient = useQueryClient();

  const { data: reels = [], isLoading } = useQuery({
    queryKey: ['reels'],
    queryFn: () => base44.entities.Reel.list('-created_date'),
  });

  const deleteReelMutation = useMutation({
    mutationFn: (id) => base44.entities.Reel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel deleted');
    },
  });

  const duplicateReelMutation = useMutation({
    mutationFn: (reel) => {
      const { id, created_date, updated_date, created_by, ...reelData } = reel;
      return base44.entities.Reel.create({
        ...reelData,
        title: `${reel.title} (Copy)`,
        status: 'draft',
        archived: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success('Reel duplicated');
    },
  });

  const archiveReelMutation = useMutation({
    mutationFn: ({ id, archived }) => base44.entities.Reel.update(id, { archived }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
      toast.success(variables.archived ? 'Reel archived' : 'Reel unarchived');
    },
  });

  const filteredReels = reels.filter(reel => {
    let matchesView;
    if (view === 'templates') {
      matchesView = reel.is_template;
    } else if (view === 'archived') {
      matchesView = reel.archived && !reel.is_template;
    } else {
      matchesView = !reel.is_template && !reel.archived;
    }
    
    const matchesSearch = reel.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || reel.status === filter;
    return matchesView && matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'duration':
        return (b.duration || 0) - (a.duration || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #ea00ea, #2699fe)',
                boxShadow: '0 0 20px rgba(234, 0, 234, 0.3)',
              }}
            >
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ReelBuilder</h1>
              <p className="text-gray-600">Create stunning social media reels</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search reels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rendering">Rendering</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>

            <Link to={createPageUrl('ReelEditor')}>
              <Button className="w-full md:w-auto bg-[#ea00ea] hover:bg-[#ea00ea]/90">
                <Plus className="w-4 h-4 mr-2" />
                Create New Reel
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={view} onValueChange={setView} className="mb-6">
          <TabsList>
            <TabsTrigger value="reels" className="flex items-center gap-2">
              <Film className="w-4 h-4" />
              My Reels ({reels.filter(r => !r.is_template && !r.archived).length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archived ({reels.filter(r => r.archived && !r.is_template).length})
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Templates ({reels.filter(r => r.is_template).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[9/16] bg-gray-200 rounded-lg mb-3" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredReels.length === 0 ? (
          <div className="text-center py-16">
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(234, 0, 234, 0.1), rgba(38, 153, 254, 0.1))',
              }}
            >
              {view === 'templates' ? (
                <LayoutTemplate className="w-10 h-10 text-[#2699fe]" />
              ) : (
                <Film className="w-10 h-10 text-[#ea00ea]" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {view === 'templates' ? 'templates' : view === 'archived' ? 'archived reels' : 'reels'} yet
            </h3>
            <p className="text-gray-600 mb-6">
              {view === 'templates' 
                ? 'Save a reel as a template to reuse it later'
                : view === 'archived'
                  ? 'Archive reels to keep them organized for future use'
                  : 'Create your first reel to get started'
              }
            </p>
            {view === 'reels' && (
              <Link to={createPageUrl('ReelEditor')}>
                <Button className="bg-[#ea00ea] hover:bg-[#ea00ea]/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Reel
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredReels.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                onEdit={(reel) => {
                  window.location.href = createPageUrl(`ReelEditor?id=${reel.id}`);
                }}
                onDownload={(reel) => {
                  if (reel.video_url) {
                    const a = document.createElement('a');
                    a.href = reel.video_url;
                    a.download = `${reel.title.replace(/[^a-z0-9]/gi, '_')}_${reel.export_settings?.resolution || '1080p'}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    toast.success('Downloading reel...');
                  } else {
                    toast.error('No video available for download');
                  }
                }}
                onDelete={(reel) => setDeleteDialog({ open: true, reel })}
                onDuplicate={(reel) => duplicateReelMutation.mutate(reel)}
                onArchive={(reel) => archiveReelMutation.mutate({ id: reel.id, archived: !reel.archived })}
                onShare={(reel) => setShareDialog({ open: true, reel })}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, reel: null })}
        onConfirm={() => {
          if (deleteDialog.reel) {
            deleteReelMutation.mutate(deleteDialog.reel.id);
            setDeleteDialog({ open: false, reel: null });
          }
        }}
        reelTitle={deleteDialog.reel?.title}
      />

      <ShareDialog
        open={shareDialog.open}
        onClose={() => setShareDialog({ open: false, reel: null })}
        reel={shareDialog.reel}
      />
    </div>
  );
}