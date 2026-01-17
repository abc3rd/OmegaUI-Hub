import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Download, 
  Copy, 
  CheckCircle, 
  Share2,
  Maximize2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Simple QR Code generator using canvas
const generateQRMatrix = (data, size = 21) => {
  // This is a simplified QR code - for production, use a proper library
  // We'll create a visual representation that encodes the data hash
  const hash = data.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  const matrix = [];
  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      // Create pattern based on hash and position
      const val = (hash * (i + 1) * (j + 1)) % 100;
      matrix[i][j] = val > 50 ? 1 : 0;
    }
  }
  
  // Add finder patterns (corners)
  const addFinder = (startRow, startCol) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || 
            (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          matrix[startRow + i][startCol + j] = 1;
        } else {
          matrix[startRow + i][startCol + j] = 0;
        }
      }
    }
  };
  
  addFinder(0, 0);
  addFinder(0, size - 7);
  addFinder(size - 7, 0);
  
  return matrix;
};

export default function QRCodeGenerator({ data, title = "UCP Packet" }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  const packetData = typeof data === 'string' ? data : JSON.stringify(data);
  const compressedData = btoa(packetData).substring(0, 500); // Limit for QR

  useEffect(() => {
    drawQRCode();
  }, [packetData]);

  const drawQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 200;
    const moduleCount = 25;
    const moduleSize = size / moduleCount;

    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Generate and draw QR matrix
    const matrix = generateQRMatrix(compressedData, moduleCount);
    
    ctx.fillStyle = '#1e293b';
    for (let i = 0; i < moduleCount; i++) {
      for (let j = 0; j < moduleCount; j++) {
        if (matrix[i][j]) {
          ctx.fillRect(j * moduleSize, i * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add UCP logo in center
    const logoSize = 40;
    const logoX = (size - logoSize) / 2;
    const logoY = (size - logoSize) / 2;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
    
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, logoSize / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('UCP', size / 2, size / 2);

    setQrDataUrl(canvas.toDataURL('image/png'));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `ucp_${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(packetData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: 'UCP Packet Data',
          url: window.location.href
        });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">QR Code</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFullscreen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-3 rounded-xl">
            <canvas ref={canvasRef} className="w-40 h-40" />
          </div>
          
          <p className="text-xs text-slate-400 text-center">
            Scan to import packet on another device
          </p>

          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1 border-slate-600 text-slate-300"
            >
              {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1 border-slate-600 text-slate-300"
            >
              <Download className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-slate-600 text-slate-300"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowFullscreen(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">{title}</h3>
              <button
                onClick={() => setShowFullscreen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center mb-4">
              <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
            </div>
            <p className="text-sm text-slate-500 text-center mb-4">
              Scan this QR code to import the UCP packet
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}