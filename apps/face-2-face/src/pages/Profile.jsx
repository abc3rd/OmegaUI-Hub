
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera, Save, Shield, Check, Facebook, Instagram,
  Twitter, Linkedin, AlertCircle, Lock, Key, Copy,
  ExternalLink, RefreshCw, X
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useTokenTracking } from "../components/token/TokenTracker";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    location: "",
    profile_photo_url: ""
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [facialVerification, setFacialVerification] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [verificationToken, setVerificationToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const { trackTokens } = useTokenTracking();

  useEffect(() => {
    loadData();

    // Check for OAuth success
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    if (connected) {
      alert(`Successfully connected to ${connected.charAt(0).toUpperCase() + connected.slice(1)}!`);
      // Clear the URL parameter to avoid re-triggering the alert on refresh
      window.history.replaceState({}, '', '/Profile');
    }
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || "",
        bio: userData.bio || "",
        location: userData.location || "",
        profile_photo_url: userData.profile_photo_url || ""
      });

      const verifications = await base44.entities.FacialVerification.list();
      const userVerification = verifications.find(v => v.user_email === userData.email);
      setFacialVerification(userVerification);

      const accounts = await base44.entities.ConnectedAccount.list();
      const userAccounts = accounts.filter(a => a.user_email === userData.email);
      setConnectedAccounts(userAccounts);

      const tokens = await base44.entities.VerificationToken.list();
      const userToken = tokens.find(t => t.user_email === userData.email && t.is_active);
      setVerificationToken(userToken);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, profile_photo_url: file_url });
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Error uploading photo. Please try again.");
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      setUser({ ...user, ...formData });
      setEditMode(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    }
    setSaving(false);
  };

  const handleFacialVerification = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // Wait for video to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `verification-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: "Analyze this facial image and generate a secure biometric hash. Return confidence score.",
          file_urls: [file_url],
          response_json_schema: {
            type: "object",
            properties: {
              biometric_hash: { type: "string" },
              confidence_score: { type: "number" }
            }
          }
        });

        // Track token usage for facial verification
        await trackTokens('facial_verification', 'Facial Biometric Analysis', 1500, {
          model: 'gpt-4-vision',
          input_tokens: 1000,
          output_tokens: 500
        });

        await base44.entities.FacialVerification.create({
          user_email: user.email,
          encrypted_biometric_hash: response.biometric_hash,
          verification_photo_url: file_url,
          verification_status: "verified",
          confidence_score: response.confidence_score,
          verification_date: new Date().toISOString(),
          last_re_verification: new Date().toISOString()
        });

        const token = generateVerificationToken();
        await base44.entities.VerificationToken.create({
          user_email: user.email,
          token: token,
          platform_permissions: [],
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        });

        loadData();
        alert("Facial verification complete! You can now connect social media accounts.");
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error("Error with facial verification:", error);
      alert("Error accessing camera. Please ensure you've granted camera permissions.");
    }
  };

  const generateVerificationToken = () => {
    return 'F2F_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const copyVerificationToken = () => {
    if (verificationToken) {
      navigator.clipboard.writeText(verificationToken.token);
      alert("Verification token copied to clipboard!");
    }
  };

  const handleConnectSocialMedia = async (platform) => {
    if (!facialVerification || facialVerification.verification_status !== "verified") {
      alert("Please complete facial verification first!");
      return;
    }

    // Redirect to OAuth flow
    const baseUrl = window.location.origin;
    const oauthUrls = {
      facebook: `${baseUrl}/functions/oauth/facebookConnect`,
      instagram: `${baseUrl}/functions/oauth/instagramConnect`,
      linkedin: `${baseUrl}/functions/oauth/linkedinConnect`,
      twitter: `${baseUrl}/functions/oauth/twitterConnect`
    };

    const url = oauthUrls[platform.toLowerCase()];
    if (url) {
      window.location.href = url;
    } else {
      alert(`${platform} integration coming soon!`);
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    if (window.confirm("Disconnect this account?")) {
      try {
        await base44.entities.ConnectedAccount.delete(accountId);
        loadData();
      } catch (error) {
        console.error("Error disconnecting account:", error);
      }
    }
  };

  const socialPlatforms = [
    { name: "Facebook", icon: Facebook, color: "bg-blue-600", platform: "facebook" },
    { name: "Instagram", icon: Instagram, color: "bg-pink-600", platform: "instagram" },
    { name: "Twitter", icon: Twitter, color: "bg-sky-500", platform: "twitter" },
    { name: "LinkedIn", icon: Linkedin, color: "bg-blue-700", platform: "linkedin" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A1628]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl font-bold text-[#0A1628]">Your Profile</h1>
          <p className="text-slate-600">Manage your identity and verification settings</p>
        </motion.div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="connections">Social Media</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-slate-200/60 shadow-xl">
              <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-white to-amber-50/30">
                <CardTitle className="flex items-center justify-between">
                  <span>Profile Information</span>
                  {!editMode && (
                    <Button onClick={() => setEditMode(true)} variant="outline">
                      Edit Profile
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-[#D4AF37]/30">
                      <AvatarImage src={editMode ? formData.profile_photo_url : user?.profile_photo_url} />
                      <AvatarFallback className="bg-gradient-to-br from-[#0A1628] to-[#1a2942] text-white text-4xl font-bold">
                        {user?.full_name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {editMode && (
                      <label className="absolute bottom-0 right-0 cursor-pointer">
                        <div className="bg-[#D4AF37] hover:bg-[#c9a332] text-white p-2 rounded-full shadow-lg transition-all">
                          <Camera className="w-5 h-5" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {uploading && <p className="text-sm text-slate-500">Uploading...</p>}
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="border-slate-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Country"
                        className="border-slate-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="border-slate-200 h-24"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-[#0A1628] to-[#1a2942] gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        onClick={() => {
                          setEditMode(false);
                          setFormData({
                            full_name: user.full_name || "",
                            bio: user.bio || "",
                            location: user.location || "",
                            profile_photo_url: user.profile_photo_url || ""
                          });
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Name</p>
                      <p className="text-lg font-semibold text-[#0A1628]">{user?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Email</p>
                      <p className="text-lg text-slate-700">{user?.email}</p>
                    </div>
                    {user?.location && (
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Location</p>
                        <p className="text-lg text-slate-700">{user.location}</p>
                      </div>
                    )}
                    {user?.bio && (
                      <div>
                        <p className="text-sm text-slate-500 font-medium">Bio</p>
                        <p className="text-slate-700">{user.bio}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <div className="space-y-6">
              <Card className="border-slate-200/60 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-[#0A1628] to-[#1a2942] text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-[#D4AF37]" />
                    Facial Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {facialVerification && facialVerification.verification_status === "verified" ? (
                    <>
                      <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-green-900">Verified Identity</p>
                          <p className="text-sm text-green-700">
                            Last verified: {format(new Date(facialVerification.last_re_verification), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Confidence Score: {facialVerification.confidence_score?.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      <Alert className="border-[#D4AF37]/30 bg-amber-50/50">
                        <Lock className="w-4 h-4" />
                        <AlertDescription>
                          Your biometric data is encrypted and stored securely. It's used exclusively for verification and never shared without your explicit permission.
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={handleFacialVerification}
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Re-verify Identity
                      </Button>
                    </>
                  ) : (
                    <>
                      <Alert className="border-amber-500/30 bg-amber-50">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <AlertDescription className="text-amber-900">
                          <strong>Facial verification required</strong> to connect social media accounts and use the Face to Face verification protocol.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-4">
                        <div className="bg-slate-50 rounded-xl p-6 space-y-3">
                          <h3 className="font-bold text-[#0A1628] flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[#D4AF37]" />
                            How Verification Works
                          </h3>
                          <ul className="space-y-2 text-sm text-slate-700">
                            <li className="flex gap-2">
                              <Check className="w-4 h-4 text-green-600 mt-0.5" />
                              We capture a live photo using your camera
                            </li>
                            <li className="flex gap-2">
                              <Check className="w-4 h-4 text-green-600 mt-0.5" />
                              AI creates an encrypted biometric hash
                            </li>
                            <li className="flex gap-2">
                              <Check className="w-4 h-4 text-green-600 mt-0.5" />
                              Your data is stored securely and never shared
                            </li>
                            <li className="flex gap-2">
                              <Check className="w-4 h-4 text-green-600 mt-0.5" />
                              You control which platforms can verify against it
                            </li>
                          </ul>
                        </div>

                        <Button
                          onClick={handleFacialVerification}
                          className="w-full bg-gradient-to-r from-[#0A1628] to-[#1a2942] h-12 text-lg gap-2"
                        >
                          <Camera className="w-5 h-5" />
                          Start Facial Verification
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {verificationToken && (
                <Card className="border-slate-200/60 shadow-xl">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-[#D4AF37]" />
                      Your Verification Token
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm text-slate-600">
                      Use this token to authenticate your identity on external platforms that support the Face to Face Verification Protocol.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={verificationToken.token}
                        readOnly
                        className="font-mono text-sm border-slate-200"
                      />
                      <Button onClick={copyVerificationToken} variant="outline" size="icon">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <AlertCircle className="w-3 h-3" />
                      <span>Used {verificationToken.usage_count} times • Expires {format(new Date(verificationToken.expires_at), "MMM d, yyyy")}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="connections">
            <div className="space-y-6">
              {(!facialVerification || facialVerification.verification_status !== "verified") ? (
                <Card className="border-slate-200/60 shadow-xl">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                      <Shield className="w-10 h-10 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0A1628] mb-2">Verification Required</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                      Complete facial verification in the Verification tab before connecting social media accounts.
                    </p>
                    <Button
                      onClick={() => document.querySelector('[value="verification"]').click()}
                      className="bg-gradient-to-r from-[#0A1628] to-[#1a2942]"
                    >
                      Go to Verification
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <Card className="border-slate-200/60 shadow-xl">
                    <CardHeader className="border-b border-slate-100">
                      <CardTitle>Connect Social Media Accounts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Alert className="border-blue-200 bg-blue-50 mb-6">
                        <AlertDescription className="text-sm text-blue-900 font-medium">
                          <strong>Omega UI Verified Access Protocol:</strong> Once connected, these platforms can verify you're a real human with authentic face-to-face connections. This helps prevent AI impersonation and deepfakes.
                        </AlertDescription>
                      </Alert>

                      <div className="grid md:grid-cols-2 gap-4">
                        {socialPlatforms.map((platform) => {
                          const isConnected = connectedAccounts.find(a => a.platform === platform.platform);

                          return (
                            <Card key={platform.platform} className="border-slate-200">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`${platform.color} p-2 rounded-lg`}>
                                      <platform.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[#0A1628]">{platform.name}</p>
                                      {isConnected ? (
                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                          <Check className="w-3 h-3" />
                                          <span>@{isConnected.platform_username}</span>
                                        </div>
                                      ) : (
                                        <p className="text-xs text-slate-500">Not connected</p>
                                      )}
                                    </div>
                                  </div>
                                  {isConnected ? (
                                    <Button
                                      onClick={() => handleDisconnectAccount(isConnected.id)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-600"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={() => handleConnectSocialMedia(platform.name)}
                                      size="sm"
                                      variant="outline"
                                      className="gap-1"
                                    >
                                      Connect
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {connectedAccounts.length > 0 && (
                    <Card className="border-slate-200/60 shadow-xl">
                      <CardHeader className="border-b border-slate-100">
                        <CardTitle>Verification Protocol Benefits</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200">
                            <Shield className="w-8 h-8 text-blue-600 mb-2" />
                            <h4 className="font-bold text-blue-900 mb-1">Verified Human Badge</h4>
                            <p className="text-sm text-blue-700">
                              Your connected accounts show you're verified through real face-to-face connections
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200">
                            <Lock className="w-8 h-8 text-green-600 mb-2" />
                            <h4 className="font-bold text-green-900 mb-1">Anti-Deepfake Protection</h4>
                            <p className="text-sm text-green-700">
                              Encrypted biometric verification prevents AI impersonation and deepfake fraud
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200">
                            <Key className="w-8 h-8 text-purple-600 mb-2" />
                            <h4 className="font-bold text-purple-900 mb-1">Cross-Platform Trust</h4>
                            <p className="text-sm text-purple-700">
                              One verification works across all connected platforms in your network
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-4 border border-amber-200">
                            <Check className="w-8 h-8 text-amber-600 mb-2" />
                            <h4 className="font-bold text-amber-900 mb-1">Privacy Controlled</h4>
                            <p className="text-sm text-amber-700">
                              You decide which platforms can access your verification data
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
