import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, Lock, Smartphone, Key, AlertTriangle,
  CheckCircle, Camera, Fingerprint, Eye, EyeOff,
  Plus, Trash2, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { format } from 'date-fns';

import GlytchAvatar from '../components/glytch/GlytchAvatar';
import GlytchMessage from '../components/glytch/GlytchMessage';
import FaceVerification from '../components/biometric/FaceVerification';

export default function Security() {
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: biometricProfile } = useQuery({
    queryKey: ['biometric-profile'],
    queryFn: async () => {
      const profiles = await base44.entities.BiometricProfile.filter({});
      return profiles[0] || null;
    }
  });

  const enrollBiometric = useMutation({
    mutationFn: async () => {
      return base44.entities.BiometricProfile.create({
        is_enrolled: true,
        enrollment_date: new Date().toISOString(),
        verification_count: 0,
        trusted_devices: [],
        recovery_attempts: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-profile'] });
      base44.entities.ActivityLog.create({
        event_type: 'biometric_success',
        severity: 'info',
        message: 'Face 2 Face biometric profile enrolled successfully'
      });
    }
  });

  const handleBiometricEnrollment = () => {
    setShowBiometricSetup(true);
  };

  const handleEnrollmentSuccess = () => {
    enrollBiometric.mutate();
    setShowBiometricSetup(false);
  };

  const handleVerificationSuccess = () => {
    setShowVerification(false);
    if (biometricProfile) {
      base44.entities.BiometricProfile.update(biometricProfile.id, {
        verification_count: (biometricProfile.verification_count || 0) + 1,
        last_verification: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <GlytchAvatar status="idle" size="sm" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-white">Security</span>
                <span className="text-[#ea00ea]"> Center</span>
              </h1>
              <p className="text-xs text-slate-500 font-mono">Base 44 Identity Protocol</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlytchMessage 
            message={biometricProfile?.is_enrolled 
              ? "Face 2 Face verification active. Your identity is your key. Biometric vector secure."
              : "Warning: Biometric verification not configured. Enroll Face 2 Face to maximize security."
            }
            type={biometricProfile?.is_enrolled ? 'success' : 'alert'}
          />
        </motion.div>

        {/* Security Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">Security Score</h2>
              <p className="text-sm text-slate-500">Based on your current configuration</p>
            </div>
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="8"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke={biometricProfile?.is_enrolled ? '#4bce2a' : '#ea00ea'}
                  strokeWidth="8"
                  strokeDasharray={`${(biometricProfile?.is_enrolled ? 95 : 60) * 3.51} 351`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{biometricProfile?.is_enrolled ? 95 : 60}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Face 2 Face Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#ea00ea]/20 flex items-center justify-center">
                <Fingerprint className="w-7 h-7 text-[#ea00ea]" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Face 2 Face Verification</h2>
                <p className="text-sm text-slate-500">
                  128-point facial mesh biometric authentication
                </p>
              </div>
              <div className="flex items-center gap-2">
                {biometricProfile?.is_enrolled ? (
                  <span className="flex items-center gap-2 px-3 py-1 bg-[#4bce2a]/20 text-[#4bce2a] rounded-full text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Enrolled
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-3 py-1 bg-[#ea00ea]/20 text-[#ea00ea] rounded-full text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    Not Enrolled
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {biometricProfile?.is_enrolled ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Enrolled</p>
                    <p className="font-medium">
                      {biometricProfile.enrollment_date 
                        ? format(new Date(biometricProfile.enrollment_date), 'MMM d, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-sm text-slate-500 mb-1">Verifications</p>
                    <p className="font-medium">{biometricProfile.verification_count || 0}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-700"
                    onClick={() => setShowVerification(true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Test Verification
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-[#ea00ea] text-[#ea00ea] hover:bg-[#ea00ea]/10"
                    onClick={handleBiometricEnrollment}
                  >
                    Re-enroll
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-400 mb-4">
                  Enroll your face to enable biometric verification for critical actions
                </p>
                <Button 
                  onClick={handleBiometricEnrollment}
                  className="bg-[#ea00ea] hover:bg-[#ea00ea]/80"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Enroll Face 2 Face
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Trusted Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden mb-6"
        >
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#2699fe]/20 flex items-center justify-center">
                  <Smartphone className="w-7 h-7 text-[#2699fe]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Trusted Devices</h2>
                  <p className="text-sm text-slate-500">Devices with vault access</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#4bce2a]/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-[#4bce2a]" />
                </div>
                <div>
                  <p className="font-medium">Current Device</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Active now
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 bg-[#4bce2a]/20 text-[#4bce2a] text-xs rounded-full">
                Primary
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recovery Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Key className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Recovery Options</h2>
                <p className="text-sm text-slate-500">Lockout Protocol (Code 44-Red)</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium">Face 2 Face Recovery</p>
                <p className="text-sm text-slate-500">
                  Use biometric verification to regain access
                </p>
              </div>
              <Switch 
                checked={biometricProfile?.is_enrolled || false}
                disabled={!biometricProfile?.is_enrolled}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium">Skeleton Key Generation</p>
                <p className="text-sm text-slate-500">
                  One-time access token for emergency recovery
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-slate-700">
                Generate
              </Button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Biometric Verification Modal */}
      <AnimatePresence>
        {(showBiometricSetup || showVerification) && (
          <FaceVerification
            userName={user?.full_name}
            onSuccess={showBiometricSetup ? handleEnrollmentSuccess : handleVerificationSuccess}
            onCancel={() => {
              setShowBiometricSetup(false);
              setShowVerification(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}