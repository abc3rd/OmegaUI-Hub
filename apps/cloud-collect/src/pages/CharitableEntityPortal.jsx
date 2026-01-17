import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Calendar, Plus, Settings, Eye, Loader2 } from "lucide-react";

export default function CharitableEntityPortal() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: myResources = [] } = useQuery({
    queryKey: ['my-resources', user?.id],
    queryFn: () => base44.entities.ResourceLocation.filter({ createdByUserId: user.id }),
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#4bce2a]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4bce2a] to-[#2699fe] rounded-2xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {user?.organizationName || "Charitable Entity Portal"}
            </h1>
            <p className="text-slate-600">
              {user?.organizationType?.replace('_', ' ') || "Organization"} Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 border-[#4bce2a]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Posted Resources</p>
                <p className="text-3xl font-bold text-[#4bce2a]">{myResources.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-[#4bce2a]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Events</p>
                <p className="text-3xl font-bold text-slate-700">
                  {myResources.filter(r => r.type === 'food' || r.type === 'other').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Community Views</p>
                <p className="text-3xl font-bold text-slate-700">
                  {myResources.reduce((sum, r) => sum + (r.upvotes || 0), 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to={createPageUrl("AddResource")}>
          <Card className="border-2 border-slate-200 hover:border-[#4bce2a] hover:shadow-lg transition-all cursor-pointer group h-full">
            <CardHeader>
              <div className="w-12 h-12 bg-[#4bce2a] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Post a New Resource</CardTitle>
              <CardDescription>
                Share a location, event, or service with the community
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link to={createPageUrl("ResourceMap")}>
          <Card className="border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group h-full">
            <CardHeader>
              <div className="w-12 h-12 bg-[#2699fe] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <CardTitle>View Resource Map</CardTitle>
              <CardDescription>
                See all community resources and your posted locations
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Card className="border-2 border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer group h-full">
          <CardHeader>
            <div className="w-12 h-12 bg-[#ea00ea] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Organization Settings</CardTitle>
            <CardDescription>
              Update your organization name, type, and contact info
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Posted Resources */}
      {myResources.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Your Posted Resources</CardTitle>
            <CardDescription>
              Manage your organization's resources and events on the map
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myResources.map((resource) => (
                <div key={resource.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800">{resource.name}</h4>
                      <p className="text-sm text-slate-600">{resource.type?.replace('_', ' ')}</p>
                      {resource.address && (
                        <p className="text-xs text-slate-500 mt-1">{resource.address}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">
                        👍 {resource.upvotes || 0}
                      </span>
                      <Link to={createPageUrl("ResourceMap")}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started */}
      {myResources.length === 0 && (
        <Card className="mt-8 border-2 border-[#4bce2a] bg-green-50">
          <CardContent className="p-8 text-center">
            <MapPin className="w-16 h-16 text-[#4bce2a] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Get Started
            </h3>
            <p className="text-slate-700 mb-6">
              Share your first resource with the community. Post your location, 
              food giveaway events, or support services to help those in need.
            </p>
            <Link to={createPageUrl("AddResource")}>
              <Button size="lg" className="bg-[#4bce2a] hover:bg-green-600">
                <Plus className="w-5 h-5 mr-2" />
                Post Your First Resource
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}