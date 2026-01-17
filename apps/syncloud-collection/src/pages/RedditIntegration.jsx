
import React, { useState, useEffect, useCallback } from 'react';
import { RedditPost } from '@/entities/RedditPost';
import { redditAPI } from '@/functions/redditAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  MessageSquare,
  Plus,
  ExternalLink,
  TrendingUp,
  Users,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Calendar,
  Target,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

export default function RedditIntegrationPage() {
  const [integration, setIntegration] = useState(null);
  const [posts, setPosts] = useState([]);
  const [subreddits, setSubreddits] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  
  const [authData, setAuthData] = useState({
    clientId: '',
    clientSecret: '',
    username: '',
    password: ''
  });
  
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    subreddit: '',
    postType: 'text',
    flair: ''
  });

  const loadSubreddits = useCallback(async () => {
    try {
      const response = await redditAPI({ action: 'get_subreddits' });
      if (response.data.subreddits) {
        setSubreddits(response.data.subreddits);
      }
    } catch (error) {
      console.error('Error loading subreddits:', error);
    }
  }, []);

  const loadMentions = useCallback(async () => {
    try {
      const response = await redditAPI({ 
        action: 'monitor_mentions', 
        data: { keywords: ['ABC Dashboard', 'business automation'] }
      });
      if (response.data.mentions) {
        setMentions(response.data.mentions);
      }
    } catch (error) {
      console.error('Error loading mentions:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const postsData = await RedditPost.list('-created_date').catch(() => []);
      setPosts(postsData);
      
      const hasIntegration = localStorage.getItem('reddit_connected') === 'true';
      setIntegration(hasIntegration);
      
      if (hasIntegration) {
        await loadSubreddits();
        await loadMentions();
      }
    } catch (error) {
      console.error('Error loading Reddit data:', error);
    } finally {
      setLoading(false);
    }
  }, [loadSubreddits, loadMentions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleConnect = async () => {
    if (!authData.clientId || !authData.clientSecret || !authData.username || !authData.password) {
        toast.error("Please fill out all fields for Reddit authentication.");
        return;
    }
    try {
      const { data } = await redditAPI({
        action: 'authenticate',
        data: authData
      });
      
      if (data.success) {
        toast.success('Reddit account connected successfully!');
        localStorage.setItem('reddit_connected', 'true');
        setShowConnectDialog(false);
        setIntegration(true);
        loadData();
      } else {
        toast.error(data.error || "Authentication failed. Check your credentials.");
      }
    } catch (error) {
      console.error('Error connecting Reddit:', error);
      toast.error('Failed to connect Reddit account. Please try again.');
    }
  };

  const handleCreatePost = async () => {
    try {
      if (!newPost.title || !newPost.content || !newPost.subreddit) {
        toast.error('Title, content, and subreddit are required');
        return;
      }

      const { data } = await redditAPI({
        action: 'post',
        data: newPost
      });
      
      if (data.success) {
        toast.success('Posted to Reddit successfully!');
        setShowPostDialog(false);
        setNewPost({ title: '', content: '', subreddit: '', postType: 'text', flair: '' });
        loadData();
      } else {
        toast.error(data.error || "Failed to create post.");
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create Reddit post. Is your account connected?');
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="p-6 space-y-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              Reddit Integration
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect your Reddit account to post, monitor, and engage.
            </p>
          </div>

          <div className="flex gap-3">
            {integration ? (
              <Button onClick={() => setShowPostDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Post
              </Button>
            ) : (
              <Button onClick={() => setShowConnectDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Connect Reddit
              </Button>
            )}
          </div>
        </div>

        {integration ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{posts.length}</p>
                      <p className="text-sm text-muted-foreground">Total Posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {posts.reduce((sum, post) => sum + (post.upvotes || 0), 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Upvotes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{subreddits.length}</p>
                      <p className="text-sm text-muted-foreground">Subreddits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{mentions.length}</p>
                      <p className="text-sm text-muted-foreground">Brand Mentions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="posts" className="space-y-4 w-full">
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="subreddits">Subreddits</TabsTrigger>
                <TabsTrigger value="mentions">Mentions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4 w-full">
                <div className="grid gap-4 w-full">
                  {posts.map((post) => (
                    <Card key={post.id} className="w-full">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                            <p className="text-muted-foreground mb-4">{post.content}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant="outline">r/{post.subreddit}</Badge>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                {post.upvotes || 0} upvotes
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                {post.comments_count || 0} comments
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(post.created_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                post.status === 'posted' ? 'default' :
                                post.status === 'failed' ? 'destructive' : 'secondary'
                              }
                            >
                              {post.status === 'posted' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {post.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                              {post.status === 'scheduled' && <Clock className="w-3 h-3 mr-1" />}
                              {post.status}
                            </Badge>
                            {post.reddit_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={post.reddit_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {posts.length === 0 && (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Posts Yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Create your first Reddit post to get started
                        </p>
                        <Button onClick={() => setShowPostDialog(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Post
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="subreddits" className="space-y-4 w-full">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                  {subreddits.map((subreddit, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Globe className="w-4 h-4 text-orange-600" />
                          </div>
                          <h3 className="font-semibold">r/{subreddit.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{subreddit.title}</p>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{subreddit.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{subreddit.subscribers?.toLocaleString()} members</span>
                          <Button size="sm" variant="outline">
                            Post Here
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {subreddits.length === 0 && (
                    <div className="col-span-full">
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">No Subreddits Found</h3>
                          <p className="text-muted-foreground">
                            Connect your Reddit account to see your subscribed subreddits
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="mentions" className="space-y-4 w-full">
                <div className="grid gap-4 w-full">
                  {mentions.map((mention, index) => (
                    <Card key={index} className="w-full">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium">{mention.title}</h3>
                            <p className="text-sm text-muted-foreground">r/{mention.subreddit}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span>{mention.score} points</span>
                              <span>{new Date(mention.created).toLocaleDateString()}</span>
                              <Badge variant="outline">{mention.keyword}</Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={mention.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {mentions.length === 0 && (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Mentions Found</h3>
                        <p className="text-muted-foreground">
                          We'll monitor Reddit for mentions of your brand and keywords
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4 w-full">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Reddit Performance Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {posts.length > 0 ? Math.round(posts.reduce((sum, p) => sum + (p.upvotes || 0), 0) / posts.length) : 0}
                          </div>
                          <div className="text-sm text-muted-foreground">Average Upvotes</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {posts.filter(p => (p.upvotes || 0) > 10).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Popular Posts</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {posts.filter(p => p.status === 'posted').length}
                          </div>
                          <div className="text-sm text-muted-foreground">Published Posts</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="w-full">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Your Reddit Account</h3>
              <p className="text-muted-foreground mb-6">
                Start managing your Reddit presence directly from ABC Dashboard.
              </p>
              <Button onClick={() => setShowConnectDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Connect Reddit Account
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Connect Dialog */}
        <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Connect Reddit Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Setup Instructions:</h4>
                <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="underline">reddit.com/prefs/apps</a></li>
                  <li>Click "are you a developer? create an app..."</li>
                  <li>Choose "script" type and give it a name.</li>
                  <li>Copy your personal use script ID (Client ID) and secret.</li>
                </ol>
              </div>
              <div>
                <Label>Reddit App Client ID</Label>
                <Input
                  value={authData.clientId}
                  onChange={(e) => setAuthData({...authData, clientId: e.target.value})}
                  placeholder="Your Reddit app client ID"
                />
              </div>
              <div>
                <Label>Reddit App Client Secret</Label>
                <Input
                  type="password"
                  value={authData.clientSecret}
                  onChange={(e) => setAuthData({...authData, clientSecret: e.target.value})}
                  placeholder="Your Reddit app client secret"
                />
              </div>
              <div>
                <Label>Reddit Username</Label>
                <Input
                  value={authData.username}
                  onChange={(e) => setAuthData({...authData, username: e.target.value})}
                  placeholder="Your Reddit username"
                />
              </div>
              <div>
                <Label>Reddit Password</Label>
                <Input
                  type="password"
                  value={authData.password}
                  onChange={(e) => setAuthData({...authData, password: e.target.value})}
                  placeholder="Your Reddit password"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnect}>
                  Connect Account
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Post Dialog */}
        <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Reddit Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="Post title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subreddit</Label>
                  <Select value={newPost.subreddit} onValueChange={(value) => setNewPost({...newPost, subreddit: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subreddit" />
                    </SelectTrigger>
                    <SelectContent>
                      {subreddits.map((sub) => (
                        <SelectItem key={sub.name} value={sub.name}>
                          r/{sub.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="test">r/test</SelectItem>
                      <SelectItem value="announcements">r/announcements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Post Type</Label>
                  <Select value={newPost.postType} onValueChange={(value) => setNewPost({...newPost, postType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Post</SelectItem>
                      <SelectItem value="link">Link Post</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder={newPost.postType === 'text' ? 'Post content...' : 'URL to share'}
                  rows={6}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPostDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost}>
                  Post to Reddit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
