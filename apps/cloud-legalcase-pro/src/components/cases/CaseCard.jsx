import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const caseTypeColors = {
  patent: "bg-purple-100 text-purple-800 border-purple-300",
  criminal: "bg-red-100 text-red-800 border-red-300",
  corporate: "bg-blue-100 text-blue-800 border-blue-300",
  contract: "bg-green-100 text-green-800 border-green-300",
  litigation: "bg-orange-100 text-orange-800 border-orange-300",
  intellectual_property: "bg-indigo-100 text-indigo-800 border-indigo-300",
  employment: "bg-yellow-100 text-yellow-800 border-yellow-300",
  real_estate: "bg-teal-100 text-teal-800 border-teal-300",
  other: "bg-gray-100 text-gray-800 border-gray-300"
};

const statusColors = {
  planning: "bg-slate-100 text-slate-700",
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-100 text-gray-700",
  on_hold: "bg-orange-100 text-orange-700"
};

const priorityColors = {
  low: "bg-blue-50 text-blue-700",
  medium: "bg-yellow-50 text-yellow-700",
  high: "bg-orange-50 text-orange-700",
  critical: "bg-red-50 text-red-700"
};

export default function CaseCard({ case: caseData, onClick }) {
  const isDeadlineSoon = caseData.deadline && 
    new Date(caseData.deadline) - new Date() < 30 * 24 * 60 * 60 * 1000;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${caseTypeColors[caseData.case_type]} border font-medium`}>
                {caseData.case_type?.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge className={statusColors[caseData.status]}>
                {caseData.status}
              </Badge>
              {caseData.priority === 'high' || caseData.priority === 'critical' ? (
                <Badge className={priorityColors[caseData.priority]}>
                  {caseData.priority}
                </Badge>
              ) : null}
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
              {caseData.title}
            </CardTitle>
            {caseData.case_number && (
              <p className="text-sm text-gray-500 mt-1 font-mono">
                {caseData.case_number}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {caseData.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {caseData.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          {caseData.filing_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Filed</div>
                <div className="font-medium text-gray-700">
                  {format(new Date(caseData.filing_date), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          )}

          {caseData.deadline && (
            <div className={`flex items-center gap-2 text-sm ${isDeadlineSoon ? 'text-red-600' : ''}`}>
              <AlertCircle className={`w-4 h-4 ${isDeadlineSoon ? 'text-red-500' : 'text-gray-400'}`} />
              <div>
                <div className="text-xs text-gray-500">Deadline</div>
                <div className="font-medium">
                  {format(new Date(caseData.deadline), 'MMM d, yyyy')}
                </div>
              </div>
            </div>
          )}

          {caseData.estimated_cost && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Est. Cost</div>
                <div className="font-medium text-gray-700">
                  ${caseData.estimated_cost.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {caseData.attorney_name && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Attorney</div>
                <div className="font-medium text-gray-700 truncate">
                  {caseData.attorney_name}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClick(caseData)}
            className="group"
          >
            View Details
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {caseData.tags && caseData.tags.length > 0 && (
            <div className="flex gap-1">
              {caseData.tags.slice(0, 2).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}