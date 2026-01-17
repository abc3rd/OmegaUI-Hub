import React from 'react';
import { cn } from "@/lib/utils";

const DRAGON_LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bdbae61875d59c7d61ef06/4a566485b_de9d0d20-a4e9-4685-884d-c157a6bd8029.jpg";

const ScanningDragon = ({ isLoading }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .scanner-line {
          position: absolute;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.7), transparent);
          box-shadow: 0 0 10px 2px rgba(0, 255, 255, 0.5);
          animation: scan 2.5s ease-in-out infinite;
          border-radius: 50%;
        }
      `}</style>
      <div className="relative w-48 h-48">
        <img
          src={DRAGON_LOGO_URL}
          alt="Scanning for resources"
          className="animate-pulse w-full h-full object-contain"
          style={{ animationDuration: '3s' }}
        />
        <div className="scanner-line"></div>
      </div>
      <p className="mt-4 text-lg font-semibold text-white tracking-wider">
        Scanning for Community Updates...
      </p>
    </div>
  );
};

export default ScanningDragon;