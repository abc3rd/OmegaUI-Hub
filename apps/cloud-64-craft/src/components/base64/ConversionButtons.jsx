import React from "react";
import { Code, Code2, RotateCw, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConversionButtons({ 
  onEncode, 
  onDecode, 
  onSwap, 
  onClear, 
  onDownload, 
  outputText, 
  conversionType 
}) {
  return (
    <div className="bg-gray-200 rounded-3xl p-6 shadow-neumorphic">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        {/* Encode Button */}
        <Button
          onClick={onEncode}
          className="bg-gray-200 hover:bg-gray-200 text-gray-700 border-0 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 py-6 rounded-2xl"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-xl shadow-neumorphic-inset flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <span className="font-medium">Encode</span>
          </div>
        </Button>

        {/* Decode Button */}
        <Button
          onClick={onDecode}
          className="bg-gray-200 hover:bg-gray-200 text-gray-700 border-0 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 py-6 rounded-2xl"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-xl shadow-neumorphic-inset flex items-center justify-center">
              <Code2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="font-medium">Decode</span>
          </div>
        </Button>

        {/* Swap Button */}
        <Button
          onClick={onSwap}
          className="bg-gray-200 hover:bg-gray-200 text-gray-700 border-0 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 py-6 rounded-2xl"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-xl shadow-neumorphic-inset flex items-center justify-center">
              <RotateCw className="w-5 h-5 text-purple-600" />
            </div>
            <span className="font-medium">Swap</span>
          </div>
        </Button>

        {/* Clear Button */}
        <Button
          onClick={onClear}
          className="bg-gray-200 hover:bg-gray-200 text-gray-700 border-0 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 py-6 rounded-2xl"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-xl shadow-neumorphic-inset flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-medium">Clear</span>
          </div>
        </Button>

        {/* Download Button */}
        <Button
          onClick={() => onDownload(outputText, conversionType === 'encode' ? 'encoded.txt' : 'decoded.txt')}
          disabled={!outputText.trim()}
          className="bg-gray-200 hover:bg-gray-200 text-gray-700 border-0 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 py-6 rounded-2xl disabled:opacity-50"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 bg-gray-200 rounded-xl shadow-neumorphic-inset flex items-center justify-center">
              <Download className="w-5 h-5 text-orange-600" />
            </div>
            <span className="font-medium">Save</span>
          </div>
        </Button>
      </div>
      
      {/* Custom Styles */}
      <style>{`
        .shadow-neumorphic {
          box-shadow: 
            12px 12px 24px rgba(163, 177, 198, 0.6),
            -12px -12px 24px rgba(255, 255, 255, 0.8);
        }
        .shadow-neumorphic-inset {
          box-shadow: 
            inset 8px 8px 16px rgba(163, 177, 198, 0.4),
            inset -8px -8px 16px rgba(255, 255, 255, 0.9);
        }
        .shadow-neumorphic-pressed {
          box-shadow: 
            inset 6px 6px 12px rgba(163, 177, 198, 0.5),
            inset -6px -6px 12px rgba(255, 255, 255, 0.8);
        }
      `}</style>
    </div>
  );
}