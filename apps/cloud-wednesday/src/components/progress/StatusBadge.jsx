import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Circle, 
  Clock, 
  AlertOctagon, 
  Eye, 
  CheckCircle2,
  Pause
} from "lucide-react";

const statusConfig = {
  todo: {
    label: "To Do",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    dotColor: "bg-slate-400",
    icon: Circle
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
    icon: Clock
  },
  blocked: {
    label: "Blocked",
    color: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-500",
    icon: AlertOctagon
  },
  review: {
    label: "In Review",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    dotColor: "bg-amber-500",
    icon: Eye
  },
  done: {
    label: "Done",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: CheckCircle2
  },
  on_hold: {
    label: "On Hold",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
    icon: Pause
  }
};

export default function StatusBadge({ 
  status = "todo", 
  size = "md",
  showIcon = true,
  showDot = false,
  className = ""
}) {
  const config = statusConfig[status] || statusConfig.todo;
  const Icon = config.icon;

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4"
  };

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} ${sizes[size]} font-medium border rounded-full flex items-center gap-1.5 ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      )}
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
}

export function StatusSelector({ 
  value = "todo", 
  onChange,
  className = ""
}) {
  const statuses = Object.keys(statusConfig);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {statuses.map((status) => {
        const config = statusConfig[status];
        const Icon = config.icon;
        const isSelected = value === status;

        return (
          <button
            key={status}
            onClick={() => onChange(status)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              transition-all duration-200 border
              ${isSelected 
                ? `${config.color} ring-2 ring-offset-1 ring-${status === 'done' ? 'emerald' : status === 'blocked' ? 'red' : status === 'in_progress' ? 'blue' : status === 'review' ? 'amber' : 'slate'}-300` 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
}

export { statusConfig };