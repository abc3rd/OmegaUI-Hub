import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black">
      <style>{`
        /* Custom scrollbar with Glytch neon styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #000;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #ea00ea 0%, #c3c3c3 100%);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ff00ff 0%, #e0e0e0 100%);
          box-shadow: 0 0 10px #ea00ea;
        }
        
        /* Custom styles for Slider component */
        .slider-track {
            background-color: rgba(195, 195, 195, 0.2);
        }
        .slider-range {
            background: linear-gradient(90deg, #ea00ea 0%, #c3c3c3 100%);
        }
        .slider-thumb {
            border: 2px solid #ea00ea;
            background-color: #000;
            box-shadow: 0 0 10px #ea00ea;
        }
        .slider-thumb:focus-visible {
            outline: none;
            box-shadow: 0 0 0 3px #000, 0 0 0 5px #ea00ea, 0 0 20px #ea00ea;
        }
        
        /* Glytch neon glow animations */
        @keyframes glytchGlow {
          0%, 100% { text-shadow: 0 0 10px #ea00ea, 0 0 20px #ea00ea, 0 0 30px #ea00ea; }
          50% { text-shadow: 0 0 20px #ea00ea, 0 0 30px #ea00ea, 0 0 40px #ea00ea; }
        }
        
        .glytch-glow {
          animation: glytchGlow 2s ease-in-out infinite;
        }
      `}</style>
      <main>{children}</main>
    </div>
  );
}