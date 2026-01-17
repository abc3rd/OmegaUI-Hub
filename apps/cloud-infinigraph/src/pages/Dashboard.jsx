import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Plus,
  Search,
  LayoutTemplate,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Clock,
  Grid3X3,
  List,
  Star,
  Filter,
  SortAsc,
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Image,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('projects');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.filter({ is_template: false }, '-updated_date'),
  });

  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => base44.entities.Template.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Project.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
      setDeleteDialogOpen(false);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (project) => {
      const { id, created_date, updated_date, ...rest } = project;
      return base44.entities.Project.create({
        ...rest,
        name: `${project.name} (Copy)`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project duplicated');
    },
  });

  const filteredProjects = projects.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = templates.filter(t =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryIcons = {
    timeline: Clock,
    comparison: BarChart3,
    statistics: TrendingUp,
    process: FileText,
    list: List,
    chart: BarChart3,
    infographic: LayoutTemplate,
    custom: Grid3X3,
  };

  const ProjectCard = ({ project }) => (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200">
      <Link to={createPageUrl(`Editor?id=${project.id}`)}>
        <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt={project.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: project.background_color || '#f8fafc' }}
            >
              <LayoutTemplate className="h-12 w-12 text-slate-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {project.updated_date ? format(new Date(project.updated_date), 'MMM d, yyyy') : 'No date'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl(`Editor?id=${project.id}`)} className="flex items-center">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateMutation.mutate(project)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setProjectToDelete(project);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2 mt-3">
          <Badge variant="secondary" className="text-xs capitalize">
            {project.category || 'custom'}
          </Badge>
          <Badge
            variant={project.status === 'published' ? 'default' : 'outline'}
            className="text-xs"
          >
            {project.status || 'draft'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  const TemplateCard = ({ template }) => {
    const CategoryIcon = categoryIcons[template.category] || LayoutTemplate;
    
    return (
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200 cursor-pointer">
        <Link to={createPageUrl(`Editor?template=${template.id}`)}>
          <div className="aspect-[4/5] bg-slate-100 relative overflow-hidden">
            {template.thumbnail_url ? (
              <img
                src={template.thumbnail_url}
                alt={template.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: template.background_color || '#f8fafc' }}
              >
                <CategoryIcon className="h-12 w-12 text-slate-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Use Template
              </span>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 truncate">{template.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs capitalize">
                {template.category}
              </Badge>
              {template.is_premium && (
                <Badge className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <LayoutTemplate className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Infographic Studio</h1>
                <p className="text-xs text-slate-500">Create stunning visuals</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Templates')}>
                <Button variant="outline" className="gap-2">
                  <LayoutTemplate className="h-4 w-4" />
                  Manage Templates
                </Button>
              </Link>
              <Link to={createPageUrl('Assets')}>
                <Button variant="outline" className="gap-2">
                  <Image className="h-4 w-4" />
                  Assets
                </Button>
              </Link>
              <Link to={createPageUrl('Settings')}>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button onClick={() => setShowTemplateModal(true)} className="gap-2 bg-slate-900 hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="projects" className="gap-2">
                <FolderOpen className="h-4 w-4" />
                My Projects
              </TabsTrigger>
              <TabsTrigger value="templates" className="gap-2">
                <LayoutTemplate className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64 h-10"
                />
              </div>
              
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-10 w-10 rounded-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-10 w-10 rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="projects">
            {projectsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-slate-200" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                    <LayoutTemplate className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Create Your First Infographic</h3>
                  <p className="text-slate-500 mb-8">Design stunning visuals with our drag-and-drop editor. Start from scratch or choose a template.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to={createPageUrl('Editor')}>
                      <Button className="gap-2 w-full sm:w-auto bg-slate-900 hover:bg-slate-800">
                        <Plus className="h-4 w-4" />
                        Blank Canvas
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={() => setShowTemplateModal(true)} className="gap-2">
                      <LayoutTemplate className="h-4 w-4" />
                      Browse Templates
                    </Button>
                  </div>
                </div>

                {/* Quick start tips */}
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
                  <div className="bg-white rounded-xl p-5 border border-slate-200">
                    <div className="w-10 h-10 mb-3 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <h4 className="font-medium text-slate-800 mb-1">Data Visualization</h4>
                    <p className="text-sm text-slate-500">Add charts, graphs, and stats to bring your data to life.</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-slate-200">
                    <div className="w-10 h-10 mb-3 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-slate-800 mb-1">Icons & Shapes</h4>
                    <p className="text-sm text-slate-500">Use hundreds of icons and shapes to enhance your designs.</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-slate-200">
                    <div className="w-10 h-10 mb-3 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-slate-800 mb-1">Export Anywhere</h4>
                    <p className="text-sm text-slate-500">Download as PNG, SVG, or PDF for any use case.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                : "space-y-3"
              }>
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                {['all', 'timeline', 'comparison', 'statistics', 'process', 'chart', 'infographic'].map((cat) => (
                  <Button
                    key={cat}
                    variant="outline"
                    size="sm"
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {templatesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-[4/5] bg-slate-200" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-16">
                <LayoutTemplate className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No templates available</h3>
                <p className="text-slate-500">Templates will appear here once added</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* New Project Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Start a new project</DialogTitle>
            <DialogDescription>
              Choose a template or start from scratch
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="grid grid-cols-3 gap-4 py-4">
              <Link
                to={createPageUrl('Editor')}
                onClick={() => setShowTemplateModal(false)}
                className="aspect-[4/5] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-slate-400 hover:bg-slate-50 transition-all"
              >
                <Plus className="h-10 w-10 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">Blank Canvas</span>
              </Link>
              
              {templates.slice(0, 8).map((template) => (
                <Link
                  key={template.id}
                  to={createPageUrl(`Editor?template=${template.id}`)}
                  onClick={() => setShowTemplateModal(false)}
                  className="aspect-[4/5] rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all group"
                >
                  <div
                    className="w-full h-full flex items-center justify-center relative"
                    style={{ backgroundColor: template.background_color || '#f8fafc' }}
                  >
                    {template.thumbnail_url ? (
                      <img src={template.thumbnail_url} alt={template.name} className="w-full h-full object-cover" />
                    ) : (
                      <LayoutTemplate className="h-8 w-8 text-slate-300" />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100">
                        {template.name}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => projectToDelete && deleteMutation.mutate(projectToDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}