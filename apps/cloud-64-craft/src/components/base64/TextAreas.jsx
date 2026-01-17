import React from "react";
import { Copy, Type, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function TextAreas({ inputText, outputText, onInputChange, onCopy, conversionType }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* Input Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-xl shadow-neumorphic-inset flex items-center justify-center">
              <Type className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Input Text</h3>
          </div>
          <Button
            onClick={() => onCopy(inputText, "Input text")}
            disabled={!inputText.trim()}
            size="sm"
            className="bg-gray-200 hover:bg-gray-200 text-gray-600 border-0 shadow-neumorphic-flat hover:shadow-neumorphic-pressed transition-all duration-200 disabled:opacity-50"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="relative">
          <Textarea
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter text to encode or Base64 to decode..."
            className="min-h-[400px] bg-gray-200 border-0 shadow-neumorphic-inset text-gray-700 placeholder-gray-400 resize-none focus:shadow-neumorphic-inset focus:outline-none font-mono text-sm p-4 rounded-2xl"
            style={{ fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace' }}
          />
          {inputText && (
            <div className="absolute bottom-4 right-4 bg-gray-200 px-3 py-1 rounded-lg shadow-neumorphic-inset text-xs text-gray-500 font-mono">
              {inputText.length} chars
            </div>
          )}
        </div>
      </div>

      {/* Output Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-xl shadow-neumorphic-inset flex items-center justify-center">
              <Hash className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">
              {conversionType === 'encode' ? 'Base64 Output' : 'Decoded Output'}
            </h3>
          </div>
          <Button
            onClick={() => onCopy(outputText, conversionType === 'encode' ? 'Base64 output' : 'Decoded output')}
            disabled={!outputText.trim()}
            size="sm"
            className="bg-gray-200 hover:bg-gray-200 text-gray-600 border-0 shadow-neumorphic-flat hover:shadow-neumorphic-pressed transition-all duration-200 disabled:opacity-50"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="relative">
          <Textarea
            value={outputText}
            readOnly
            placeholder="Converted text will appear here..."
            className="min-h-[400px] bg-gray-200 border-0 shadow-neumorphic-inset text-gray-700 placeholder-gray-400 resize-none focus:outline-none font-mono text-sm p-4 rounded-2xl cursor-default"
            style={{ fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace' }}
          />
          {outputText && (
            <div className="absolute bottom-4 right-4 bg-gray-200 px-3 py-1 rounded-lg shadow-neumorphic-inset text-xs text-gray-500 font-mono">
              {outputText.length} chars
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Styles */}
      <style>{`
        .shadow-neumorphic-inset {
          box-shadow: 
            inset 8px 8px 16px rgba(163, 177, 198, 0.4),
            inset -8px -8px 16px rgba(255, 255, 255, 0.9);
        }
        .shadow-neumorphic-flat {
          box-shadow: 
            6px 6px 12px rgba(163, 177, 198, 0.3),
            -6px -6px 12px rgba(255, 255, 255, 0.9);
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