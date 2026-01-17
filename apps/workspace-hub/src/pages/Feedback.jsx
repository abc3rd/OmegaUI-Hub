import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageSquare, Bug, Lightbulb, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Feedback() {
  const [user, setUser] = useState(null);
  const [feedbackType, setFeedbackType] = useState("general");
  const [selectedApp, setSelectedApp] = useState("");
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState("feedback");
  const [comment, setComment] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch apps for selection
  const { data: apps = [] } = useQuery({
    queryKey: ['apps'],
    queryFn: () => base44.entities.apps.list(),
    initialData: [],
  });

  // Fetch all feedback
  const { data: allFeedback = [] } = useQuery({
    queryKey: ['feedback'],
    queryFn: () => base44.entities.Feedback.list('-created_date'),
    initialData: [],
  });

  // Filter feedback
  const filteredFeedback = allFeedback.filter(item => {
    const typeMatch = filterType === 'all' || item.type === filterType;
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    return typeMatch && categoryMatch;
  });

  // Submit feedback mutation
  const submitFeedback = useMutation({
    mutationFn: async (data) => base44.entities.Feedback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      setRating(0);
      setComment("");
      setSelectedApp("");
      setCategory("feedback");
      toast.success("Feedback submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit feedback: " + error.message);
    },
  });

  // Delete feedback mutation
  const deleteFeedback = useMutation({
    mutationFn: (id) => base44.entities.Feedback.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success("Feedback deleted");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    const feedbackData = {
      type: feedbackType,
      rating,
      comment: comment.trim(),
      category,
      user_email: user?.email || "anonymous",
      user_name: user?.full_name || "Anonymous User",
    };

    if (feedbackType === "app" && selectedApp) {
      const app = apps.find(a => a.id === selectedApp);
      feedbackData.app_id = selectedApp;
      feedbackData.app_name = app?.name || "Unknown App";
    }

    submitFeedback.mutate(feedbackData);
  };

  const canDelete = (feedback) => {
    if (!user) return false;
    return user.email === feedback.created_by || user.role === 'admin';
  };

  const getCategoryColor = (cat) => {
    const colors = {
      feedback: "bg-blue-100 text-blue-800",
      bug: "bg-red-100 text-red-800",
      feature: "bg-green-100 text-green-800",
      improvement: "bg-purple-100 text-purple-800",
    };
    return colors[cat] || "bg-gray-100 text-gray-800";
  };

  const getCategoryIcon = (cat) => {
    const icons = {
      feedback: MessageSquare,
      bug: Bug,
      feature: Lightbulb,
      improvement: Star,
    };
    const Icon = icons[cat] || MessageSquare;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Feedback Center</h1>
          <p className="text-gray-600">Help us improve by sharing your thoughts, reporting bugs, or suggesting features</p>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
            <TabsTrigger value="view">View Feedback</TabsTrigger>
          </TabsList>

          {/* Submit Feedback Tab */}
          <TabsContent value="submit">
            <Card>
              <CardHeader>
                <CardTitle>Share Your Feedback</CardTitle>
                <CardDescription>
                  Your input helps us build better products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Feedback Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback Type
                    </label>
                    <Select value={feedbackType} onValueChange={setFeedbackType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="platform">Platform Feedback</SelectItem>
                        <SelectItem value="app">Specific App Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* App Selection (if app feedback) */}
                  {feedbackType === "app" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select App
                      </label>
                      <Select value={selectedApp} onValueChange={setSelectedApp}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an app..." />
                        </SelectTrigger>
                        <SelectContent>
                          {apps.map((app) => (
                            <SelectItem key={app.id} value={app.id}>
                              {app.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Category */}
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
                        <SelectItem value="improvement">Improvement Suggestion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
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

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Feedback
                    </label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us what you think..."
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitFeedback.isPending}
                    className="w-full bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] hover:from-[#9D00FF] hover:to-[#EA00EA]"
                  >
                    {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* View Feedback Tab */}
          <TabsContent value="view" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="platform">Platform</SelectItem>
                      <SelectItem value="app">App Specific</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="bug">Bugs</SelectItem>
                      <SelectItem value="feature">Features</SelectItem>
                      <SelectItem value="improvement">Improvements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Feedback List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  All Feedback ({filteredFeedback.length})
                </h2>
              </div>

              <AnimatePresence mode="popLayout">
                {filteredFeedback.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No feedback found</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredFeedback.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={getCategoryColor(item.category)}>
                                  {getCategoryIcon(item.category)}
                                  <span className="ml-1 capitalize">{item.category}</span>
                                </Badge>
                                <Badge variant="outline">
                                  {item.type === "app" ? item.app_name : "Platform"}
                                </Badge>
                                <div className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= item.rating
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                by {item.user_name} • {new Date(item.created_date).toLocaleDateString()}
                              </div>
                            </div>
                            {canDelete(item) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteFeedback.mutate(item.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-700 whitespace-pre-wrap">{item.comment}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}