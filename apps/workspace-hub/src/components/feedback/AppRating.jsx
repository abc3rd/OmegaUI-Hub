import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Star } from "lucide-react";

export default function AppRating({ appId }) {
  const { data: feedback = [] } = useQuery({
    queryKey: ['feedback', appId],
    queryFn: () => base44.entities.Feedback.filter({ app_id: appId }),
    enabled: !!appId,
  });

  if (feedback.length === 0) return null;

  const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
  const roundedRating = Math.round(avgRating * 10) / 10;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(avgRating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700">
        {roundedRating}
      </span>
      <span className="text-xs text-gray-500">
        ({feedback.length} {feedback.length === 1 ? 'review' : 'reviews'})
      </span>
    </div>
  );
}