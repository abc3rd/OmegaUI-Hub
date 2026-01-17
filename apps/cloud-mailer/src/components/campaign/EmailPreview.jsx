import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function EmailPreview({ campaign }) {
  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Email Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Email Header */}
          <div className="bg-slate-50 p-4 border-b border-slate-200">
            <div className="text-xs text-slate-500 mb-1">Subject</div>
            <div className="font-semibold text-slate-900">{campaign.subject}</div>
          </div>

          {/* Email Body */}
          <div className="p-6">
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: campaign.body }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}