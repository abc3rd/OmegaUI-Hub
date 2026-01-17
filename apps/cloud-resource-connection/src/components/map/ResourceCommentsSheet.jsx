import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, ThumbsUp, AlertCircle, Info, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const commentTypeIcons = {
  tip: { icon: Info, color: "bg-blue-100 text-blue-700", label: "Tip" },
  update: { icon: AlertCircle, color: "bg-amber-100 text-amber-700", label: "Update" },
  issue: { icon: AlertCircle, color: "bg-red-100 text-red-700", label: "Issue" },
  confirmation: { icon: CheckCircle, color: "bg-green-100 text-green-700", label: "Confirmed" }
};

export default function ResourceCommentsSheet({ resource, isOpen, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState("tip");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['resourceComments', resource?.id],
    queryFn: () => base44.entities.ResourceComment.filter({ 
      resourceId: resource.id 
    }, '-created_date'),
    enabled: !!resource && isOpen,
    refetchInterval: 15000
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ResourceComment.create({
        resourceId: resource.id,
        userId: currentUser.id,
        userName: currentUser.full_name,
        commentType: commentType,
        content: data.content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resourceComments', resource.id]);
      setNewComment("");
      toast.success('Comment added!');
    }
  });

  const voteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;
      
      await base44.entities.ResourceComment.update(commentId, {
        isHelpful: (comment.isHelpful || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resourceComments', resource.id]);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ content: newComment });
  };

  if (!resource) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Community Updates</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Add Comment Form */}
          {currentUser && (
            <form onSubmit={handleSubmit} className="space-y-3 pb-4 border-b">
              <div>
                <label className="text-sm font-semibold mb-2 block">Add Your Input</label>
                <div className="flex gap-2 mb-2">
                  {Object.entries(commentTypeIcons).map(([type, { label }]) => (
                    <Button
                      key={type}
                      type="button"
                      size="sm"
                      variant={commentType === type ? "default" : "outline"}
                      onClick={() => setCommentType(type)}
                      className="text-xs"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Textarea
                placeholder="Share a tip, update, or report an issue..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              
              <Button
                type="submit"
                disabled={!newComment.trim() || addCommentMutation.isPending}
                className="w-full"
                size="sm"
              >
                {addCommentMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Comment
              </Button>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Recent Activity ({comments.length})</h4>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">No comments yet. Be the first!</p>
              </div>
            ) : (
              comments.map((comment) => {
                const typeInfo = commentTypeIcons[comment.commentType] || commentTypeIcons.tip;
                const Icon = typeInfo.icon;
                
                return (
                  <div key={comment.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${typeInfo.color}`}>
                          <Icon className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{comment.userName}</p>
                          <p className="text-[10px] text-slate-500">
                            {new Date(comment.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {typeInfo.label}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-700">{comment.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => voteCommentMutation.mutate(comment.id)}
                        className="h-6 text-xs px-2"
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Helpful {comment.isHelpful > 0 && `(${comment.isHelpful})`}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}