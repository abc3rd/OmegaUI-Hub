import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Database, Users, Key, CheckCircle, XCircle, Zap, AlertTriangle, Smartphone, Mail
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function About() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authed = await base44.auth.isAuthenticated();
      setIsAuthenticated(authed);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("Dashboard"));
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const realWorldProblems = [
    {
      icon: Smartphone,
      title: "Lost Phone = Lost Everything",
      problem: "You lose your phone, someone changes your password, and 2FA codes go to the stolen device. You're locked out of your own accounts.",
      solution: "Trifecta verification lets you recover access with your face, retina, and fingerprint - no phone needed."
    },
    {
      icon: Mail,
      title: "Changed Email or Phone Number",
      problem: "Your old email is closed or phone number changed. Recovery codes were sent there. Now you can't reset your password or verify it's you.",
      solution: "Your biometrics never change. Face + Retina + Fingerprint always proves it's you, regardless of contact info changes."
    },
    {
      icon: AlertTriangle,
      title: "Account Hijacking",
      problem: "Hacker gains access, changes password and recovery email. Support can't verify you're the real owner. Your account is gone forever.",
      solution: "Trifecta creates an immutable proof of identity. No hacker can replicate your three biometric factors."
    },
    {
      icon: Key,
      title: "2FA Doesn't Work",
      problem: "Authenticator app deleted, backup codes lost, SMS doesn't arrive. You're locked out with no way back in.",
      solution: "Biometric verification bypasses traditional 2FA. Your body IS the authentication - can't be lost or deleted."
    },
    {
      icon: Users,
      title: "AI Deepfakes Fool Support",
      problem: "Scammers use AI voice cloning to call support and reset your password. Support can't tell it's fake.",
      solution: "Trifecta requires live biometric verification. AI can fake voice, but can't fake face + retina + fingerprint simultaneously."
    },
    {
      icon: Database,
      title: "Corporate Data Exploitation",
      problem: "Google, Facebook, Amazon train AI on your data. You sign away rights in Terms & Conditions. They profit, you get nothing.",
      solution: "The ARC gives YOU ownership. Your data is encrypted by YOUR biometrics. You decide who accesses it and you get paid for it."
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Hero */}
        <motion.div {...fadeIn} className="text-center space-y-6">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dbd842e6edb33782c055df/d3d11dd79_Gemini_Generated_Image_csiphhcsiphhcsip.png"
            alt="Omega UI"
            className="h-32 w-auto mx-auto"
          />
          <h1 className="text-5xl md:text-6xl font-black metallic-text">About OMEGA UI</h1>
          <p className="text-2xl font-bold cyan-metallic">
            The Identity Platform That Can't Be Faked
          </p>
          <p className="text-lg text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium">
            We're solving the biggest problem in digital identity: <strong className="text-white">proving you're you</strong> when everything can be faked.
          </p>
        </motion.div>

        {/* Real World Problems */}
        <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
          <h2 className="text-4xl font-black metallic-text text-center mb-10">
            Problems We Solve
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {realWorldProblems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-cyan-500/20">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{item.title}</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-sm font-bold text-red-300">The Problem:</span>
                        </div>
                        <p className="text-gray-300 text-sm">{item.problem}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-bold text-cyan-300">Omega UI Solution:</span>
                        </div>
                        <p className="text-gray-200 text-sm font-medium">{item.solution}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        {!isAuthenticated && (
          <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-cyan-900/30 to-purple-900/30 border-cyan-500/40 shadow-2xl">
              <CardContent className="p-12 text-center">
                <h2 className="text-4xl font-black metallic-text mb-6">
                  Ready to Join Omega UI?
                </h2>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                  Get started with the identity platform that can't be faked. 
                  Free to begin, no credit card required.
                </p>
                <Button 
                  onClick={handleLogin}
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 h-16 px-16 text-xl font-black"
                >
                  Sign Up Now - It's Free
                  <Zap className="ml-3 w-6 h-6" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}