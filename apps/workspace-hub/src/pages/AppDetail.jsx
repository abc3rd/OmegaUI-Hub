import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExternalLink,
  ArrowLeft,
  Star,
  Calendar,
  Eye,
  MessageSquare,
  Send,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AppDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("feedback");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch app details
  const { data: app, isLoading: appLoading } = useQuery({
    queryKey: ['app', id],
    queryFn: async () => {
      const apps = await base44.entities.apps.list();
      return apps.find(a => a.id === id);
    },
    enabled: !!id,
  });

  // Fetch app feedback
  const { data: feedback = [] } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => base44.entities.Feedback.filter({ app_id: id }),
    enabled: !!id,
  });

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async (data) => base44.entities.Feedback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
      setRating(0);
      setComment("");
      setCategory("feedback");
      toast.success("Review submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit review: " + error.message);
    },
  });

  const handleLaunchApp = async () => {
    if (!app) return;
    
    // Increment view count and update last accessed
    await base44.entities.apps.update(app.id, { 
      views: (app.views || 0) + 1,
      last_accessed: new Date().toISOString()
    });
    
    queryClient.invalidateQueries({ queryKey: ['app', id] });
    window.open(app.url, '_blank');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter your review");
      return;
    }

    const feedbackData = {
      type: "app",
      app_id: id,
      app_name: app.name,
      rating,
      comment: comment.trim(),
      category,
      user_email: user?.email || "anonymous",
      user_name: user?.full_name || "Anonymous User",
    };

    submitFeedback.mutate(feedbackData);
  };

  if (appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#EA00EA] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">Loading app details...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">App Not Found</h2>
            <p className="text-gray-600 mb-6">The app you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/hub')} className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgRating = feedback.length > 0
    ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
    : 0;

  return (
    <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/hub')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hub
        </Button>

        {/* App Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] p-8 sm:p-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-[#4bce2a] text-white text-lg px-4 py-1">
                    {app.category}
                  </Badge>
                  {app.featured && (
                    <Badge className="bg-yellow-500 text-white text-lg px-4 py-1">
                      ⭐ Featured
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-white/20 text-white border-white/40 text-lg px-4 py-1">
                    {app.status === "active" ? "Active" : "Coming Soon"}
                  </Badge>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                  {app.name}
                </h1>
                <p className="text-xl text-white/90 mb-6">
                  {app.description}
                </p>
                <div className="flex flex-wrap gap-6 text-white/80 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    <span>{app.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>Added {new Date(app.created_date).toLocaleDateString()}</span>
                  </div>
                  {feedback.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span>{avgRating.toFixed(1)} ({feedback.length} reviews)</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleLaunchApp}
                  disabled={app.status !== "active" || !app.url}
                  className="bg-white text-[#EA00EA] hover:bg-gray-100 text-lg px-8 py-6"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Launch App
                </Button>
              </div>
              {app.screenshot_url && (
                <div className="lg:w-96">
                  <img
                    src={app.screenshot_url}
                    alt={app.name}
                    className="rounded-xl shadow-2xl border-4 border-white/20"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tags */}
            {app.tags && app.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {app.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  User Reviews ({feedback.length})
                </CardTitle>
                {feedback.length > 0 && (
                  <CardDescription>
                    Average rating: {avgRating.toFixed(1)} / 5.0
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {feedback.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review!</p>
                ) : (
                  feedback.map((review, index) => (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {review.user_name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {review.category}
                            </Badge>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.created_date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Submit Review */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
                <CardDescription>Share your experience with this app</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feedback">General Feedback</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="improvement">Improvement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitFeedback.isPending}
                    className="w-full bg-gradient-to-r from-[#EA00EA] to-[#9D00FF]"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitFeedback.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}