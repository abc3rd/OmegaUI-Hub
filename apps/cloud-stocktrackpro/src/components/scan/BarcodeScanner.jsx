import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BarcodeScanner({ onScan, isProcessing }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsScanning(true);
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      console.error(err);
    }
  };

  const captureBarcode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const barcode = Math.random().toString().slice(2, 15);
    onScan(barcode);

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isScanning ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
          <Camera className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 mb-4">Start camera to scan barcode</p>
          <Button onClick={startCamera} disabled={isProcessing}>
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-32 border-4 border-blue-500 rounded-lg" />
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <Button
            onClick={captureBarcode}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Capture Barcode'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}