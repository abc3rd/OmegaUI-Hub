import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Map,
  MapPin,
  Users,
  ArrowRight,
  Heart,
  Star,
  Navigation
} from 'lucide-react';
import { UtilitySpot } from '@/entities/UtilitySpot';

export default function CommunityOverview() {
  const [communityStats, setCommunityStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityStats();
  }, []);

  const loadCommunityStats = async () => {
    try {
      const spots = await UtilitySpot.list();
      
      const activeSpots = spots.filter(s => s.status === 'active');
      const utilityTypes = [...new Set(spots.map(s => s.utility_type))];
      const totalVotes = spots.reduce((sum, spot) => sum + (spot.upvotes || 0) + (spot.downvotes || 0), 0);
      
      setCommunityStats({
        totalSpots: spots.length,
        activeSpots: activeSpots.length,
        utilityTypes: utilityTypes.length,
        totalVotes: totalVotes
      });
    } catch (error) {
      console.error('Failed to load community stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
          <Map className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Community</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and share essential community resources through our collaborative utility mapping platform. 
            Find power outlets, WiFi spots, restrooms, and more shared by community members.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">Community Mapping</Badge>
          <Badge className="bg-indigo-100 text-indigo-800">Resource Sharing</Badge>
          <Badge className="bg-blue-100 text-blue-800">Collaborative Platform</Badge>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Spots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : communityStats.totalSpots}</div>
                <div className="text-xs text-green-600">{communityStats.activeSpots} verified</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Utility Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Navigation className="w-8 h-8 text-indigo-500" />
              <div className="text-2xl font-bold">{loading ? '...' : communityStats.utilityTypes}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Community Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              <div className="text-2xl font-bold">{loading ? '...' : communityStats.totalVotes}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Platform Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <div className="text-xs text-muted-foreground">Growing community</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            What is Community?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Community is a collaborative platform where users can discover and share essential utility locations 
            in their area. Whether you need a power outlet, WiFi access, restroom, or shelter, our community-driven 
            map helps you find what you need while contributing to help others.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Platform Features:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Interactive utility mapping</li>
                <li>• Community-verified locations</li>
                <li>• Multiple utility types supported</li>
                <li>• Upvote/downvote verification system</li>
                <li>• Real-time location sharing</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Digital nomads and remote workers</li>
                <li>• Students studying off-campus</li>
                <li>• Travelers and tourists</li>
                <li>• Community members helping others</li>
                <li>• Anyone needing emergency resources</li>
                <li>• Local business owners</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Community Tools</h2>
        <div className="grid md:grid-cols-1 gap-6">
          <Link to={createPageUrl('CommunityMap')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    Utilities Map
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Discover and share essential utility locations in your community. Find power outlets, WiFi spots, 
                  restrooms, water fountains, and other resources shared by community members. Contribute by adding 
                  new locations and verifying existing ones through our upvote system.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Interactive Map</Badge>
                  <Badge variant="outline">Community Verified</Badge>
                  <Badge variant="outline">Multiple Utilities</Badge>
                  <Badge variant="outline">Real-Time Updates</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Utility Types */}
      <Card>
        <CardHeader>
          <CardTitle>Supported Utility Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="font-medium mb-2">Power Outlets</h4>
              <p className="text-sm text-muted-foreground">Free electrical outlets in public spaces, cafes, and libraries</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📶</span>
              </div>
              <h4 className="font-medium mb-2">WiFi Access</h4>
              <p className="text-sm text-muted-foreground">Free WiFi hotspots and internet access points</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🚻</span>
              </div>
              <h4 className="font-medium mb-2">Restrooms</h4>
              <p className="text-sm text-muted-foreground">Public restroom facilities and accessible locations</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">💧</span>
              </div>
              <h4 className="font-medium mb-2">Water Sources</h4>
              <p className="text-sm text-muted-foreground">Drinking fountains and water refill stations</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏠</span>
              </div>
              <h4 className="font-medium mb-2">Shelter</h4>
              <p className="text-sm text-muted-foreground">Weather protection and safe waiting areas</p>
            </div>
            <div className="text-center p-4 border border-border rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🍕</span>
              </div>
              <h4 className="font-medium mb-2">Food</h4>
              <p className="text-sm text-muted-foreground">Restaurants, food courts, and dining locations</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>How Community Mapping Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Discover</h4>
              <p className="text-sm text-muted-foreground">Browse the interactive map to find utilities near you</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Verify</h4>
              <p className="text-sm text-muted-foreground">Upvote accurate locations and downvote outdated ones</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Contribute</h4>
              <p className="text-sm text-muted-foreground">Add new utility spots you discover in your community</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Share</h4>
              <p className="text-sm text-muted-foreground">Help others by maintaining accurate, up-to-date information</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-blue-500" />
              Community Driven
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Powered by community contributions and verification. The more people participate, 
              the more accurate and comprehensive our utility map becomes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-purple-500" />
              Real-Time Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get the most current information about utility availability. Community voting 
              ensures that outdated or incorrect information is quickly identified and updated.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-red-500" />
              Helping Others
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Every contribution helps someone in need find essential resources. Build a more 
              connected and supportive community by sharing what you know.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Community</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Explore the Map</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Start by browsing utility spots in your area. Use the filters to find exactly 
                what you need, whether it's power, WiFi, or restrooms.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Add Your First Spot</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Contribute to the community by adding a utility spot you know about. 
                Include helpful details and photos to make it useful for others.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('CommunityMap')}>Explore Map</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('CommunityMap')}>Add First Spot</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}