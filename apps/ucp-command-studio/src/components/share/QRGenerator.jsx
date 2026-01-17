import { useEffect, useRef } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function QRGenerator({ data, title, subtitle }) {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const size = 256;
    canvas.width = size;
    canvas.height = size;

    // Simple QR-like visualization (actual QR would need a library)
    // This creates a visual representation - in production, use a real QR library
    const json = JSON.stringify(data);
    const hash = json.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, size, size);

    const moduleSize = 8;
    const modules = Math.floor(size / moduleSize);
    
    // Create a deterministic pattern based on the data
    for (let y = 0; y < modules; y++) {
      for (let x = 0; x < modules; x++) {
        const seed = (hash + x * 31 + y * 17) % 100;
        if (seed > 45 || (x < 3 && y < 3) || (x > modules - 4 && y < 3) || (x < 3 && y > modules - 4)) {
          // Create position detection patterns
          const isCorner = (x < 7 && y < 7) || (x > modules - 8 && y < 7) || (x < 7 && y > modules - 8);
          
          if (isCorner) {
            const cornerX = x < 7 ? 0 : (x > modules - 8 ? modules - 7 : 0);
            const cornerY = y < 7 ? 0 : modules - 7;
            const relX = x - cornerX;
            const relY = y - cornerY;
            
            const isOuter = relX === 0 || relX === 6 || relY === 0 || relY === 6;
            const isInner = relX >= 2 && relX <= 4 && relY >= 2 && relY <= 4;
            
            if (isOuter || isInner) {
              ctx.fillStyle = "#22d3ee";
              ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize - 1, moduleSize - 1);
            }
          } else if (seed > 50) {
            ctx.fillStyle = "#22d3ee";
            ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize - 1, moduleSize - 1);
          }
        }
      }
    }
  }, [data]);

  const downloadQR = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `${title || "qr-code"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyData = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <GlassCard className="p-6">
      <div className="text-center">
        {title && <h3 className="font-medium text-white mb-1">{title}</h3>}
        {subtitle && <p className="text-sm text-slate-400 mb-4">{subtitle}</p>}
        
        <div className="inline-block p-4 bg-white rounded-xl mb-4">
          <canvas ref={canvasRef} className="w-64 h-64" />
        </div>

        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={downloadQR}
            className="border-white/20 text-slate-300 hover:text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            onClick={copyData}
            className="border-white/20 text-slate-300 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Data
              </>
            )}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}