import React, { useState, useCallback, useRef } from "react";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConversionHistory } from "@/entities/ConversionHistory";

import FileDropZone from "../components/base64/FileDropZone";
import ConversionButtons from "../components/base64/ConversionButtons";
import TextAreas from "../components/base64/TextAreas";

export default function Base64Tool() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [conversionType, setConversionType] = useState("encode");
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const showFeedback = (message, type = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const encodeToBase64 = useCallback((text) => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      throw new Error("Failed to encode text");
    }
  }, []);

  const decodeFromBase64 = useCallback((base64) => {
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
      throw new Error("Invalid Base64 string");
    }
  }, []);

  const handleEncode = useCallback(() => {
    if (!inputText.trim()) {
      showFeedback("Please enter text to encode", "error");
      return;
    }
    try {
      const encoded = encodeToBase64(inputText);
      setOutputText(encoded);
      setConversionType("encode");
      ConversionHistory.create({
        input_text: inputText,
        output_text: encoded,
        conversion_type: "encode",
        file_name: fileName
      });
      showFeedback("Text encoded successfully!");
    } catch (error) {
      showFeedback(error.message, "error");
    }
  }, [inputText, fileName, encodeToBase64]);

  const handleDecode = useCallback(() => {
    if (!inputText.trim()) {
      showFeedback("Please enter Base64 text to decode", "error");
      return;
    }
    try {
      const decoded = decodeFromBase64(inputText);
      setOutputText(decoded);
      setConversionType("decode");
      ConversionHistory.create({
        input_text: inputText,
        output_text: decoded,
        conversion_type: "decode",
        file_name: fileName
      });
      showFeedback("Base64 decoded successfully!");
    } catch (error) {
      showFeedback("Invalid Base64 format", "error");
    }
  }, [inputText, fileName, decodeFromBase64]);

  const handleSwap = useCallback(() => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
    setConversionType(conversionType === "encode" ? "decode" : "encode");
    showFeedback("Input and output swapped!");
  }, [inputText, outputText, conversionType]);

  const handleCopy = useCallback(async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showFeedback(`${label} copied to clipboard!`);
    } catch (error) {
      showFeedback("Failed to copy to clipboard", "error");
    }
  }, []);

  const handleClear = useCallback(() => {
    setInputText("");
    setOutputText("");
    setFileName("");
    showFeedback("All fields cleared!");
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    setIsProcessing(true);
    setFileName(file.name);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        if (file.type.startsWith('text/')) {
          setInputText(result);
          showFeedback(`Text file "${file.name}" loaded successfully!`);
        } else {
          // For binary files, convert to base64
          const base64 = result.split(',')[1];
          setInputText(base64);
          showFeedback(`File "${file.name}" converted to Base64!`);
        }
        setIsProcessing(false);
      };
      
      if (file.type.startsWith('text/')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    } catch (error) {
      showFeedback("Failed to process file", "error");
      setIsProcessing(false);
    }
  }, []);

  const handleDownload = useCallback((content, filename, contentType = 'text/plain') => {
    try {
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showFeedback(`File "${filename}" downloaded successfully!`);
    } catch (error) {
      showFeedback("Failed to download file", "error");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gray-200 rounded-3xl shadow-neumorphic-inset mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-2xl shadow-neumorphic flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-700 mb-1">Base64 Encoder/Decoder</h1>
              <p className="text-gray-500">Convert text and files to/from Base64 format</p>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mb-6 flex justify-center">
            <Alert className={`max-w-md border-0 shadow-neumorphic-inset ${
              feedback.type === 'error' ? 'bg-red-50' : 'bg-green-50'
            }`}>
              {feedback.type === 'error' ? 
                <AlertCircle className="h-4 w-4 text-red-500" /> : 
                <CheckCircle className="h-4 w-4 text-green-500" />
              }
              <AlertDescription className={feedback.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                {feedback.message}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Conversion Area */}
          <div className="lg:col-span-2 space-y-6">
            <TextAreas 
              inputText={inputText}
              outputText={outputText}
              onInputChange={setInputText}
              onCopy={handleCopy}
              conversionType={conversionType}
            />
            
            <ConversionButtons 
              onEncode={handleEncode}
              onDecode={handleDecode}
              onSwap={handleSwap}
              onClear={handleClear}
              onDownload={handleDownload}
              outputText={outputText}
              conversionType={conversionType}
            />
          </div>

          {/* File Operations Sidebar */}
          <div className="space-y-6">
            <FileDropZone 
              onFileUpload={handleFileUpload}
              isProcessing={isProcessing}
              fileName={fileName}
            />

            {/* Statistics Panel */}
            <div className="bg-gray-200 rounded-3xl p-6 shadow-neumorphic">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Input Length</span>
                  <span className="text-gray-800 font-mono bg-gray-200 px-3 py-1 rounded-xl shadow-neumorphic-inset">
                    {inputText.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Output Length</span>
                  <span className="text-gray-800 font-mono bg-gray-200 px-3 py-1 rounded-xl shadow-neumorphic-inset">
                    {outputText.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Size Ratio</span>
                  <span className="text-gray-800 font-mono bg-gray-200 px-3 py-1 rounded-xl shadow-neumorphic-inset">
                    {inputText.length > 0 ? (outputText.length / inputText.length * 100).toFixed(1) : '0'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-200 rounded-3xl p-6 shadow-neumorphic">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-gray-200 hover:bg-gray-200 text-gray-700 border-0 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200"
                  disabled={isProcessing}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                
                <Button
                  onClick={() => handleDownload(inputText, 'input.txt')}
                  disabled={!inputText.trim()}
                  className="w-full bg-gray-200 hover:bg-gray-200 text-gray-700 border-0 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Input
                </Button>
                
                <Button
                  onClick={() => handleDownload(outputText, conversionType === 'encode' ? 'encoded.txt' : 'decoded.txt')}
                  disabled={!outputText.trim()}
                  className="w-full bg-gray-200 hover:bg-gray-200 text-gray-700 border-0 shadow-neumorphic hover:shadow-neumorphic-pressed transition-all duration-200 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Output
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />
      </div>
      
      {/* Custom Neumorphic Styles */}
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
        .shadow-neumorphic-flat {
          box-shadow: 
            6px 6px 12px rgba(163, 177, 198, 0.3),
            -6px -6px 12px rgba(255, 255, 255, 0.9);
        }
      `}</style>
    </div>
  );
}