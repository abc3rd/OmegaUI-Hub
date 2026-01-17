import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { QrCode, CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function QRScanner({ onScanSuccess, onClose }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText, decodedResult) => {
        setScanning(false);
        setSuccess(true);
        scanner.clear();
        
        // Extract referral code from URL
        try {
          const url = new URL(decodedText);
          const ref = url.searchParams.get("ref");
          if (ref) {
            setTimeout(() => {
              onScanSuccess(ref);
            }, 1000);
          } else {
            setError("Invalid QR code - no referral code found");
          }
        } catch (e) {
          // If it's not a URL, treat it as a direct referral code
          if (decodedText.length > 3) {
            setTimeout(() => {
              onScanSuccess(decodedText);
            }, 1000);
          } else {
            setError("Invalid QR code format");
          }
        }
      },
      (errorMessage) => {
        // Ignore errors - they happen continuously while scanning
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Scan QR Code</h2>
            <p className="text-xs text-slate-400">Point camera at partner's QR code</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {scanning && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div id="qr-reader" className="rounded-2xl overflow-hidden"></div>
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700">
                    <div className="w-2 h-2 rounded-full bg-[#ea00ea] animate-pulse"></div>
                    <span className="text-sm text-slate-300">Scanning...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4bce2a] to-[#2ecc71] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-[#4bce2a]/30">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">QR Code Scanned!</h3>
                <p className="text-slate-400">Connecting you now...</p>
              </motion.div>
            )}

            {error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center"
              >
                <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border-2 border-red-500/30">
                  <AlertCircle className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Scan Failed</h3>
                <p className="text-slate-400 mb-6">{error}</p>
                <Button
                  onClick={() => {
                    setError(null);
                    setScanning(true);
                  }}
                  className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] text-white"
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Instructions */}
      {scanning && (
        <div className="p-6 border-t border-slate-800">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#ea00ea]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#ea00ea]">1</span>
              </div>
              <p className="text-sm text-slate-300">Position the QR code within the frame</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#2699fe]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#2699fe]">2</span>
              </div>
              <p className="text-sm text-slate-300">Hold steady until it scans</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#4bce2a]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#4bce2a]">3</span>
              </div>
              <p className="text-sm text-slate-300">You'll be connected to the partner automatically</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}