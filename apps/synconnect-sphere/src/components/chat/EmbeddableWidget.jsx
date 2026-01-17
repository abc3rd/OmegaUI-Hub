import React, { useState } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Embeddable Chat Widget
 * 
 * Usage for external platforms (WordPress, GoHighLevel, etc.):
 * 
 * 1. Add this script tag to your website:
 *    <script src="https://your-app-url.base44.app/widget.js"></script>
 * 
 * 2. Initialize the widget:
 *    <script>
 *      CloudConnectChat.init({
 *        appUrl: 'https://your-app-url.base44.app',
 *        position: 'bottom-right', // or 'bottom-left'
 *        primaryColor: '#10b981'
 *      });
 *    </script>
 * 
 * The widget will appear as a floating button that opens the chat interface.
 */

export default function EmbeddableWidget({ 
  appUrl, 
  position = 'bottom-right',
  primaryColor = '#10b981' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110",
            positionClasses[position]
          )}
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-50 transition-all",
            positionClasses[position],
            isMinimized ? "w-80 h-14" : "w-96 h-[600px]"
          )}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 rounded-t-lg shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Cloud Connect Chat</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="bg-white rounded-b-lg shadow-lg overflow-hidden" style={{ height: 'calc(100% - 56px)' }}>
              <iframe
                src={`${appUrl}/chat`}
                className="w-full h-full border-0"
                title="Cloud Connect Chat"
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}