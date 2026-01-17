import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield, Users, Lock, Camera, Eye, Fingerprint,
  CheckCircle, AlertTriangle,
  Zap,
  TrendingUp, Award
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function FaceToFaceInfo() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);
    } catch (error) {
      console.error("Failed to check authentication status:", error);
      setIsAuthenticated(false);
    }
  };

  const handleLogin = () => {
    // Redirect to login page, passing the current page URL for post-login redirection
    base44.auth.redirectToLogin(createPageUrl("FaceToFace"));
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Hero */}
        <motion.div {...fadeIn} className="text-center space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-cyan-500/50">
            <Users className="w-14 h-14 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black metallic-text">
            Face to Face
          </h1>
          <p className="text-xl text-cyan-400 font-bold">
            A Feature of Omega UI
          </p>
          <p className="text-2xl font-bold cyan-metallic">
            The Anti-Deepfake Verification Protocol
          </p>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium">
            Solving the biggest crisis in digital identity: proving you're you when everything can be faked.
          </p>
        </motion.div>

        {/* The Problem We're Solving */}
        <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-red-900/30 to-slate-900/90 border-red-500/40">
            <CardContent className="p-10">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                  <AlertTriangle className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-black metallic-text mb-6">The Crisis We're Solving</h2>
                  <div className="space-y-6 text-gray-100 leading-relaxed text-lg font-medium">
                    <p>
                      <strong className="text-white text-xl">People are losing their accounts permanently.</strong>
                    </p>
                    <p>
                      Every single day, thousands of people get locked out of their own accounts. 
                      Lost phone. Changed email. Stolen device. 2FA that doesn't work. And when they try to recover access, 
                      <strong className="text-red-300"> they can't prove they're the real owner</strong>.
                    </p>
                    <p>
                      Meanwhile, <strong className="text-red-300">AI deepfakes are getting perfect</strong>. 
                      Scammers use AI voice cloning to call support and reset passwords. 
                      Customer service can't tell the difference between you and an AI fake of you.
                    </p>
                    <p>
                      And the worst part? <strong className="text-white">Big Tech profits from your data while you get nothing</strong>. 
                      You sign their Terms & Conditions, they train AI on your life, and you're left powerless.
                    </p>
                    <p className="text-2xl font-black text-red-300 pt-4">
                      Omega UI's Face to Face feature ends this now.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* What Face to Face Does */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-cyan-900/30 to-slate-900/90 border-cyan-500/40">
            <CardContent className="p-10">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-black metallic-text mb-6">What Face to Face Does</h2>
                  <div className="space-y-6 text-gray-100 leading-relaxed text-lg font-medium">
                    <p>
                      Face to Face is <strong className="cyan-metallic">the universal account recovery solution</strong> that Big Tech should have built years ago.
                    </p>
                    <p>
                      We create an <strong className="text-white">unfakeable proof of your identity</strong> using Trifecta verification:
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 my-6">
                      <div className="bg-slate-950/70 rounded-xl p-6 border-2 border-cyan-500/50">
                        <Camera className="w-12 h-12 text-cyan-400 mb-3 mx-auto" />
                        <h3 className="text-white font-black text-center mb-2">Facial Recognition</h3>
                        <p className="text-gray-300 text-sm text-center">80+ facial landmarks mapped in 3D</p>
                      </div>
                      <div className="bg-slate-950/70 rounded-xl p-6 border-2 border-purple-500/50">
                        <Eye className="w-12 h-12 text-purple-400 mb-3 mx-auto" />
                        <h3 className="text-white font-black text-center mb-2">Retina Scan</h3>
                        <p className="text-gray-300 text-sm text-center">266 unique iris characteristics</p>
                      </div>
                      <div className="bg-slate-950/70 rounded-xl p-6 border-2 border-pink-500/50">
                        <Fingerprint className="w-12 h-12 text-pink-400 mb-3 mx-auto" />
                        <h3 className="text-white font-black text-center mb-2">Fingerprint</h3>
                        <p className="text-gray-300 text-sm text-center">Physical biometric verification</p>
                      </div>
                    </div>
                    <p>
                      These three biometrics combine to create <strong className="cyan-metallic">the Trifecta</strong> — 
                      an encryption key that <strong className="text-white">only you possess and can never be replicated</strong>.
                    </p>
                    <p className="text-xl font-black cyan-metallic">
                      AI can fake your voice. AI can fake your face. But AI cannot fake face + retina + fingerprint simultaneously in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How It Works - Social Media Integration */}
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-purple-900/30 to-slate-900/90 border-purple-500/40">
            <CardContent className="p-10">
              <h2 className="text-4xl font-black text-white mb-6 text-center">How Social Media Integration Works</h2>
              <div className="space-y-6">
                <div className="bg-slate-950/70 rounded-xl p-6 border-l-4 border-cyan-500">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">You Link Your Accounts</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Connect your Facebook, Instagram, Twitter, LinkedIn, Google, and other accounts to Omega UI. 
                        We store your Trifecta verification token securely.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6 border-l-4 border-purple-500">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Platforms Integrate Our API</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Social media platforms and services integrate the Omega UI verification API. 
                        This takes 10 minutes and adds a "Recover with Omega UI" button to their login page.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6 border-l-4 border-pink-500">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">You Get Locked Out (Uh Oh)</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Lost phone, changed email, forgot password, 2FA broken, account hijacked - doesn't matter. 
                        You're locked out and traditional recovery won't work.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6 border-l-4 border-green-500">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Click "Recover with Omega UI"</h3>
                      <p className="text-gray-300 leading-relaxed">
                        You click the recovery button. Platform redirects you to Omega UI for verification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6 border-l-4 border-cyan-500">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                      5
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Trifecta Verification</h3>
                      <p className="text-gray-300 leading-relaxed">
                        You present your face, retina, and fingerprint. System confirms your identity instantly. 
                        No hacker or AI can replicate all three biometrics.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-900/50 to-cyan-900/50 rounded-xl p-6 border-2 border-green-500/50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white mb-2">Access Restored Instantly</h3>
                      <p className="text-gray-200 leading-relaxed text-lg">
                        Platform receives verified confirmation. Account unlocks. You're back in. 
                        <strong className="text-green-300"> No support tickets. No waiting. No permanent lockout.</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Multiple Verification Methods */}
        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-indigo-900/30 to-slate-900/90 border-indigo-500/40">
            <CardContent className="p-10">
              <h2 className="text-4xl font-black text-white mb-6 text-center">
                6-7 Ways to Verify = Impossible to Lock You Out
              </h2>
              <p className="text-xl text-gray-300 text-center mb-8 leading-relaxed">
                We give you MORE ways to prove it's you than any hacker or platform. 
                <strong className="text-white"> You should ALWAYS be able to take back your own account.</strong>
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-950/70 rounded-xl p-6 border-2 border-cyan-500/50">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Facial Recognition</h3>
                  </div>
                  <p className="text-gray-300 text-sm">3D biometric mapping</p>
                </div>
                <div className="bg-slate-950/70 rounded-xl p-6 border-2 border-purple-500/50">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Retina Scan</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Iris pattern verification</p>
                </div>
                <div className="bg-slate-950/70 rounded-xl p-6 border-2 border-pink-500/50">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-pink-400" />
                    <h3 className="text-lg font-bold text-white">Fingerprint</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Physical biometric</p>
                </div>
                <div className="bg-slate-950/70 rounded-xl p-6 border-2 border-green-500/50">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <h3 className="text-lg font-bold text-white">Password</h3>
                  </div>
                  <p className="text-gray-300 text-sm">If you remember it</p>
                </div>
                <div className="bg-slate-950/70 rounded-xl p-6 border-2 border-blue-500/50">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">2FA / OTP Codes</h3>
                  </div>
                  <p className="text-gray-300 text-sm">SMS or authenticator app</p>
                </div>
                <div className="bg-slate-950/70 rounded-xl p-6 border-2 border-indigo-500/50">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">Recovery Codes</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Backup authentication</p>
                </div>
                <div className="bg-slate-950/70 rounded-xl p-6 border-2 border-yellow-500/50">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-6 h-6 text-yellow-400" />
                    <h3 className="text-lg font-bold text-white">Verified Connections</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Your Face to Face Circle</p>
                </div>
              </div>
              <div className="mt-8 bg-gradient-to-r from-cyan-900/50 to-purple-900/50 rounded-xl p-6 border-2 border-cyan-500/50">
                <p className="text-white text-xl font-bold text-center leading-relaxed">
                  With 6-7 different verification methods, it's <strong className="text-cyan-300">mathematically impossible</strong> for you to be permanently locked out. 
                  We have more ways to verify you than any hacker or platform does.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Problems This Solves */}
        <motion.div {...fadeIn} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-br from-green-900/30 to-slate-900/90 border-green-500/40">
            <CardContent className="p-10">
              <h2 className="text-4xl font-black text-white mb-8 text-center">Problems Face to Face Solves</h2>
              <div className="space-y-4">
                <div className="bg-slate-950/70 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Permanent Account Lockouts</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Lost phone, changed email, forgot password - none of it matters anymore. 
                        Your biometrics never change. You can ALWAYS recover your account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Account Hijacking</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Hacker changes your password and recovery email? Doesn't matter. 
                        They can't fake your Trifecta. You prove it's you and take the account back instantly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">AI Deepfake Fraud</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Scammers using AI voice cloning to call support? Won't work. 
                        Live Trifecta verification requires face + retina + fingerprint simultaneously. AI can't fake that.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Broken 2FA / SMS Issues</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Authenticator app deleted? Phone number changed? SMS not arriving? 
                        Bypass all of it with biometric verification. Your body IS the authentication.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Slow Support / No Response</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Waiting weeks for support to respond? Sending ID photos that get rejected? 
                        Face to Face recovery is instant. No tickets. No waiting. No human review needed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Data Exploitation by Big Tech</h3>
                      <p className="text-gray-300 leading-relaxed">
                        Big Tech trains AI on your data and profits while you get nothing. 
                        With Omega UI, YOU own your data. YOU decide who accesses it. YOU get paid for it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits for Platforms */}
        <motion.div {...fadeIn} transition={{ delay: 0.6 }}>
          <Card className="bg-gradient-to-br from-blue-900/30 to-slate-900/90 border-blue-500/40">
            <CardContent className="p-10">
              <h2 className="text-4xl font-black text-white mb-6 text-center">
                Why Social Media Platforms Should Integrate
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-slate-950/70 rounded-xl p-6 border-l-4 border-cyan-500">
                  <TrendingUp className="w-12 h-12 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Reduce Support Costs</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Automated biometric recovery eliminates 90% of account recovery support tickets. 
                    Save millions in customer service costs.
                  </p>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6 border-l-4 border-purple-500">
                  <Shield className="w-12 h-12 text-purple-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Eliminate Account Recovery Fraud</h3>
                  <p className="text-gray-300 leading-relaxed">
                    No more AI voice scams or forged ID documents. 
                    Live Trifecta verification is impossible to fake.
                  </p>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6 border-l-4 border-pink-500">
                  <Users className="w-12 h-12 text-pink-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Improve User Retention</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Users who get permanently locked out never come back. 
                    Omega UI recovery keeps them on your platform.
                  </p>
                </div>

                <div className="bg-slate-950/70 rounded-xl p-6 border-l-4 border-green-500">
                  <Award className="w-12 h-12 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-3">Competitive Advantage</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Be the first platform with unfakeable identity verification. 
                    Users will choose you over competitors.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div {...fadeIn} transition={{ delay: 0.7 }} className="text-center">
          <Card className="bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-cyan-500/20 border-cyan-500/50 shadow-2xl">
            <CardContent className="p-12">
              <h2 className="text-4xl font-black metallic-text mb-4">
                Never Get Locked Out Again
              </h2>
              <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed font-medium">
                Start your Trifecta verification today with Omega UI. Link your social media accounts. 
                <strong className="cyan-metallic"> Prove you're you, no matter what happens.</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl("Security")}>
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-2xl">
                    <Shield className="w-6 h-6 mr-3" />
                    Start Trifecta Verification
                  </Button>
                </Link>
                <Link to={createPageUrl("VerificationAPI")}>
                  <Button variant="outline" className="border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 font-bold text-lg px-8 py-6 rounded-xl">
                    <Zap className="w-6 h-6 mr-3" />
                    View Integration API
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Show restricted content notice for non-authenticated */}
        {!isAuthenticated && (
          <motion.div {...fadeIn}>
            <Card className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-cyan-500/30 shadow-2xl">
              <CardContent className="p-16 text-center">
                <Lock className="w-20 h-20 text-cyan-400 mx-auto mb-6" />
                <h3 className="text-3xl font-black text-white mb-4">Ready to Get Verified?</h3>
                <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
                  Join Omega UI to complete your Trifecta verification, connect with real humans, 
                  and protect yourself from deepfakes forever.
                </p>
                <Button 
                  onClick={handleLogin}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-14 px-12 text-lg font-bold"
                >
                  Sign Up & Get Verified
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}