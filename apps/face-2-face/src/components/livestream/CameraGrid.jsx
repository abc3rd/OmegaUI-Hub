import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Video, WifiOff, Maximize2,
  Circle, Eye, Shield
} from "lucide-react";
import { motion } from "framer-motion";

export default function CameraGrid({ cameras, layout, onCameraSelect, facialRecognitionEnabled }) {
  const getGridClass = () => {
    switch(layout) {
      case 1: return "grid-cols-1";
      case 2: return "grid-cols-1 md:grid-cols-2";
      case 4: return "grid-cols-2 md:grid-cols-2";
      case 8: return "grid-cols-2 md:grid-cols-4";
      case 16: return "grid-cols-2 md:grid-cols-4";
      default: return "grid-cols-1";
    }
  };

  return (
    <div className={`grid ${getGridClass()} gap-4`}>
      {cameras.map((camera) => (
        <CameraFeed 
          key={camera.id}
          camera={camera}
          onClick={() => onCameraSelect(camera)}
          facialRecognitionEnabled={facialRecognitionEnabled}
        />
      ))}
    </div>
  );
}

function CameraFeed({ camera, onClick, facialRecognitionEnabled }) {
  const isOnline = camera.status === "online";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="bg-slate-900/70 border-cyan-500/20 hover:border-cyan-500/40 transition-all cursor-pointer overflow-hidden group"
        onClick={onClick}
      >
        <CardContent className="p-0">
          {/* Video Stream Area */}
          <div className="relative aspect-video bg-slate-950">
            {isOnline ? (
              <>
                {/* Placeholder for actual video stream */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-cyan-400 mx-auto mb-2 animate-pulse" />
                    <p className="text-gray-400 text-sm">Stream Loading...</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Connect to: {camera.stream_url || camera.ip_address}
                    </p>
                  </div>
                </div>
                
                {/* Live indicator */}
                <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-500/90 px-3 py-1 rounded-full">
                  <Circle className="w-2 h-2 fill-white animate-pulse" />
                  <span className="text-white text-xs font-bold">LIVE</span>
                </div>

                {/* Facial Recognition indicator */}
                {facialRecognitionEnabled && camera.settings?.facial_recognition && (
                  <div className="absolute top-3 right-3 flex items-center gap-2 bg-purple-500/90 px-3 py-1 rounded-full">
                    <Eye className="w-3 h-3 text-white" />
                    <span className="text-white text-xs font-bold">FR</span>
                  </div>
                )}

                {/* Recording indicator */}
                {camera.settings?.recording_enabled && (
                  <div className="absolute top-14 right-3 bg-red-600/90 p-2 rounded-full animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <WifiOff className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Camera Offline</p>
                </div>
              </div>
            )}

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-end">
                <div>
                  <p className="text-white font-bold text-sm">{camera.camera_name}</p>
                  <p className="text-gray-400 text-xs">{camera.ip_address}</p>
                </div>
                <Button size="sm" variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Camera Info Footer */}
          <div className="p-3 bg-slate-900/90 border-t border-cyan-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {camera.camera_type}
                </Badge>
                {camera.resolution && (
                  <span className="text-gray-500 text-xs">{camera.resolution}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {camera.settings?.facial_recognition && facialRecognitionEnabled && (
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs border-purple-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    FR
                  </Badge>
                )}
                {camera.settings?.motion_detection && (
                  <Badge className="bg-cyan-500/20 text-cyan-400 text-xs border-cyan-500/30">
                    MD
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}