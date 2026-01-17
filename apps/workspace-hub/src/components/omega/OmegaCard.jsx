import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Sparkles } from "lucide-react";

export default function OmegaCard({ asset, onSwipe }) {
  const [isDragging, setIsDragging] = useState(false);

  if (!asset) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: -180 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: 180 }}
      transition={{ duration: 0.5, type: "spring" }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(e, { offset, velocity }) => {
        setIsDragging(false);
        if (Math.abs(offset.x) > 80) {
          onSwipe(offset.x > 0 ? 'right' : 'left');
        }
      }}
      whileHover={{ scale: 1.02 }}
      className="relative w-full max-w-2xl mx-auto cursor-grab active:cursor-grabbing px-2 sm:px-0"
      style={{ touchAction: 'none' }}
    >
      <div className="bg-[#2a2a2a] rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-[#2699fe] hover:border-[#ea00ea] transition-all duration-300 shadow-2xl hover:shadow-[0_0_40px_rgba(234,0,234,0.6)]">
        {/* Image Section */}
        <div className="relative h-64 sm:h-80 overflow-hidden">
          {asset.screenshot_url ? (
            <img
              src={asset.screenshot_url}
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
              <Sparkles className="w-24 h-24 text-white/40" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-[#ea00ea] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg">
            {asset.category}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-8">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            {asset.name}
          </h2>

          {/* Status */}
          <div className="bg-[#1a1a1a] border-2 border-[#2699fe] rounded-xl p-4 mb-4">
            <p className="text-[#4bce2a] font-bold text-sm mb-1">STATUS</p>
            <p className="text-white text-lg">
              {asset.status === 'active' ? '✓ Ready to Use' : '⏳ Coming Soon'}
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-base sm:text-lg mb-5 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none">
            {asset.description || 'No description available'}
          </p>

          {/* Deploy Button */}
          {asset.url && asset.status === 'active' ? (
            <a href={asset.url} target="_blank" rel="noopener noreferrer">
              <Button
                className="w-full h-12 sm:h-16 text-lg sm:text-2xl font-bold bg-[#4bce2a] hover:bg-[#3db522] text-white rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(75,206,42,0.6)] transition-all duration-300 active:scale-95"
              >
                <ExternalLink className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Open App
              </Button>
            </a>
          ) : (
            <Button
              disabled
              className="w-full h-12 sm:h-16 text-lg sm:text-2xl font-bold bg-gray-600 text-gray-400 rounded-xl shadow-lg cursor-not-allowed"
            >
              {asset.url ? 'Coming Soon' : 'URL Needed'}
            </Button>
          )}
        </div>
      </div>

      {/* Swipe Hint */}
      {!isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-gray-400 text-sm"
        >
          ← Swipe to browse →
        </motion.div>
      )}
    </motion.div>
  );
}