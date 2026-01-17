import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Check, X, MapPin, Clock, Sparkles, Search, Camera } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ConnectionStats from "../components/circle/ConnectionStats";

export default function Circle() {
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const allConnections = await base44.entities.Connection.list("-created_date");
      
      const pending = allConnections.filter(c => 
        c.user_b === userData.email && c.status === "pending"
      );
      setPendingRequests(pending);

      const accepted = allConnections.filter(c =>
        (c.user_a === userData.email || c.user_b === userData.email) && 
        c.status === "accepted"
      );
      setConnections(accepted);
    } catch (error) {
      console.error("Error loading circle data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      await base44.entities.Connection.update(connectionId, { status: "accepted" });
      loadData();
    } catch (error) {
      console.error("Error accepting connection:", error);
      alert("Error accepting connection. Please try again.");
    }
  };

  const handleDecline = async (connectionId) => {
    try {
      await base44.entities.Connection.update(connectionId, { status: "declined" });
      loadData();
    } catch (error) {
      console.error("Error declining connection:", error);
      alert("Error declining connection. Please try again.");
    }
  };

  const filteredConnections = connections.filter(conn => {
    if (!searchQuery || !user) return true;
    const friendEmail = conn.user_a === user.email ? conn.user_b : conn.user_a;
    return friendEmail.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const recentConnection = connections.length > 0 
    ? format(new Date(connections[0].created_date), "MMM d")
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="text-4xl font-bold text-[#0A1628] tracking-tight">My Circle</h1>
          </div>
          <p className="text-slate-600 font-medium">
            Your verified, face-to-face connections
          </p>
        </motion.div>

        {!loading && (
          <ConnectionStats 
            totalConnections={connections.length}
            recentConnection={recentConnection}
          />
        )}

        {pendingRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#0A1628] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              Pending Requests ({pendingRequests.length})
            </h2>
            <AnimatePresence>
              {pendingRequests.map((request) => (
                <ConnectionRequest 
                  key={request.id}
                  request={request}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-bold text-[#0A1628] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              Connected ({connections.length})
            </h2>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search your circle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-[#D4AF37]"
                />
              </div>
              <Link to={createPageUrl("Handshake")}>
                <Button className="bg-gradient-to-r from-[#0A1628] to-[#1a2942] hover:shadow-lg gap-2">
                  <Camera className="w-4 h-4" />
                  <span className="hidden md:inline">New Handshake</span>
                </Button>
              </Link>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1628] mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading your circle...</p>
            </div>
          ) : connections.length === 0 ? (
            <Card className="border-slate-200/60 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                  <Users className="w-10 h-10 text-[#D4AF37]" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1628] mb-2">No connections yet</h3>
                <p className="text-slate-600 mb-6">
                  Create your first Digital Handshake to start building your Circle
                </p>
                <Link to={createPageUrl("Handshake")}>
                  <Button className="bg-gradient-to-r from-[#0A1628] to-[#1a2942] hover:shadow-lg gap-2">
                    <Camera className="w-4 h-4" />
                    Create Handshake
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredConnections.map((connection) => (
                  <ConnectionCard 
                    key={connection.id}
                    connection={connection}
                    userEmail={user?.email}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConnectionRequest({ request, onAccept, onDecline }) {
  const [requester, setRequester] = useState(null);

  useEffect(() => {
    loadRequester();
  }, []);

  const loadRequester = async () => {
    try {
      const allUsers = await base44.entities.User.list();
      const user = allUsers.find(u => u.email === request.user_a);
      if (user) setRequester(user);
    } catch (error) {
      console.error("Error loading requester:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <Card className="border-[#D4AF37]/30 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex gap-4 items-start">
            <Avatar className="h-16 w-16 border-2 border-[#D4AF37]/30">
              <AvatarImage src={requester?.profile_photo_url} />
              <AvatarFallback className="bg-gradient-to-br from-[#0A1628] to-[#1a2942] text-white text-xl font-bold">
                {requester?.full_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold text-lg text-[#0A1628]">{requester?.full_name || 'User'}</h3>
                <p className="text-sm text-slate-600">wants to connect with you</p>
              </div>

              {request.verification_photo_url && (
                <img 
                  src={request.verification_photo_url}
                  alt="Verification"
                  className="w-full rounded-xl shadow-lg"
                />
              )}

              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                  <MapPin className="w-3 h-3" />
                  {request.meeting_location}
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3" />
                  {format(new Date(request.meeting_timestamp), "MMM d, h:mm a")}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => onAccept(request.id)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg gap-2"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </Button>
                <Button
                  onClick={() => onDecline(request.id)}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 gap-2"
                >
                  <X className="w-4 h-4" />
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ConnectionCard({ connection, userEmail }) {
  const [friend, setFriend] = useState(null);

  useEffect(() => {
    loadFriend();
  }, []);

  const loadFriend = async () => {
    try {
      const friendEmail = connection.user_a === userEmail ? connection.user_b : connection.user_a;
      const allUsers = await base44.entities.User.list();
      const friendUser = allUsers.find(u => u.email === friendEmail);
      if (friendUser) setFriend(friendUser);
    } catch (error) {
      console.error("Error loading friend:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      layout
    >
      <Card className="border-slate-200/60 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Avatar className="h-20 w-20 border-4 border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60 transition-all">
              <AvatarImage src={friend?.profile_photo_url} />
              <AvatarFallback className="bg-gradient-to-br from-[#0A1628] to-[#1a2942] text-white text-2xl font-bold">
                {friend?.full_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-bold text-lg text-[#0A1628]">{friend?.full_name || 'User'}</h3>
              <p className="text-sm text-slate-600 line-clamp-2">{friend?.bio || "No bio yet"}</p>
            </div>

            <Badge className="bg-green-100 text-green-700 border-green-200">
              Connected
            </Badge>

            <div className="flex flex-col gap-1 text-xs text-slate-600 w-full pt-2 border-t border-slate-100">
              <div className="flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                Met at {connection.meeting_location}
              </div>
              <div className="flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                {format(new Date(connection.meeting_timestamp), "MMM d, yyyy")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}