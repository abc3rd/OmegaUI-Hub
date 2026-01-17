import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import GlytchAvatar from '../glytch/GlytchAvatar';
import GlytchMessage from '../glytch/GlytchMessage';

export default function FaceVerification({ onSuccess, onCancel, userName }) {
  const [stage, setStage] = useState('init'); // init, scanning, processing, success, failed
  const [message, setMessage] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (stage === 'scanning') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [stage]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setMessage('Camera access denied. Face 2 Face verification requires camera access.');
      setStage('failed');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const handleInitiate = () => {
    setStage('scanning');
    setMessage('Position your face within the frame. Analyzing 128-point facial mesh...');
  };

  const handleCapture = async () => {
    setStage('processing');
    setMessage('Processing biometrics... Matching against Base 44 User Vector...');

    // Simulate biometric processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Simulate success (in production, this would compare with stored face vector)
    const success = Math.random() > 0.1; // 90% success rate for demo

    if (success) {
      setStage('success');
      setMessage(`Identity Confirmed: ${userName || 'User'}. Access granted via Face 2 Face protocol.`);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } else {
      setStage('failed');
      setMessage('Biometric mismatch detected. Identity could not be verified. Please try again.');
    }
  };

  const handleRetry = () => {
    setStage('init');
    setMessage('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <GlytchAvatar 
            status={
              stage === 'scanning' ? 'scanning' :
              stage === 'processing' ? 'scanning' :
              stage === 'success' ? 'success' :
              stage === 'failed' ? 'error' : 'idle'
            } 
            size="md" 
          />
        </div>

        <h2 className="text-xl font-bold text-center text-white mb-2">
          Face 2 Face Verification
        </h2>
        <p className="text-sm text-slate-400 text-center mb-6">
          Base 44 Biometric Protocol
        </p>

        {/* Content based on stage */}
        <AnimatePresence mode="wait">
          {stage === 'init' && (
            <motion.div
              key="init"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-48 h-48 mx-auto mb-6 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Camera className="w-16 h-16 text-slate-600" />
              </div>
              <GlytchMessage 
                message="Critical action requires biometric verification. Look directly into the sensor to proceed."
                type="alert"
              />
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={onCancel} className="flex-1 border-slate-700">
                  Cancel
                </Button>
                <Button 
                  onClick={handleInitiate}
                  className="flex-1 bg-[#ea00ea] hover:bg-[#ea00ea]/80"
                >
                  Begin Scan
                </Button>
              </div>
            </motion.div>
          )}

          {(stage === 'scanning' || stage === 'processing') && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="relative w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 border-2 border-[#ea00ea] rounded-2xl">
                  <motion.div
                    className="absolute inset-x-0 h-0.5 bg-[#ea00ea]"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </div>

                {/* Corner markers */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-[#ea00ea]" />
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-[#ea00ea]" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-[#ea00ea]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-[#ea00ea]" />

                {stage === 'processing' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[#00d4ff] animate-spin" />
                    </div>
                )}
              </div>

              <GlytchMessage message={message} type="alert" />

              {stage === 'scanning' && (
                <Button 
                  onClick={handleCapture}
                  className="w-full mt-6 bg-[#ea00ea] hover:bg-[#ea00ea]/80"
                >
                  Capture & Verify
                </Button>
              )}
            </motion.div>
          )}

          {stage === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#00ff88]/20 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-[#00ff88]" />
              </div>
              <GlytchMessage message={message} type="success" />
            </motion.div>
          )}

          {stage === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#ff0055]/20 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-[#ff0055]" />
              </div>
              <GlytchMessage message={message} type="alert" />
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={onCancel} className="flex-1 border-slate-700">
                  Cancel
                </Button>
                <Button onClick={handleRetry} className="flex-1 bg-[#ea00ea] hover:bg-[#ea00ea]/80">
                  Retry Scan
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}