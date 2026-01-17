import React, { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function ScanQR() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    if (scanning && !scanner) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      html5QrcodeScanner.render(onScanSuccess, onScanFailure);
      setScanner(html5QrcodeScanner);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Scanner cleanup error:", err));
      }
    };
  }, [scanning]);

  const onScanSuccess = (decodedText) => {
    try {
      // Extract profile slug from URL or direct text
      let profileSlug = null;
      
      if (decodedText.includes('/profile/')) {
        const parts = decodedText.split('/profile/');
        profileSlug = parts[1].split('?')[0].split('#')[0];
      } else if (decodedText.includes('publicProfileUrl=')) {
        const urlParams = new URLSearchParams(decodedText.split('?')[1]);
        profileSlug = urlParams.get('publicProfileUrl');
      } else {
        profileSlug = decodedText;
      }

      if (profileSlug) {
        toast.success("QR code scanned successfully!");
        navigate(`/profile/${profileSlug}`);
      } else {
        toast.error("Invalid QR code format");
        setError("This doesn't appear to be a valid Cloud Collect QR code");
      }
    } catch (err) {
      console.error("Scan processing error:", err);
      toast.error("Error processing QR code");
      setError("Failed to process the scanned QR code");
    }
  };

  const onScanFailure = (error) => {
    // Silently ignore scan failures (they happen often while scanning)
  };

  const startScanning = () => {
    setError(null);
    setScanning(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(createPageUrl("Home"))}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="border-2 border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Camera className="w-6 h-6" />
            Scan QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!scanning ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Ready to Scan
              </h3>
              <p className="text-slate-600 mb-6">
                Point your camera at a Cloud Collect QR code to support someone in need
              </p>
              <Button
                onClick={startScanning}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                <Camera className="w-5 h-5 mr-2" />
                Start Scanning
              </Button>

              <div className="mt-8 text-left bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📱 How to Scan</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Allow camera access when prompted</li>
                  <li>• Hold your phone steady over the QR code</li>
                  <li>• Keep the code within the scanning frame</li>
                  <li>• The scan happens automatically</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                id="qr-reader" 
                className="w-full rounded-lg overflow-hidden"
              />
              
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Camera is active. Position the QR code in the frame above.
                </AlertDescription>
              </Alert>

              <Button
                variant="outline"
                onClick={() => {
                  setScanning(false);
                  if (scanner) {
                    scanner.clear().catch(err => console.error(err));
                    setScanner(null);
                  }
                }}
                className="w-full"
              >
                Cancel Scanning
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}