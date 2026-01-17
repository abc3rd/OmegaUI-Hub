import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, ThumbsUp, ThumbsDown, ArrowLeft, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function PublicKnowledgeBase() {
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlug = urlParams.get('tenant') || 'ucrash';
  const articleSlug = urlParams.get('article');
  
  const [tenant, setTenant] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadTenant();
  }, [tenantSlug]);

  const loadTenant = async () => {
    const tenants = await base44.entities.Tenant.filter({ slug: tenantSlug });
    if (tenants.length > 0) {
      setTenant(tenants[0]);
    }
  };

  const { data: articles = [] } = useQuery({
    queryKey: ['kb-articles', tenant?.id],
    queryFn: () => base44.entities.KnowledgeBaseArticle.filter({
      tenant_id: tenant.id,
      is_published: true,
      is_internal: false
    }, '-updated_date'),
    enabled: !!tenant?.id,
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ articleId, helpful }) => {
      const article = articles.find(a => a.id === articleId);
      return base44.entities.KnowledgeBaseArticle.update(articleId, {
        helpful_count: helpful ? (article.helpful_count || 0) + 1 : article.helpful_count,
        not_helpful_count: !helpful ? (article.not_helpful_count || 0) + 1 : article.not_helpful_count
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kb-articles'] });
      setFeedbackGiven(true);
    }
  });

  const filteredArticles = articles.filter(article =>
    article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  if (!tenant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const primaryColor = tenant.primary_color || '#0A1F44';
  const accentColor = tenant.accent_color || '#10B981';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <style>{`
        .tenant-primary { background-color: ${primaryColor}; }
        .tenant-text-primary { color: ${primaryColor}; }
        .tenant-accent { background-color: ${accentColor}; }
        .tenant-text-accent { color: ${accentColor}; }
      `}</style>
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {tenant.logo_url && (
            <img src={tenant.logo_url} alt={tenant.name} className="h-12 mx-auto mb-4" />
          )}
          <h1 className="text-3xl font-bold tenant-text-primary mb-2">
            {tenant.name} Knowledge Base
          </h1>
          <p className="text-slate-600">Find answers to common questions</p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-lg h-12"
              />
            </div>
          </CardContent>
        </Card>

        {selectedArticle ? (
          /* Article View */
          <div className="space-y-6">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedArticle(null);
                setFeedbackGiven(false);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Button>

            <Card>
              <CardHeader>
                <div className="space-y-2">
                  {selectedArticle.category && (
                    <Badge variant="outline">{selectedArticle.category}</Badge>
                  )}
                  <CardTitle className="text-3xl">{selectedArticle.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Updated {new Date(selectedArticle.updated_date).toLocaleDateString()}
                    </span>
                    {(selectedArticle.helpful_count > 0 || selectedArticle.not_helpful_count > 0) && (
                      <span>
                        {selectedArticle.helpful_count || 0} found this helpful
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none mb-8">
                  <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
                </div>

                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-slate-600 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-6">
                  <p className="text-sm font-medium text-slate-900 mb-3">Was this article helpful?</p>
                  {feedbackGiven ? (
                    <p className="text-sm text-green-600">Thank you for your feedback!</p>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => feedbackMutation.mutate({ articleId: selectedArticle.id, helpful: true })}
                        className="tenant-text-accent"
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Yes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => feedbackMutation.mutate({ articleId: selectedArticle.id, helpful: false })}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        No
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Articles List */
          <div>
            {categories.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={!searchQuery ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className={!searchQuery ? "tenant-primary" : ""}
                  >
                    All Articles
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No articles found</h3>
                  <p className="text-slate-600">Try a different search term</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.map(article => (
                  <Card
                    key={article.id}
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <CardHeader>
                      <div className="space-y-2">
                        {article.category && (
                          <Badge variant="outline" className="text-xs">{article.category}</Badge>
                        )}
                        <CardTitle className="text-xl">{article.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 line-clamp-3">
                        {article.excerpt || article.content?.substring(0, 150) + '...'}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.updated_date).toLocaleDateString()}
                        </span>
                        {article.view_count > 0 && (
                          <span>{article.view_count} views</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {tenant.email_footer && (
          <p className="text-xs text-slate-500 text-center mt-8">
            {tenant.email_footer}
          </p>
        )}
        <p className="text-xs text-slate-400 text-center mt-4">
          © 2025 Omega UI, LLC. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}