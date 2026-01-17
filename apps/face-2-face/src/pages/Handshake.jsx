import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Check, Sparkles, Users, MapPin, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function Handshake() {
  const [step, setStep] = useState(1);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [friendCode, setFriendCode] = useState("");
  const [location, setLocation] = useState("");
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    return () => stopCamera();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (!userData.handshake_code) {
        const code = generateCode();
        await base44.auth.updateMe({ handshake_code: code });
        setUser({ ...userData, handshake_code: code });
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(user?.handshake_code || "");
    alert("Code copied to clipboard!");
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (error) {
      console.error("Camera access error:", error);
      alert("Unable to access camera. Please ensure you've granted camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `handshake-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedPhoto(file);
      stopCamera();
      setStep(2);
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = async () => {
    if (!capturedPhoto || !friendCode || !location) return;

    setProcessing(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: capturedPhoto });
      
      const friendUsers = await base44.entities.User.list();
      const friend = friendUsers.find(u => u.handshake_code === friendCode.toUpperCase());
      
      if (!friend) {
        alert("Invalid handshake code. Please verify with your friend.");
        setProcessing(false);
        return;
      }

      const friendEmail = friend.email;

      if (friendEmail === user.email) {
        alert("You cannot send a handshake to yourself!");
        setProcessing(false);
        return;
      }

      const existingConnections = await base44.entities.Connection.list();
      const connectionExists = existingConnections.some(c =>
        (c.user_a === user.email && c.user_b === friendEmail) ||
        (c.user_a === friendEmail && c.user_b === user.email)
      );

      if (connectionExists) {
        alert("You already have a connection with this person!");
        setProcessing(false);
        return;
      }

      await base44.entities.Connection.create({
        user_a: user.email,
        user_b: friendEmail,
        status: "pending",
        verification_photo_url: file_url,
        meeting_location: location,
        meeting_timestamp: new Date().toISOString()
      });

      setStep(3);
    } catch (error) {
      console.error("Error creating handshake:", error);
      alert("Error creating connection. Please try again.");
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-8"
        >
          <div className="flex items-center justify-center gap-2">
            <Camera className="w-8 h-8 text-[#D4AF37]" />
            <h1 className="text-4xl font-bold text-[#0A1628] tracking-tight">Digital Handshake</h1>
          </div>
          <p className="text-slate-600 font-medium max-w-lg mx-auto">
            Create an authentic connection by meeting face to face
          </p>
        </motion.div>

        {step === 1 && (
          <Card className="border-slate-200/60 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-[#0A1628] to-[#1a2942] text-white p-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6 text-[#D4AF37]" />
                Your Handshake Code
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="text-center space-y-4">
                <p className="text-slate-600 font-medium">Share this code with your friend:</p>
                <div className="inline-block relative group">
                  <div className="bg-gradient-to-br from-[#0A1628] to-[#1a2942] text-white text-5xl font-bold tracking-wider px-12 py-8 rounded-2xl shadow-2xl shadow-slate-900/20 border-4 border-[#D4AF37]/30">
                    {user?.handshake_code || "------"}
                  </div>
                  <Button
                    onClick={copyCode}
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-white shadow-lg gap-2"
                  >
                    <Copy className="w-3 h-3" />
                    Copy Code
                  </Button>
                </div>
              </div>

              <Alert className="border-[#D4AF37]/30 bg-amber-50/50">
                <AlertDescription className="text-sm text-slate-700">
                  <strong className="text-[#0A1628]">How it works:</strong> You and your friend should both be on this page. 
                  Share your codes with each other, then proceed to capture your verification photo.
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => {
                  startCamera();
                  setStep(1.5);
                }}
                className="w-full bg-gradient-to-r from-[#0A1628] to-[#1a2942] hover:shadow-2xl transition-all h-14 text-lg gap-3"
              >
                <Camera className="w-6 h-6" />
                Start Camera & Capture Photo
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1.5 && (
          <Card className="border-slate-200/60 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-[4/3] bg-black">
                {!cameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                      <p>Starting camera...</p>
                    </div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-end justify-center pb-8 gap-4">
                  <Button
                    onClick={() => {
                      stopCamera();
                      setStep(1);
                    }}
                    variant="outline"
                    className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="bg-white hover:bg-slate-100 text-[#0A1628] shadow-2xl h-16 w-16 rounded-full p-0"
                    disabled={!cameraActive}
                  >
                    <div className="w-12 h-12 rounded-full border-4 border-[#0A1628]" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-slate-200/60 shadow-2xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              {capturedPhoto && (
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <img 
                    src={URL.createObjectURL(capturedPhoto)} 
                    alt="Captured" 
                    className="w-full"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="friendCode" className="text-[#0A1628] font-semibold flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#D4AF37]" />
                    Friend's Handshake Code
                  </Label>
                  <Input
                    id="friendCode"
                    value={friendCode}
                    onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code"
                    maxLength={6}
                    className="text-lg tracking-wider uppercase border-slate-200 focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-[#0A1628] font-semibold flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" />
                    Where are you meeting?
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Coffee shop, office, park..."
                    className="border-slate-200 focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCapturedPhoto(null);
                    setStep(1);
                  }}
                  className="flex-1 border-slate-200"
                >
                  Retake Photo
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={processing || !friendCode || !location || friendCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-[#0A1628] to-[#1a2942] hover:shadow-xl gap-2"
                >
                  {processing ? "Creating..." : (
                    <>
                      <Check className="w-5 h-5" />
                      Complete Handshake
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-slate-200/60 shadow-2xl overflow-hidden text-center">
              <CardContent className="p-12 space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Check className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[#0A1628]">
                  Handshake Sent!
                </h2>
                <p className="text-slate-600 max-w-md mx-auto">
                  Your connection request has been sent. Once your friend accepts, 
                  they'll join your Circle and you'll see each other's posts.
                </p>
                <Button
                  onClick={() => navigate(createPageUrl("Circle"))}
                  className="bg-gradient-to-r from-[#0A1628] to-[#1a2942] hover:shadow-xl"
                >
                  View My Circle
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}