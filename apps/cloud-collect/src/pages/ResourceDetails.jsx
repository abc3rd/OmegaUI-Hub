import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Droplet, Wifi, Plug, Home, ShowerHead, UtensilsCrossed, Battery,
  Package, Heart, BookOpen, Building2, MapPin, Navigation, ThumbsUp,
  ThumbsDown, Share2, Flag, ArrowLeft, Loader2, AlertCircle, CheckCircle
} from "lucide-react";
import { toast } from "sonner";

const resourceIcons = {
  water_spigot: { icon: Droplet, color: "bg-blue-500", label: "Water" },
  wifi_hotspot: { icon: Wifi, color: "bg-purple-500", label: "WiFi" },
  electrical_outlet: { icon: Plug, color: "bg-yellow-500", label: "Power" },
  tent_spot: { icon: Home, color: "bg-green-500", label: "Tent Spot" },
  shower: { icon: ShowerHead, color: "bg-cyan-500", label: "Shower" },
  restroom: { icon: Building2, color: "bg-slate-500", label: "Restroom" },
  food: { icon: UtensilsCrossed, color: "bg-orange-500", label: "Food" },
  charging_station: { icon: Battery, color: "bg-amber-500", label: "Charging" },
  laundry: { icon: Package, color: "bg-indigo-500", label: "Laundry" },
  storage: { icon: Package, color: "bg-gray-500", label: "Storage" },
  medical: { icon: Heart, color: "bg-red-500", label: "Medical" },
  library: { icon: BookOpen, color: "bg-teal-500", label: "Library" },
  shelter: { icon: Building2, color: "bg-rose-500", label: "Shelter" },
  other: { icon: MapPin, color: "bg-slate-400", label: "Other" }
};

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [flagReason, setFlagReason] = useState("");

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: resource, isLoading } = useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const resources = await base44.entities.ResourceLocation.filter({ id });
      return resources[0];
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (voteType) => {
      const updates = voteType === 'up' 
        ? { upvotes: (resource.upvotes || 0) + 1 }
        : { downvotes: (resource.downvotes || 0) + 1 };
      await base44.entities.ResourceLocation.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['resource', id]);
      toast.success('Thanks for your feedback!');
    }
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const users = await base44.asServiceRole.entities.User.filter({ email: shareEmail });
      if (users.length === 0) {
        throw new Error('User not found');
      }
      await base44.entities.ResourceShare.create({
        resourceId: id,
        fromUserId: user.id,
        toUserId: users[0].id,
        message: shareMessage
      });
    },
    onSuccess: () => {
      toast.success('Resource shared successfully!');
      setShowShareModal(false);
      setShareEmail("");
      setShareMessage("");
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to share resource');
    }
  });

  const flagMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ResourceLocation.update(id, {
        status: 'flagged',
        flagReason,
        flaggedBy: user.id,
        flaggedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast.success('Resource flagged for review');
      setShowFlagModal(false);
      setFlagReason("");
      queryClient.invalidateQueries(['resource', id]);
    }
  });

  const getDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${resource.latitude},${resource.longitude}`;
    window.open(url, '_blank');
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/resource/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Resource not found or you don't have permission to view it.</AlertDescription>
        </Alert>
        <Link to={createPageUrl("ResourceMap")}>
          <Button className="mt-4">Back to Map</Button>
        </Link>
      </div>
    );
  }

  const { icon: Icon, color, label } = resourceIcons[resource.type] || resourceIcons.other;
  const isOwner = user && resource.createdByUserId === user.id;
  const isAdmin = user && user.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(createPageUrl('ResourceMap'))} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Map
      </Button>

      <Card className="overflow-hidden">
        {resource.photoUrls && resource.photoUrls[0] && (
          <img 
            src={resource.photoUrls[0]} 
            alt={resource.name}
            className="w-full h-64 md:h-96 object-cover"
          />
        )}

        <CardContent className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-3xl font-bold text-slate-800">{resource.name}</h1>
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className={color}>{label}</Badge>
              {resource.isVerified && (
                <Badge variant="outline" className="border-green-500 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" /> Verified
                </Badge>
              )}
              {resource.status === 'flagged' && (
                <Badge variant="destructive">Flagged</Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {resource.description && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">About</h3>
              <p className="text-slate-700">{resource.description}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {resource.address && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Address</h4>
                <p className="text-slate-600">{resource.address}</p>
                {resource.city && <p className="text-slate-600">{resource.city}, {resource.state}</p>}
              </div>
            )}

            {resource.hours && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Hours</h4>
                <p className="text-slate-600">{resource.hours}</p>
              </div>
            )}

            {resource.phone && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Phone</h4>
                <a href={`tel:${resource.phone}`} className="text-blue-600 hover:underline">{resource.phone}</a>
              </div>
            )}

            {resource.website && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Website</h4>
                <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Visit Website
                </a>
              </div>
            )}

            {resource.managerName && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Contact</h4>
                <p className="text-slate-600">{resource.managerName}</p>
                {resource.managerContact && <p className="text-slate-600">{resource.managerContact}</p>}
              </div>
            )}

            {resource.costInfo && (
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Cost</h4>
                <p className="text-slate-600">{resource.costInfo}</p>
              </div>
            )}
          </div>

          {resource.accessNotes && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Access Information</h4>
              <p className="text-slate-600">{resource.accessNotes}</p>
            </div>
          )}

          {resource.tips && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                <span className="font-semibold">💡 Community Tips:</span> {resource.tips}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="grid md:grid-cols-2 gap-3 pt-4">
            <Button onClick={getDirections} className="h-12">
              <Navigation className="w-5 h-5 mr-2" />
              Get Directions
            </Button>
            <Button variant="outline" onClick={() => setShowShareModal(true)} className="h-12">
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>

          {/* Voting */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1 h-12"
              onClick={() => voteMutation.mutate('up')}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Helpful ({resource.upvotes || 0})
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 h-12"
              onClick={() => voteMutation.mutate('down')}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Not Helpful ({resource.downvotes || 0})
            </Button>
          </div>

          {/* Moderation */}
          {!isOwner && resource.status !== 'flagged' && (
            <Button 
              variant="ghost" 
              onClick={() => setShowFlagModal(true)}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Flag className="w-4 h-4 mr-2" />
              Flag Resource
            </Button>
          )}

          {(isOwner || isAdmin) && (
            <div className="pt-4 border-t">
              <Link to={createPageUrl(`EditResource?id=${id}`)}>
                <Button variant="outline" className="w-full">Edit Resource</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Share Resource</h3>
              
              <div className="space-y-3">
                <Button variant="outline" onClick={copyShareLink} className="w-full">
                  Copy Link
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or share with user</span>
                  </div>
                </div>

                <Input
                  placeholder="User's email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                />
                
                <Textarea
                  placeholder="Add a message (optional)"
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowShareModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => shareMutation.mutate()} 
                  disabled={!shareEmail || shareMutation.isPending}
                  className="flex-1"
                >
                  {shareMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Share'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-bold">Flag Resource</h3>
              
              <Textarea
                placeholder="Why are you flagging this resource?"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                rows={4}
              />

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowFlagModal(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => flagMutation.mutate()} 
                  disabled={!flagReason || flagMutation.isPending}
                  className="flex-1"
                >
                  {flagMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Flag'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}