import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NetworkHistory({ history, isLoading }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          Test History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32 bg-gray-700" />
                    <Skeleton className="h-3 w-24 bg-gray-700" />
                  </div>
                  <Skeleton className="h-4 w-4 bg-gray-700 rounded-full" />
                </div>
              ))
            ) : history.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    <Clock className="mx-auto w-10 h-10 mb-2"/>
                    <p>No tests run yet.</p>
                </div>
            ) : history.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {item.target}
                    <Badge variant="secondary" className="bg-gray-700 text-gray-300">{item.test_type.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    {formatDistanceToNow(new Date(item.created_date), { addSuffix: true })}
                  </p>
                </div>
                {getStatusIcon(item.status)}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}