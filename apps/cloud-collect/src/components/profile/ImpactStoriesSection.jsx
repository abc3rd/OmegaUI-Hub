import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Award, Star, CheckCircle2, Megaphone, Pin, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const typeConfig = {
  milestone: {
    icon: Award,
    label: "Milestone",
    color: "bg-amber-100 text-amber-700 border-amber-200"
  },
  thank_you: {
    icon: Heart,
    label: "Thank You",
    color: "bg-pink-100 text-pink-700 border-pink-200"
  },
  progress: {
    icon: CheckCircle2,
    label: "Progress Update",
    color: "bg-blue-100 text-blue-700 border-blue-200"
  },
  goal_reached: {
    icon: Star,
    label: "Goal Reached!",
    color: "bg-green-100 text-green-700 border-green-200"
  },
  general: {
    icon: Megaphone,
    label: "Update",
    color: "bg-slate-100 text-slate-700 border-slate-200"
  }
};

const StoryCard = ({ story, profileName }) => {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const queryClient = useQueryClient();

  const config = typeConfig[story.type] || typeConfig.general;
  const Icon = config.icon;
  const isLong = story.content && story.content.length > 300;

  const likeMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ImpactStory.update(story.id, {
        likes: (story.likes || 0) + 1
      });
    },
    onSuccess: () => {
      setLiked(true);
      queryClient.invalidateQueries(['impactStories']);
    }
  });

  const handleLike = () => {
    if (!liked) {
      likeMutation.mutate();
      toast.success("Thanks for the support! ❤️");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className={`border-2 ${story.isPinned ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200'}`}>
        {story.isPinned && (
          <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
            <Pin className="w-3.5 h-3.5" />
          </div>
        )}
        
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                {profileName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">{profileName}</span>
                <Badge variant="outline" className={`text-xs ${config.color}`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <span className="text-xs text-slate-500">
                {format(new Date(story.created_date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Title if present */}
          {story.title && (
            <h4 className="font-semibold text-lg text-slate-800 mb-2">{story.title}</h4>
          )}

          {/* Content */}
          <div className="text-slate-700">
            <p className={`whitespace-pre-wrap ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
              {story.content}
            </p>
            {isLong && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-blue-600 hover:text-blue-700 p-0 h-auto"
              >
                {expanded ? (
                  <>Show less <ChevronUp className="w-4 h-4 ml-1" /></>
                ) : (
                  <>Read more <ChevronDown className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            )}
          </div>

          {/* Images */}
          {story.imageUrls && story.imageUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {story.imageUrls.slice(0, 4).map((url, idx) => (
                <img 
                  key={idx}
                  src={url} 
                  alt={`Update image ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              disabled={liked}
              className={`gap-2 ${liked ? 'text-pink-600' : 'text-slate-600 hover:text-pink-600'}`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{(story.likes || 0) + (liked ? 1 : 0)}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ImpactStoriesSection({ stories, profileName }) {
  const [showAll, setShowAll] = useState(false);

  if (!stories || stories.length === 0) return null;

  const sortedStories = [...stories].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const displayedStories = showAll ? sortedStories : sortedStories.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-semibold text-slate-800">Updates & Impact</h2>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700">
          {stories.length} update{stories.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <AnimatePresence>
        <div className="space-y-4">
          {displayedStories.map(story => (
            <StoryCard key={story.id} story={story} profileName={profileName} />
          ))}
        </div>
      </AnimatePresence>

      {stories.length > 3 && (
        <Button 
          variant="outline" 
          onClick={() => setShowAll(!showAll)}
          className="w-full"
        >
          {showAll ? 'Show Less' : `View All ${stories.length} Updates`}
        </Button>
      )}
    </div>
  );
}