import React, { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, Users, Sparkles } from "lucide-react";

export default function SwipeCard({ user, onSwipe }) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const controls = useAnimation();

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      setExitX(500);
      controls.start({ x: 500 });
      setTimeout(() => onSwipe(user, 'right'), 200);
    } else if (info.offset.x < -100) {
      setExitX(-500);
      controls.start({ x: -500 });
      setTimeout(() => onSwipe(user, 'left'), 200);
    } else {
      controls.start({ x: 0, rotate: 0 });
    }
  };

  return (
    <motion.div
      className="absolute w-full"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="border-slate-200/60 shadow-2xl overflow-hidden bg-white">
        <div className="relative h-96 overflow-hidden">
          <img 
            src={user.profile_photo_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400"} 
            alt={user.full_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-end gap-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-xl">
                <AvatarImage src={user.profile_photo_url} />
                <AvatarFallback className="bg-gradient-to-br from-[#0A1628] to-[#1a2942] text-white text-2xl font-bold">
                  {user.full_name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{user.full_name}</h2>
                {user.location && (
                  <div className="flex items-center gap-1 text-white/90">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{user.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 space-y-4">
          {user.bio && (
            <p className="text-slate-700 leading-relaxed">{user.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-2">
            {user.verified_connections > 0 && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Users className="w-3 h-3 mr-1" />
                {user.verified_connections} Face-to-Face Connections
              </Badge>
            )}
            {user.legacy_enabled && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Legacy AI Active
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Swipe indicators */}
      <motion.div 
        className="absolute top-8 left-8 pointer-events-none"
        style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
      >
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-2xl rotate-12 border-4 border-white shadow-xl">
          <Heart className="w-8 h-8" />
        </div>
      </motion.div>

      <motion.div 
        className="absolute top-8 right-8 pointer-events-none"
        style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
      >
        <div className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-2xl -rotate-12 border-4 border-white shadow-xl">
          <X className="w-8 h-8" />
        </div>
      </motion.div>
    </motion.div>
  );
}