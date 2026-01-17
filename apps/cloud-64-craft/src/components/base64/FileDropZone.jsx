import React, { useCallback, useState } from "react";
import { Upload, File, Image, Archive, Loader2, CheckCircle } from "lucide-react";

export default function FileDropZone({ onFileUpload, isProcessing, fileName }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  }, [onFileUpload]);

  const getFileIcon = (file) => {
    if (!file) return File;
    
    if (file.type.startsWith('image/')) return Image;
    if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('tar')) return Archive;
    return File;
  };

  return (
    <div className="bg-gray-200 rounded-3xl p-6 shadow-neumorphic">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">File Operations</h3>
      
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
          dragActive 
            ? "border-blue-400 bg-blue-50 shadow-neumorphic-inset" 
            : "border-gray-300 bg-gray-200 shadow-neumorphic-inset"
        } ${isProcessing ? "pointer-events-none opacity-75" : "cursor-pointer hover:border-gray-400"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '*';
          input.onchange = (e) => {
            if (e.target.files?.[0]) {
              onFileUpload(e.target.files[0]);
            }
          };
          input.click();
        }}
      >
        <div className="text-center">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl shadow-neumorphic-inset flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">Processing file...</p>
                <p className="text-gray-500 text-sm">Please wait</p>
              </div>
            </div>
          ) : fileName ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl shadow-neumorphic-inset flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">File loaded:</p>
                <p className="text-gray-600 text-sm font-mono bg-gray-200 px-3 py-1 rounded-lg shadow-neumorphic-inset mt-1">
                  {fileName.length > 25 ? fileName.substring(0, 25) + '...' : fileName}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-2xl shadow-neumorphic-inset flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-700 font-medium">Drop file here</p>
                <p className="text-gray-500 text-sm">or click to browse</p>
              </div>
            </div>
          )}
        </div>

        {dragActive && (
          <div className="absolute inset-0 bg-blue-100 border-2 border-blue-400 border-dashed rounded-2xl flex items-center justify-center">
            <p className="text-blue-700 font-medium">Drop your file here!</p>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Supports all file types • Text files will be loaded as-is • Binary files will be converted to Base64
        </p>
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
      `}</style>
    </div>
  );
}