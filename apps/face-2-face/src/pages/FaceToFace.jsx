
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Shield, Camera, Check, ArrowRight, MessageCircle,
  Fingerprint, Eye, Lock, UserPlus
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function FaceToFace() {
  const [user, setUser] = useState(null);
  const [verified, setVerified] = useState(false);
  const [connections, setConnections] = useState([]);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const verifications = await base44.entities.FacialVerification.list();
      const userVerification = verifications.find(v => 
        v.user_email === userData.email && 
        v.verification_status === 'verified'
      );
      setVerified(!!userVerification);

      // Calculate security level (1-3 based on trifecta)
      let level = 0;
      if (userVerification) level++; // Facial
      // Retina and fingerprint would add +1 each when implemented
      setSecurityLevel(level);

      // Load connections
      const allConnections = await base44.entities.Connection.list();
      const userConnections = allConnections.filter(c =>
        c.status === "accepted" &&
        (c.user_a === userData.email || c.user_b === userData.email)
      );
      setConnections(userConnections);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black metallic-text">Face to Face</h1>
          <p className="text-lg text-cyan-400 font-bold">
            Powered by Omega UI
          </p>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-semibold">
            Verified human connections. Anti-deepfake protocol. Real people only.
          </p>
        </motion.div>

        {/* Security Trifecta Status */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-blue-500/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                Security Trifecta
              </h2>
              <Badge className={`${
                securityLevel === 3 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                securityLevel > 0 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              } text-lg px-4 py-2`}>
                {securityLevel}/3 Verified
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className={`${verified ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                <CardContent className="p-6 text-center">
                  <Camera className={`w-12 h-12 mx-auto mb-3 ${verified ? 'text-green-400' : 'text-slate-500'}`} />
                  <h3 className="text-white font-bold mb-1">Facial Recognition</h3>
                  <p className="text-xs text-slate-400 mb-3">3D biometric mapping</p>
                  {verified ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Check className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Link to={createPageUrl("Profile")}>
                      <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400">
                        Setup
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <Eye className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <h3 className="text-white font-bold mb-1">Retina Scan</h3>
                  <p className="text-xs text-slate-400 mb-3">Iris pattern authentication</p>
                  <Badge className="bg-slate-700/50 text-slate-400">
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-6 text-center">
                  <Fingerprint className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <h3 className="text-white font-bold mb-1">Fingerprint</h3>
                  <p className="text-xs text-slate-400 mb-3">Physical biometric</p>
                  <Badge className="bg-slate-700/50 text-slate-400">
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-white/10">
            <TabsTrigger value="connections" className="data-[state=active]:bg-blue-500/20">
              <Users className="w-4 h-4 mr-2" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-blue-500/20">
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="handshake" className="data-[state=active]:bg-blue-500/20">
              <UserPlus className="w-4 h-4 mr-2" />
              New Handshake
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections">
            {!verified ? (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-yellow-500/20">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-blue-500/30 mb-6">
                    <Camera className="w-12 h-12 text-blue-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">Verification Required</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto mb-6">
                    Complete facial verification to start connecting with verified humans and prevent AI impersonation.
                  </p>
                  <Link to={createPageUrl("Profile")}>
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 h-12 px-8 gap-2">
                      Start Verification
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : connections.length === 0 ? (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-blue-500/20">
                <CardContent className="p-12 text-center">
                  <Users className="w-20 h-20 text-blue-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">No Connections Yet</h2>
                  <p className="text-slate-400 mb-6">
                    Create your first Digital Handshake to connect with verified humans.
                  </p>
                  <Link to={createPageUrl("Handshake")}>
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Camera className="w-4 h-4 mr-2" />
                      Create Handshake
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((connection) => (
                  <ConnectionCard 
                    key={connection.id}
                    connection={connection}
                    userEmail={user?.email}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages">
            {!verified ? (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-yellow-500/20">
                <CardContent className="p-12 text-center">
                  <Lock className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">Secure Messaging Locked</h2>
                  <p className="text-slate-400 mb-6">
                    Verification required to access encrypted, anti-deepfake messaging.
                  </p>
                  <Link to={createPageUrl("Profile")}>
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
                      Complete Verification
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <MessagesInterface connections={connections} currentUser={user} />
            )}
          </TabsContent>

          <TabsContent value="handshake">
            {!verified ? (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-red-500/20">
                <CardContent className="p-12 text-center">
                  <Shield className="w-20 h-20 text-red-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">Verification Required First</h2>
                  <p className="text-slate-400 mb-6">
                    You must complete facial verification before creating handshakes.
                  </p>
                  <Link to={createPageUrl("Profile")}>
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
                      Get Verified
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-blue-500/20">
                <CardContent className="p-12 text-center">
                  <Camera className="w-20 h-20 text-blue-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-4">Create Digital Handshake</h2>
                  <p className="text-slate-400 mb-6">
                    Meet someone face-to-face and create a verified connection that can never be faked.
                  </p>
                  <Link to={createPageUrl("Handshake")}>
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 h-12 px-8">
                      Start Handshake Process
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Why This Matters */}
        <Card className="bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-blue-900/20 border-indigo-500/30">
          <CardContent className="p-8">
            <h3 className="text-2xl font-black metallic-text mb-6 text-center">
              Why Omega UI's Face to Face Security Matters
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Shield className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h4 className="font-bold text-white mb-2">No AI Can Fake You</h4>
                <p className="text-sm text-gray-300 font-medium">
                  Three layers of biometric verification ensure you're always you. No deepfakes, no impersonation.
                </p>
              </div>
              <div className="text-center">
                <Lock className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h4 className="font-bold text-white mb-2">Social Media Integration</h4>
                <p className="text-sm text-gray-300 font-medium">
                  Link your verified identity across all platforms. One verification, universal trust.
                </p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <h4 className="font-bold text-white mb-2">Real Human Network</h4>
                <p className="text-sm text-gray-300 font-medium">
                  Build connections with verified humans only. No bots. No fakes. Just real people.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
    <Card className="bg-slate-900/50 border-white/10 hover:border-blue-500/30 transition-all">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black text-white">
          {friend?.full_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <h3 className="font-bold text-white mb-1">{friend?.full_name || 'User'}</h3>
        <p className="text-xs text-slate-400 mb-4">{friend?.bio || "Verified Human"}</p>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-3">
          <Check className="w-3 h-3 mr-1" />
          Verified
        </Badge>
        <Link to={createPageUrl("Messages")}>
          <Button variant="outline" size="sm" className="w-full border-blue-500/30 text-blue-400">
            <MessageCircle className="w-3 h-3 mr-2" />
            Message
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function MessagesInterface({ connections, currentUser }) {
  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-blue-500/20">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            Secure Messages
          </h2>
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Lock className="w-3 h-3 mr-1" />
            Encrypted
          </Badge>
        </div>
        
        {connections.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No connections yet. Create a handshake to start messaging.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.slice(0, 5).map((connection) => (
              <MessagePreview 
                key={connection.id}
                connection={connection}
                userEmail={currentUser?.email}
              />
            ))}
            <Link to={createPageUrl("Messages")}>
              <Button variant="outline" className="w-full border-blue-500/30 text-blue-400 mt-4">
                View All Messages
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MessagePreview({ connection, userEmail }) {
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
    <Link to={createPageUrl("Messages")}>
      <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/30 transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
              {friend?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{friend?.full_name || 'User'}</p>
              <p className="text-sm text-slate-400">Click to start secure chat</p>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
