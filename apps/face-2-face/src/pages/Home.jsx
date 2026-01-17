import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Camera, Lock, Sparkles, Users, Image as ImageIcon, X } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [circleEmails, setCircleEmails] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      let connections = [];
      try {
        connections = await base44.entities.Connection.list();
        connections = connections.filter(c => 
          c.status === "accepted" && 
          (c.user_a === userData.email || c.user_b === userData.email)
        );
      } catch (connError) {
        console.error("Error loading connections:", connError);
        connections = [];
      }
      
      const emails = connections.map(c => 
        c.user_a === userData.email ? c.user_b : c.user_a
      );
      
      setCircleEmails([userData.email, ...emails]);

      const allPosts = await base44.entities.Post.list("-created_date");
      const circlePosts = allPosts.filter(p => 
        [userData.email, ...emails].includes(p.author_email)
      );
      setPosts(circlePosts);
    } catch (error) {
      console.error("Error loading feed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedImage) return;
    
    setUploading(true);
    try {
      let media_url = null;
      
      if (selectedImage) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedImage });
        media_url = file_url;
      }

      await base44.entities.Post.create({
        author_email: user.email,
        content: newPost,
        media_url,
        visibility: "circle"
      });
      
      setNewPost("");
      setSelectedImage(null);
      loadData();
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post. Please try again.");
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 py-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-[#D4AF37]" />
            <h1 className="text-4xl font-bold text-[#0A1628] tracking-tight">Your Circle</h1>
          </div>
          <p className="text-slate-600 font-medium">
            Authentic moments from people you've met face to face
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500 pt-2">
            <Lock className="w-4 h-4" />
            <span>Only visible to your verified connections</span>
          </div>
        </motion.div>

        {user && (
          <Card className="border-slate-200/60 shadow-xl shadow-slate-900/5 overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-amber-50/30 p-6">
              <div className="flex gap-4">
                <Avatar className="h-12 w-12 border-2 border-[#D4AF37]/30">
                  <AvatarImage src={user?.profile_photo_url} />
                  <AvatarFallback className="bg-gradient-to-br from-[#0A1628] to-[#1a2942] text-white font-bold">
                    {user?.full_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder="Share a moment with your Circle..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-24 border-slate-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 resize-none"
                  />
                  {selectedImage && (
                    <div className="relative inline-block">
                      <img 
                        src={URL.createObjectURL(selectedImage)} 
                        alt="Selected" 
                        className="h-32 rounded-lg object-cover border-2 border-[#D4AF37]/30"
                      />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 bg-slate-50/50">
              <div className="flex justify-end gap-3">
                <label className="cursor-pointer">
                  <Button 
                    variant="outline"
                    className="gap-2 border-slate-200 hover:bg-white"
                    type="button"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Photo
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <Button 
                  onClick={handleCreatePost}
                  disabled={(!newPost.trim() && !selectedImage) || uploading}
                  className="bg-gradient-to-r from-[#0A1628] to-[#1a2942] hover:shadow-lg hover:shadow-slate-900/20 transition-all gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {uploading ? "Posting..." : "Share"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="border-slate-200/60 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-6"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                <Users className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold text-[#0A1628] mb-2">Your Circle Awaits</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Start by making your first connection with a Digital Handshake
              </p>
              <Link to={createPageUrl("Handshake")}>
                <Button className="bg-gradient-to-r from-[#0A1628] to-[#1a2942] hover:shadow-lg">
                  <Camera className="w-4 h-4 mr-2" />
                  Create Handshake
                </Button>
              </Link>
            </motion.div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={() => loadData()} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PostCard({ post, onDelete }) {
  const [author, setAuthor] = useState(null);
  const [user, setUser] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allUsers = await base44.entities.User.list();
      const authorUser = allUsers.find(u => u.email === post.author_email);
      if (authorUser) setAuthor(authorUser);
      
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading post data:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this post?")) {
      try {
        await base44.entities.Post.delete(post.id);
        onDelete();
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Error deleting post. Please try again.");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="border-slate-200/60 shadow-xl shadow-slate-900/5 overflow-hidden hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4 items-start">
            <Link to={createPageUrl("Profile")}>
              <Avatar className="h-12 w-12 border-2 border-[#D4AF37]/30 cursor-pointer hover:border-[#D4AF37] transition-all">
                <AvatarImage src={author?.profile_photo_url} />
                <AvatarFallback className="bg-gradient-to-br from-[#0A1628] to-[#1a2942] text-white font-bold">
                  {author?.full_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <p className="font-bold text-[#0A1628]">{author?.full_name || 'Unknown User'}</p>
              <p className="text-xs text-slate-500 font-medium">
                {format(new Date(post.created_date), "MMM d 'at' h:mm a")}
              </p>
            </div>
            {user?.email === post.author_email && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {post.content && (
            <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">
              {post.content}
            </p>
          )}

          {post.media_url && (
            <img 
              src={post.media_url} 
              alt="Post media" 
              className="w-full rounded-xl mb-4 shadow-lg"
            />
          )}

          <div className="flex gap-6 pt-4 border-t border-slate-100">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLiked(!liked)}
              className={`gap-2 transition-all ${
                liked 
                  ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                  : 'text-slate-600 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              <span className="font-semibold">Like</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-blue-500 hover:bg-blue-50">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Comment</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-green-500 hover:bg-green-50">
              <Share2 className="w-5 h-5" />
              <span className="font-semibold">Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}