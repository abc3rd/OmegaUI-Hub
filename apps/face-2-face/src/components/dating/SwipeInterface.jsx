import React, { useState, useEffect } from "react";
import SwipeCard from "./SwipeCard";
import { Button } from "@/components/ui/button";
import { Heart, X, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SwipeInterface({ users, onMatch, onPass }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingUser, setShowingUser] = useState(null);

  useEffect(() => {
    if (users && users.length > 0) {
      setShowingUser(users[currentIndex]);
    }
  }, [currentIndex, users]);

  const handleSwipe = (user, direction) => {
    if (direction === 'right') {
      onMatch(user);
    } else {
      onPass(user);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleButtonSwipe = (direction) => {
    if (!showingUser) return;
    handleSwipe(showingUser, direction);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-bold text-[#0A1628] mb-2">
          No More Users
        </h3>
        <p className="text-slate-600">
          Check back later for more connections!
        </p>
      </div>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-bold text-[#0A1628] mb-2">
          You've Seen Everyone!
        </h3>
        <p className="text-slate-600 mb-6">
          Come back later for more potential connections.
        </p>
        <Button 
          onClick={() => setCurrentIndex(0)}
          className="bg-gradient-to-r from-[#0A1628] to-[#1a2942]"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="relative h-[600px] mb-8">
        <AnimatePresence>
          {showingUser && (
            <SwipeCard 
              key={showingUser.id}
              user={showingUser}
              onSwipe={handleSwipe}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-6">
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-red-400 text-red-500 hover:bg-red-50 hover:border-red-500"
            onClick={() => handleButtonSwipe('left')}
          >
            <X className="w-8 h-8" />
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-blue-400 text-blue-500 hover:bg-blue-50 hover:border-blue-500"
            onClick={handleUndo}
            disabled={currentIndex === 0}
          >
            <RotateCcw className="w-6 h-6" />
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:shadow-xl"
            onClick={() => handleButtonSwipe('right')}
          >
            <Heart className="w-8 h-8" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}