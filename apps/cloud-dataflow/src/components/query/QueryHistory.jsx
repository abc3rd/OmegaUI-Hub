import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, Clock, Play } from "lucide-react";
import { format } from "date-fns";

export default function QueryHistory({ queries, onQuerySelect }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" />
          Query History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {queries.length > 0 ? (
            queries.map((query) => (
              <div 
                key={query.id} 
                className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => onQuerySelect(query)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-blue-50 text-blue-700"
                    >
                      {query.query_type}
                    </Badge>
                    {query.is_saved && (
                      <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                        Saved
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
                
                <p className="text-sm font-mono text-slate-700 truncate mb-2">
                  {query.sql_query}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {query.last_executed ? format(new Date(query.last_executed), 'MMM d, h:mm a') : 'Never executed'}
                  </span>
                  {query.execution_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {query.execution_time}ms
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No query history yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}