import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Share2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function SharedResources() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: shares = [], isLoading } = useQuery({
    queryKey: ['shares'],
    queryFn: () => base44.entities.ResourceShare.filter({ toUserId: user?.id }),
    enabled: !!user,
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['shared-resources'],
    queryFn: async () => {
      const resourceIds = shares.map(s => s.resourceId);
      if (resourceIds.length === 0) return [];
      const allResources = await base44.entities.ResourceLocation.list();
      return allResources.filter(r => resourceIds.includes(r.id));
    },
    enabled: shares.length > 0,
  });

  const markReadMutation = useMutation({
    mutationFn: async (shareId) => {
      await base44.entities.ResourceShare.update(shareId, {
        readAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shares']);
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const unreadShares = shares.filter(s => !s.readAt);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Shared Resources</h1>
        <p className="text-slate-600">Resources shared with you by other users</p>
      </div>

      {unreadShares.length > 0 && (
        <Badge variant="default" className="mb-4">
          {unreadShares.length} new share{unreadShares.length > 1 ? 's' : ''}
        </Badge>
      )}

      {shares.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Share2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">No resources shared with you yet</p>
            <Link to={createPageUrl("ResourceMap")}>
              <Button>Explore Resources</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {shares.map((share) => {
            const resource = resources.find(r => r.id === share.resourceId);
            if (!resource) return null;

            return (
              <Card key={share.id} className={!share.readAt ? 'border-blue-500 border-2' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{resource.name}</CardTitle>
                      {share.message && (
                        <p className="text-sm text-slate-600 mb-2 italic">
                          "{share.message}"
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Shared {new Date(share.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    {!share.readAt && (
                      <Badge variant="default" className="ml-2">New</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Link to={`/resource/${resource.id}`} className="flex-1">
                      <Button 
                        className="w-full"
                        onClick={() => markReadMutation.mutate(share.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Resource
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}