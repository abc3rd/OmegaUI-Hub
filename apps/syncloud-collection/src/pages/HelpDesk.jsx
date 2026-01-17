import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  HelpCircle, 
  Plus, 
  Search, 
  MessageSquare,
  ThumbsUp,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Star
} from 'lucide-react';
import { HelpDeskPost } from '@/entities/HelpDeskPost';
import { HelpDeskReply } from '@/entities/HelpDeskReply';
import { User } from '@/entities/User';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categoryColors = {
  general_help: 'bg-blue-100 text-blue-800',
  technical_issues: 'bg-red-100 text-red-800',
  feature_requests: 'bg-green-100 text-green-800',
  workflow_automation: 'bg-purple-100 text-purple-800',
  integrations: 'bg-orange-100 text-orange-800',
  crm_contacts: 'bg-pink-100 text-pink-800',
  content_creation: 'bg-indigo-100 text-indigo-800',
  smart_home: 'bg-cyan-100 text-cyan-800',
  yard_garden: 'bg-emerald-100 text-emerald-800',
  recipes_cooking: 'bg-amber-100 text-amber-800',
  other: 'bg-gray-100 text-gray-800'
};

const statusIcons = {
  open: Clock,
  in_progress: AlertCircle,
  resolved: CheckCircle,
  closed: CheckCircle
};

export default function HelpDesk() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    category: 'general_help',
    priority: 'medium',
    tags: []
  });

  useEffect(() => {
    loadPosts();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await HelpDeskPost.list('-created_date');
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async (postId) => {
    try {
      const data = await HelpDeskReply.filter({ post_id: postId }, 'created_date');
      setReplies(data);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const handleAddPost = async () => {
    if (!user) return;
    
    try {
      await HelpDeskPost.create({
        ...newPost,
        author_name: user.full_name || user.email
      });
      setNewPost({
        title: '',
        description: '',
        category: 'general_help',
        priority: 'medium',
        tags: []
      });
      setShowAddDialog(false);
      loadPosts();
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  const handleAddReply = async () => {
    if (!user || !selectedPost || !newReply.trim()) return;
    
    try {
      await HelpDeskReply.create({
        post_id: selectedPost.id,
        content: newReply,
        author_name: user.full_name || user.email,
        is_admin_reply: user.role === 'admin'
      });
      setNewReply('');
      loadReplies(selectedPost.id);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const updatePostStatus = async (postId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.resolved_by = user?.email;
        updateData.resolved_at = new Date().toISOString();
      }
      await HelpDeskPost.update(postId, updateData);
      loadPosts();
      if (selectedPost?.id === postId) {
        setSelectedPost({ ...selectedPost, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const incrementViews = async (post) => {
    try {
      await HelpDeskPost.update(post.id, { views: (post.views || 0) + 1 });
      setSelectedPost({ ...post, views: (post.views || 0) + 1 });
      loadReplies(post.id);
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return <div className="p-6 text-center">Loading help desk...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Community Help Desk</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ask for Help</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="Brief summary of your question or issue"
                />
              </div>
              
              <div>
                <Label>Category</Label>
                <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_help">General Help</SelectItem>
                    <SelectItem value="technical_issues">Technical Issues</SelectItem>
                    <SelectItem value="feature_requests">Feature Requests</SelectItem>
                    <SelectItem value="workflow_automation">Workflow Automation</SelectItem>
                    <SelectItem value="integrations">Integrations</SelectItem>
                    <SelectItem value="crm_contacts">CRM & Contacts</SelectItem>
                    <SelectItem value="content_creation">Content Creation</SelectItem>
                    <SelectItem value="smart_home">Smart Home</SelectItem>
                    <SelectItem value="yard_garden">Yard & Garden</SelectItem>
                    <SelectItem value="recipes_cooking">Recipes & Cooking</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Priority</Label>
                <Select value={newPost.priority} onValueChange={(value) => setNewPost({...newPost, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={newPost.description}
                  onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                  placeholder="Provide detailed information about your question or issue..."
                  className="h-32"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button 
                  onClick={handleAddPost}
                  disabled={!newPost.title || !newPost.description}
                >
                  Post Question
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general_help">General Help</SelectItem>
                <SelectItem value="technical_issues">Technical Issues</SelectItem>
                <SelectItem value="feature_requests">Feature Requests</SelectItem>
                <SelectItem value="workflow_automation">Workflow Automation</SelectItem>
                <SelectItem value="integrations">Integrations</SelectItem>
                <SelectItem value="crm_contacts">CRM & Contacts</SelectItem>
                <SelectItem value="content_creation">Content Creation</SelectItem>
                <SelectItem value="smart_home">Smart Home</SelectItem>
                <SelectItem value="yard_garden">Yard & Garden</SelectItem>
                <SelectItem value="recipes_cooking">Recipes & Cooking</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Questions List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Questions ({filteredPosts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No questions found</h3>
                  <p className="text-gray-500 mb-4">
                    Be the first to ask a question!
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ask Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post) => {
                    const StatusIcon = statusIcons[post.status];
                    return (
                      <div 
                        key={post.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPost?.id === post.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => incrementViews(post)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-lg">{post.title}</h3>
                          <div className="flex items-center gap-2">
                            {post.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                            <StatusIcon className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={categoryColors[post.category]}>
                              {post.category.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline">{post.priority}</Badge>
                            <Badge variant="outline">{post.status}</Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {post.upvotes || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.views || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {post.reply_count || 0}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3 text-xs text-gray-400">
                          <span>by {post.author_name}</span>
                          <span>{new Date(post.created_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Question Details */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {selectedPost ? 'Discussion' : 'Select a Question'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPost ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">{selectedPost.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{selectedPost.description}</p>
                    
                    {user?.role === 'admin' && (
                      <Select 
                        value={selectedPost.status} 
                        onValueChange={(value) => updatePostStatus(selectedPost.id, value)}
                      >
                        <SelectTrigger className="w-full mb-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Replies ({replies.length})</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {replies.map((reply) => (
                        <div key={reply.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium">{reply.author_name}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(reply.created_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{reply.content}</p>
                          {reply.is_solution && (
                            <Badge className="mt-2 bg-green-100 text-green-800">Solution</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <Textarea
                        placeholder="Write a reply..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        className="mb-2"
                      />
                      <Button 
                        size="sm" 
                        onClick={handleAddReply}
                        disabled={!newReply.trim()}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Click on a question to view details and replies</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}