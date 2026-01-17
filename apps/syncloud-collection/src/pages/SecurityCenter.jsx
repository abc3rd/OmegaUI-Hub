
import React, { useState, useEffect, useCallback } from 'react';
import { SecurityCamera } from '@/entities/SecurityCamera';
import { SecurityEvent } from '@/entities/SecurityEvent';
import { CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Camera,
  Grid3X3,
  Grid2X2,
  Square,
  ChevronLeft,
  ChevronRight,
  Plus,
  Volume2,
  VolumeX,
  RotateCcw,
  Wifi,
  WifiOff,
  Eye,
  Volume2 as SoundIcon, // Alias Volume2 for sound detection
  ListVideo,
  X // Import X for close button in EventLog
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils'; // Assuming cn utility is available

const CameraFeed = ({ camera, className, showControls = true, isAlerting = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleStreamLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setIsConnected(true);
  };

  const handleStreamError = () => {
    setIsLoading(false);
    setHasError(true);
    setIsConnected(false);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const refreshStream = () => {
    setIsLoading(true);
    setHasError(false);
    setIsConnected(false);
  };

  return (
    <div className={cn(
      "relative bg-black rounded-lg overflow-hidden transition-all duration-300",
      className,
      isAlerting && "ring-4 ring-red-500 ring-offset-2 ring-offset-background animate-pulse"
    )}>
      {/* AI Visualization Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20">
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg opacity-50"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg opacity-50"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-lg opacity-50"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50 rounded-br-lg opacity-50"></div>
      </div>

      {/* Camera Status Bar */}
      <div className="absolute top-2 left-2 right-2 z-30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
            {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {camera.name}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {camera.resolution}
          </Badge>
        </div>
        {showControls && (
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:bg-white/20" onClick={toggleMute}>
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6 text-white hover:bg-white/20" onClick={refreshStream}>
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Connecting to {camera.name}...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center text-white">
            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm mb-2">Connection failed</p>
            <Button size="sm" onClick={refreshStream} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Video Stream */}
      <img
        src={camera.stream_url}
        alt={camera.name}
        className="w-full h-full object-cover"
        onLoad={handleStreamLoad}
        onError={handleStreamError}
        style={{ display: hasError ? 'none' : 'block' }}
      />

      {/* Bottom Controls */}
      {showControls && isConnected && (
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-20">
          <div className="flex items-center gap-2">
            {camera.recording_enabled && (
              <Badge variant="destructive" className="text-xs animate-pulse">
                ● REC
              </Badge>
            )}
            {camera.motion_detection && (
              <Badge variant="secondary" className="text-xs">
                <Eye className="w-3 h-3 mr-1" />
                Motion
              </Badge>
            )}
            {camera.sound_detection && (
              <Badge variant="secondary" className="text-xs">
                <SoundIcon className="w-3 h-3 mr-1" />
                Sound
              </Badge>
            )}
          </div>
          <div className="text-white text-xs bg-black/50 px-2 py-1 rounded">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

const CameraGrid = ({ cameras, layout, startIndex, onCameraClick, activeAlerts }) => {
  const getGridClass = () => {
    switch (layout) {
      case 1: return "grid-cols-1 grid-rows-1";
      case 2: return "grid-cols-1 grid-rows-2";
      case 4: return "grid-cols-2 grid-rows-2";
      case 8: return "grid-cols-4 grid-rows-2";
      default: return "grid-cols-2 grid-rows-2";
    }
  };

  const camerasToShow = cameras.slice(startIndex, startIndex + layout);

  return (
    <div className={`grid gap-4 h-full ${getGridClass()}`}>
      {camerasToShow.map((camera) => (
        <CameraFeed
          key={camera.id}
          camera={camera}
          className="min-h-[200px] cursor-pointer"
          onClick={() => onCameraClick?.(camera)}
          isAlerting={activeAlerts.has(camera.id)}
        />
      ))}
      
      {/* Fill empty slots if needed */}
      {Array.from({ length: layout - camerasToShow.length }, (_, i) => (
        <div key={`empty-${i}`} className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[200px]">
          <div className="text-center text-gray-400">
            <Camera className="w-12 h-12 mx-auto mb-4" />
            <p className="text-sm">No Camera</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const CameraForm = ({ camera, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    camera_type: 'ip_camera',
    stream_url: '',
    backup_stream_url: '',
    username: '',
    password: '',
    resolution: '1080p',
    location: '',
    recording_enabled: false,
    motion_detection: false,
    sound_detection: false, // New field
    night_vision: false,
    pan_tilt_zoom: false,
    ...camera
  });

  const handleSave = () => {
    if (!formData.name || !formData.stream_url) {
      toast.error('Name and stream URL are required');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="space-y-4 max-w-md">
      <div>
        <Label>Camera Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Front Door Camera"
        />
      </div>

      <div>
        <Label>Stream URL</Label>
        <Input
          value={formData.stream_url}
          onChange={(e) => setFormData({...formData, stream_url: e.target.value})}
          placeholder="http://192.168.1.100:8080/video"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Username</Label>
          <Input
            value={formData.username}
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            placeholder="admin"
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Camera Type</Label>
          <Select value={formData.camera_type} onValueChange={(value) => setFormData({...formData, camera_type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ip_camera">IP Camera</SelectItem>
              <SelectItem value="rtsp_stream">RTSP Stream</SelectItem>
              <SelectItem value="mjpeg_stream">MJPEG Stream</SelectItem>
              <SelectItem value="webcam">Webcam</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Resolution</Label>
          <Select value={formData.resolution} onValueChange={(value) => setFormData({...formData, resolution: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="720p">720p</SelectItem>
              <SelectItem value="1080p">1080p</SelectItem>
              <SelectItem value="4K">4K</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Location</Label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          placeholder="Front entrance"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            checked={formData.recording_enabled}
            onCheckedChange={(checked) => setFormData({...formData, recording_enabled: checked})}
          />
          <Label>Recording Enabled</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            checked={formData.motion_detection}
            onCheckedChange={(checked) => setFormData({...formData, motion_detection: checked})}
          />
          <Label>Motion Detection</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            checked={formData.sound_detection}
            onCheckedChange={(checked) => setFormData({...formData, sound_detection: checked})}
          />
          <Label>Sound Detection</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            checked={formData.night_vision}
            onCheckedChange={(checked) => setFormData({...formData, night_vision: checked})}
          />
          <Label>Night Vision</Label>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleSave} className="flex-1">
          Save Camera
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

const EventLog = ({ events, onAcknowledge, onClose, isOpen }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'motion_detected': return <Eye className="w-4 h-4 text-yellow-500" />;
      case 'sound_detected': return <SoundIcon className="w-4 h-4 text-blue-500" />;
      case 'camera_offline': return <WifiOff className="w-4 h-4 text-red-500" />;
      case 'camera_online': return <Wifi className="w-4 h-4 text-green-500" />;
      default: return <ListVideo className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={cn(
        "fixed top-0 right-0 h-full w-96 bg-card text-card-foreground shadow-2xl z-[100] transform transition-transform duration-300",
        isOpen ? 'translate-x-0' : 'translate-x-full'
    )}>
        <div className="flex flex-col h-full">
            <header className="p-4 border-b border-border flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ListVideo />
                    Event Log
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </header>
            <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
                {events.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>No security events recorded yet.</p>
                    </div>
                ) : (
                    events.map(event => (
                        <div key={event.id} className={cn("p-3 rounded-lg border flex items-start gap-3", !event.is_acknowledged && "bg-blue-500/10 border-blue-500/30")}>
                            <div className="mt-1">{getEventIcon(event.event_type)}</div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm capitalize">{event.event_type.replace('_', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{event.camera_name}</p>
                                <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                            </div>
                            {!event.is_acknowledged && (
                                <Button size="sm" variant="ghost" onClick={() => onAcknowledge(event.id)}>
                                    Acknowledge
                                </Button>
                            )}
                        </div>
                    ))
                )}
            </CardContent>
        </div>
    </div>
  );
};

export default function SecurityCenter() {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState(4);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventLog, setShowEventLog] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(new Set());

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [cameraData, eventData] = await Promise.all([
        SecurityCamera.list('sort_order'),
        SecurityEvent.list('-timestamp', 50)
      ]);
      setCameras(cameraData);
      setEvents(eventData);

      const unacknowledgedAlerts = new Set(
        eventData.filter(e => !e.is_acknowledged).map(e => e.camera_id)
      );
      setActiveAlerts(unacknowledgedAlerts);

    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load security data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  
  // Event simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      cameras.forEach(camera => {
        // Assuming 'is_active' is a property indicating the camera is currently streaming or enabled
        // and motion_detection / sound_detection are enabled in camera settings
        if (camera.is_active && (camera.motion_detection || camera.sound_detection)) {
          const rand = Math.random();
          if (rand < 0.05) { // 5% chance per interval to trigger an event
            let eventType;
            if (camera.motion_detection && camera.sound_detection) {
              eventType = Math.random() > 0.5 ? 'motion_detected' : 'sound_detected';
            } else if (camera.motion_detection) {
              eventType = 'motion_detected';
            } else if (camera.sound_detection) {
              eventType = 'sound_detected';
            } else {
              return; // No detection enabled, skip event generation
            }

            const newEvent = {
              camera_id: camera.id,
              camera_name: camera.name,
              event_type: eventType,
              timestamp: new Date().toISOString()
            };

            SecurityEvent.create(newEvent).then(() => {
              toast.warning(`${eventType.replace('_', ' ')} on ${camera.name}`);
              loadAllData(); // Reload all data to update event log and active alerts
            }).catch(error => {
                console.error("Failed to create simulated event:", error);
                toast.error("Failed to create simulated event");
            });
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [cameras, loadAllData]);

  const handleSaveCamera = async (cameraData) => {
    try {
      if (editingCamera) {
        await SecurityCamera.update(editingCamera.id, cameraData);
        toast.success('Camera updated successfully');
      } else {
        await SecurityCamera.create(cameraData);
        toast.success('Camera added successfully');
      }
      setShowAddDialog(false);
      setEditingCamera(null);
      loadAllData(); // Call loadAllData instead of loadCameras
    } catch (error) {
      toast.error('Failed to save camera');
      console.error(error);
    }
  };

  const handleAcknowledgeEvent = async (eventId) => {
    try {
      await SecurityEvent.update(eventId, { is_acknowledged: true });
      loadAllData();
      toast.success("Event acknowledged.");
    } catch (error) {
      toast.error("Failed to acknowledge event.");
      console.error(error);
    }
  };

  const totalPages = Math.ceil(cameras.length / layout);
  const startIndex = currentPage * layout;

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading security cameras and events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Security Center</h1>
          <Badge variant="outline" className="text-sm">
            {cameras.length} Cameras
          </Badge>
          {cameras.length > 0 && (
            <Badge variant="outline" className="text-sm">
              Page {currentPage + 1} of {totalPages === 0 ? 1 : totalPages}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Controls */}
          <div className="flex gap-1">
            <Button 
              variant={layout === 1 ? "default" : "outline"} 
              size="sm"
              onClick={() => setLayout(1)}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button 
              variant={layout === 2 ? "default" : "outline"} 
              size="sm"
              onClick={() => setLayout(2)}
            >
              <div className="flex flex-col gap-0.5">
                <div className="w-2 h-1 bg-current"></div>
                <div className="w-2 h-1 bg-current"></div>
              </div>
            </Button>
            <Button 
              variant={layout === 4 ? "default" : "outline"} 
              size="sm"
              onClick={() => setLayout(4)}
            >
              <Grid2X2 className="w-4 h-4" />
            </Button>
            <Button 
              variant={layout === 8 ? "default" : "outline"} 
              size="sm"
              onClick={() => setLayout(8)}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevPage}
              disabled={currentPage === 0 || cameras.length === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPage}
              disabled={currentPage >= totalPages - 1 || cameras.length === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" onClick={() => setShowEventLog(true)}>
            <ListVideo className="w-4 h-4 mr-2" />
            Event Log
            {activeAlerts.size > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {activeAlerts.size}
                </span>
            )}
          </Button>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Camera
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCamera ? 'Edit Camera' : 'Add New Camera'}
                </DialogTitle>
              </DialogHeader>
              <CameraForm
                camera={editingCamera}
                onSave={handleSaveCamera}
                onCancel={() => {
                  setShowAddDialog(false);
                  setEditingCamera(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Camera Grid */}
      <div className="flex-1">
        {cameras.length > 0 ? (
          <CameraGrid
            cameras={cameras}
            layout={layout}
            startIndex={startIndex}
            onCameraClick={(camera) => {
              setEditingCamera(camera);
              setShowAddDialog(true);
            }}
            activeAlerts={activeAlerts}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No Cameras Added</h3>
              <p className="text-gray-500 mb-4">Add your first security camera to start monitoring</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Camera
              </Button>
            </div>
          </div>
        )}
      </div>

      <EventLog
        isOpen={showEventLog}
        onClose={() => setShowEventLog(false)}
        events={events}
        onAcknowledge={handleAcknowledgeEvent}
      />
    </div>
  );
}
