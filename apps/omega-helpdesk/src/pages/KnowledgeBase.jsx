import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTenant } from '../components/TenantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Search, BookOpen, Plus, Eye, ThumbsUp, ThumbsDown, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

export default function KnowledgeBase() {
  const { currentTenant, hasPermission } = useTenant();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    is_published: true,
    is_internal: false,
  });

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['kb_articles', currentTenant?.id],
    queryFn: () => base44.entities.KnowledgeBaseArticle.filter({ tenant_id: currentTenant.id }),
    enabled: !!currentTenant?.id,
  });

  const createArticleMutation = useMutation({
    mutationFn: (data) => {
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return base44.entities.KnowledgeBaseArticle.create({
        ...data,
        slug,
        tenant_id: currentTenant.id,
        author_id: base44.auth.me().then(u => u.email)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb_articles'] });
      setDialogOpen(false);
      setNewArticle({ title: '', content: '', excerpt: '', category: '', is_published: true, is_internal: false });
      toast.success('Article created successfully');
    },
  });

  const filteredArticles = articles.filter(article => {
    if (!hasPermission('manage_kb') && !article.is_published) return false;
    if (!hasPermission('manage_kb') && article.is_internal) return false;

    const matchesSearch =
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const handleCreateArticle = (e) => {
    e.preventDefault();
    if (!newArticle.title || !newArticle.content) {
      toast.error('Title and content are required');
      return;
    }
    createArticleMutation.mutate(newArticle);
  };

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {!selectedArticle ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Knowledge Base</h1>
              <p className="text-slate-600 mt-1">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}
              </p>
            </div>

            {hasPermission('manage_kb') && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="tenant-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    New Article
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Article</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateArticle} className="space-y-4">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={newArticle.title}
                        onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Excerpt</Label>
                      <Textarea
                        value={newArticle.excerpt}
                        onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                        rows={2}
                        placeholder="Brief summary..."
                      />
                    </div>
                    <div>
                      <Label>Content * (Markdown supported)</Label>
                      <Textarea
                        value={newArticle.content}
                        onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                        rows={12}
                        required
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={newArticle.category}
                        onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
                        placeholder="e.g., Getting Started"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newArticle.is_published}
                          onChange={(e) => setNewArticle({ ...newArticle, is_published: e.target.checked })}
                        />
                        <span className="text-sm">Published</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newArticle.is_internal}
                          onChange={(e) => setNewArticle({ ...newArticle, is_internal: e.target.checked })}
                        />
                        <span className="text-sm flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Internal Only
                        </span>
                      </label>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createArticleMutation.isPending} className="tenant-primary">
                        Create Article
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search */}
          <Card className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </Card>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Badge key={category} variant="outline" className="cursor-pointer hover:bg-slate-100">
                  {category}
                </Badge>
              ))}
            </div>
          )}

          {/* Articles */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No articles found</h3>
              <p className="text-slate-600">
                {searchQuery ? 'Try a different search term' : 'Create your first article to get started'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArticles.map(article => (
                <Card
                  key={article.id}
                  className="hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      {article.category && (
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        {article.is_internal && (
                          <Lock className="h-4 w-4 text-amber-600" />
                        )}
                        {!article.is_published && (
                          <Badge variant="outline" className="text-xs">Draft</Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 line-clamp-3">
                      {article.excerpt || article.content?.substring(0, 150)}
                    </p>
                    <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {article.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {article.helpful_count || 0}
                        </span>
                      </div>
                      <span>{new Date(article.created_date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => setSelectedArticle(null)}
            className="mb-6"
          >
            ← Back to Articles
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-3">
                {selectedArticle.category && (
                  <Badge variant="outline">{selectedArticle.category}</Badge>
                )}
                {selectedArticle.is_internal && (
                  <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Internal
                  </Badge>
                )}
              </div>
              <CardTitle className="text-3xl">{selectedArticle.title}</CardTitle>
              <p className="text-slate-600 mt-2">{selectedArticle.excerpt}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                <span>Updated {new Date(selectedArticle.updated_date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {selectedArticle.view_count || 0} views
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ReactMarkdown className="prose prose-slate max-w-none">
                {selectedArticle.content}
              </ReactMarkdown>

              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-slate-600 mb-3">Was this article helpful?</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Yes ({selectedArticle.helpful_count || 0})
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    No ({selectedArticle.not_helpful_count || 0})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}