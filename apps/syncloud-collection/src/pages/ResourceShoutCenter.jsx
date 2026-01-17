import React, { useState, useEffect } from 'react';
import { EstablishmentProfile } from '@/entities/EstablishmentProfile';
import { AuthorizedUser } from '@/entities/AuthorizedUser';
import { ResourceShout } from '@/entities/ResourceShout';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Megaphone, 
  Shield, 
  Clock,
  CheckCircle,
  Plus,
  Send
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { sendResourceShout } from '@/functions/sendResourceShout';

export default function ResourceShoutCenter() {
  const [user, setUser] = useState(null);
  const [authorizations, setAuthorizations] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [recentShouts, setRecentShouts] = useState([]);
  const [showShoutForm, setShowShoutForm] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shoutForm, setShoutForm] = useState({
    shout_type: 'food_available',
    title: '',
    message: '',
    urgency_level: 'medium',
    location_description: '',
    start_time: '',
    end_time: '',
    contact_phone: '',
    broadcast_radius: 5,
    resources_available: [{ resource_type: 'food', quantity: '', description: '' }]
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Load user's authorizations
      const userAuths = await AuthorizedUser.filter({
        user_email: userData.email,
        verification_status: 'verified',
        is_active: true
      });
      setAuthorizations(userAuths);

      // Load establishments for authorized user
      if (userAuths.length > 0) {
        const establishmentIds = userAuths.map(auth => auth.establishment_id);
        const establishmentData = await Promise.all(
          establishmentIds.map(id => EstablishmentProfile.get(id).catch(() => null))
        );
        setEstablishments(establishmentData.filter(Boolean));

        // Load recent shouts from user's establishments
        const recentShoutsData = await ResourceShout.filter(
          { establishment_id: { $in: establishmentIds } },
          '-created_date',
          10
        );
        setRecentShouts(recentShoutsData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load authorization data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendShout = async () => {
    if (!selectedEstablishment) {
      toast.error('Please select an establishment');
      return;
    }

    if (!shoutForm.title || !shoutForm.message || !shoutForm.start_time || !shoutForm.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await sendResourceShout({
        shoutData: {
          ...shoutForm,
          establishment_id: selectedEstablishment.id,
          location_latitude: selectedEstablishment.latitude,
          location_longitude: selectedEstablishment.longitude,
        },
        userLocation: {
          latitude: selectedEstablishment.latitude,
          longitude: selectedEstablishment.longitude
        }
      });

      if (response.data.success) {
        toast.success(`Shout sent successfully! Notified ${response.data.notifications_sent} people in the area.`);
        setShowShoutForm(false);
        setShoutForm({
          shout_type: 'food_available',
          title: '',
          message: '',
          urgency_level: 'medium',
          location_description: '',
          start_time: '',
          end_time: '',
          contact_phone: '',
          broadcast_radius: 5,
          resources_available: [{ resource_type: 'food', quantity: '', description: '' }]
        });
        loadUserData(); // Refresh data
      }
    } catch (error) {
      console.error('Error sending shout:', error);
      toast.error('Failed to send shout. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your authorizations...</p>
        </div>
      </div>
    );
  }

  if (authorizations.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Resource Shout Center</h1>
          <p className="text-muted-foreground mb-6">
            You are not currently authorized to send resource shouts. To get started, your establishment needs to be verified and you need to be added as an authorized user.
          </p>
          <div className="bg-muted p-6 rounded-lg">
            <h3 className="font-semibold mb-3">How to Get Authorized:</h3>
            <ol className="text-left space-y-2 text-sm">
              <li>1. Have your establishment register and submit verification documents</li>
              <li>2. Wait for admin verification of your establishment</li>
              <li>3. Submit your authorization request with proof of employment/volunteering</li>
              <li>4. Once approved, you can send resource shouts to help your community</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-primary" />
            Resource Shout Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Broadcast urgent resource availability to your community
          </p>
        </div>
        <Button onClick={() => setShowShoutForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Send Shout
        </Button>
      </div>

      {/* Authorization Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Your Authorizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {authorizations.map((auth) => {
                const establishment = establishments.find(e => e.id === auth.establishment_id);
                return (
                  <div key={auth.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{establishment?.name || 'Unknown Establishment'}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {auth.role} • {auth.authorization_level.replace('_', ' ')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Shouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentShouts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No shouts sent yet. Send your first resource shout to help the community!
                </p>
              ) : (
                recentShouts.slice(0, 3).map((shout) => (
                  <div key={shout.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">{shout.title}</p>
                      <Badge variant={
                        shout.urgency_level === 'critical' ? 'destructive' :
                        shout.urgency_level === 'high' ? 'destructive' :
                        shout.urgency_level === 'medium' ? 'secondary' : 'outline'
                      }>
                        {shout.urgency_level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {shout.establishment_name} • {new Date(shout.created_date).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{shout.view_count || 0} views</span>
                      <span>{shout.response_count || 0} responses</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shout Form Modal */}
      {showShoutForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Resource Shout
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Establishment</Label>
                <Select 
                  value={selectedEstablishment?.id || ''} 
                  onValueChange={(value) => {
                    const establishment = establishments.find(e => e.id === value);
                    setSelectedEstablishment(establishment);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select establishment" />
                  </SelectTrigger>
                  <SelectContent>
                    {establishments.map((establishment) => (
                      <SelectItem key={establishment.id} value={establishment.id}>
                        {establishment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Shout Type</Label>
                  <Select value={shoutForm.shout_type} onValueChange={(value) => setShoutForm({...shoutForm, shout_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency_resources">Emergency Resources</SelectItem>
                      <SelectItem value="food_available">Food Available</SelectItem>
                      <SelectItem value="shelter_available">Shelter Available</SelectItem>
                      <SelectItem value="clothing_drive">Clothing Drive</SelectItem>
                      <SelectItem value="medical_assistance">Medical Assistance</SelectItem>
                      <SelectItem value="transportation">Transportation</SelectItem>
                      <SelectItem value="general_assistance">General Assistance</SelectItem>
                      <SelectItem value="event_announcement">Event Announcement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Urgency Level</Label>
                  <Select value={shoutForm.urgency_level} onValueChange={(value) => setShoutForm({...shoutForm, urgency_level: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Title *</Label>
                <Input 
                  value={shoutForm.title}
                  onChange={(e) => setShoutForm({...shoutForm, title: e.target.value})}
                  placeholder="e.g., Free Hot Meals Available Now"
                />
              </div>

              <div>
                <Label>Message *</Label>
                <Textarea 
                  value={shoutForm.message}
                  onChange={(e) => setShoutForm({...shoutForm, message: e.target.value})}
                  placeholder="Detailed information about available resources..."
                  className="h-24"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Time *</Label>
                  <Input 
                    type="datetime-local"
                    value={shoutForm.start_time}
                    onChange={(e) => setShoutForm({...shoutForm, start_time: e.target.value})}
                  />
                </div>

                <div>
                  <Label>End Time *</Label>
                  <Input 
                    type="datetime-local"
                    value={shoutForm.end_time}
                    onChange={(e) => setShoutForm({...shoutForm, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Phone</Label>
                  <Input 
                    value={shoutForm.contact_phone}
                    onChange={(e) => setShoutForm({...shoutForm, contact_phone: e.target.value})}
                    placeholder="Emergency contact number"
                  />
                </div>

                <div>
                  <Label>Broadcast Radius (miles)</Label>
                  <Input 
                    type="number"
                    min="1"
                    max={selectedEstablishment?.max_shout_radius || 25}
                    value={shoutForm.broadcast_radius}
                    onChange={(e) => setShoutForm({...shoutForm, broadcast_radius: parseInt(e.target.value) || 5})}
                  />
                </div>
              </div>

              <div>
                <Label>Location Description</Label>
                <Input 
                  value={shoutForm.location_description}
                  onChange={(e) => setShoutForm({...shoutForm, location_description: e.target.value})}
                  placeholder="Specific location details (parking, entrance, etc.)"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowShoutForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendShout} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send Shout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}