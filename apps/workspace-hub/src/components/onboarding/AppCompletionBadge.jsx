import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

export default function AppCompletionBadge({ app, onClick }) {
  const requiredFields = ["name", "url", "description", "category"];
  const missingFields = requiredFields.filter(field => !app[field]);
  
  if (missingFields.length === 0) return null;

  const percentage = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full hover:bg-amber-100 transition-colors"
    >
      <AlertCircle className="w-4 h-4 text-amber-600" />
      <span className="text-xs font-medium text-amber-700">
        {percentage}% Complete
      </span>
    </button>
  );
}