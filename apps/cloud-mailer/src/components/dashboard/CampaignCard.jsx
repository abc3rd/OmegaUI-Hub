import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Calendar, ChevronRight } from "lucide-react";

const statusConfig = {
  draft: { color: "bg-slate-100 text-slate-700 border-slate-300", label: "Draft" },
  sending: { color: "bg-blue-100 text-blue-700 border-blue-300", label: "Sending" },
  sent: { color: "bg-green-100 text-green-700 border-green-300", label: "Sent" },
};

export default function CampaignCard({ campaign, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900 truncate">{campaign.name}</h3>
            <Badge variant="outline" className={`${statusConfig[campaign.status].color} border`}>
              {statusConfig[campaign.status].label}
            </Badge>
          </div>
          
          <p className="text-slate-600 mb-4 line-clamp-1">
            <Mail className="w-4 h-4 inline mr-1" />
            <span className="font-medium">Subject:</span> {campaign.subject}
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{campaign.total_recipients || 0} recipients</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{campaign.sent_count || 0} sent</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(campaign.created_date), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>
        
        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
      </div>
    </div>
  );
}