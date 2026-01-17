
import React, { useState, useEffect } from 'react';
import { SmartDevice } from '@/entities/SmartDevice';
import { n8nTrigger } from '@/functions/n8nTrigger';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Home,
  Plus,
  Power,
  Lightbulb,
  Thermometer,
  Shield,
  Lock,
  Speaker,
  Tv,
  Wifi,
  WifiOff,
  Settings,
  Battery,
  Zap,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

const deviceTypeIcons = {
  light: Lightbulb,
  thermostat: Thermometer,
  security_camera: Shield,
  door_lock: Lock,
  speaker: Speaker,
  tv: Tv,
  sensor: Shield,
  switch: Power,
  outlet: Zap,
  garage_door: Home
};

const deviceTypeLabels = {
  light: 'Smart Light',
  thermostat: 'Thermostat',
  security_camera: 'Security Camera',
  door_lock: 'Smart Lock',
  speaker: 'Smart Speaker',
  tv: 'Smart TV',
  sensor: 'Sensor',
  switch: 'Smart Switch',
  outlet: 'Smart Outlet',
  garage_door: 'Garage Door'
};

export default function SmartHome() {
  const [devices, setDevices] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({
    name: '',
    device_type: 'light',
    brand: '',
    room: '',
    n8n_workflow_id: '',
    n8n_device_id: '',
    is_online: true,
    is_on: false,
    brightness: 50,
    temperature: 72,
    volume: 30,
    color: '#ffffff'
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const deviceData = await SmartDevice.list('-created_date');
      setDevices(deviceData);
    } catch (error) {
      console.error('Error loading devices:', error);
      toast.error('Failed to load smart devices');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async () => {
    try {
      if (!newDevice.name || !newDevice.room || !newDevice.n8n_workflow_id) {
        toast.error('Name, Room, and N8n Workflow ID are required');
        return;
      }

      const deviceData = {
          name: newDevice.name,
          device_type: newDevice.device_type,
          brand: newDevice.brand,
          room: newDevice.room,
          n8n_workflow_id: newDevice.n8n_workflow_id,
          n8n_device_id: newDevice.n8n_device_id,
          // Set initial state for new devices
          is_on: newDevice.is_on || false, // Use newDevice's is_on if set, otherwise false
          brightness: newDevice.brightness || 50,
          temperature: newDevice.temperature || 72,
          volume: newDevice.volume || 30,
          color: newDevice.color || '#ffffff',
          is_online: newDevice.is_online || true,
          last_seen: new Date().toISOString()
      };

      if (editingDevice) {
        await SmartDevice.update(editingDevice.id, deviceData);
        toast.success('Device updated successfully');
      } else {
        await SmartDevice.create({
          ...deviceData,
          device_id: `device_${Date.now()}` // Add device_id only for new creation
        });
        toast.success('Device added successfully');
      }

      setNewDevice({
        name: '',
        device_type: 'light',
        brand: '',
        room: '',
        n8n_workflow_id: '',
        n8n_device_id: '',
        is_online: true,
        is_on: false,
        brightness: 50,
        temperature: 72,
        volume: 30,
        color: '#ffffff'
      });
      setEditingDevice(null);
      setShowAddDialog(false);
      loadDevices();
    } catch (error) {
      console.error('Error saving device:', error);
      toast.error('Failed to save device');
    }
  };

  const handleEditDevice = (device) => {
    setNewDevice(device);
    setEditingDevice(device);
    setShowAddDialog(true);
  };

  const handleDeleteDevice = async (deviceId) => {
    try {
      await SmartDevice.delete(deviceId);
      toast.success('Device deleted');
      loadDevices();
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Failed to delete device');
    }
  };

  const sendN8nCommand = async (device, command) => {
    if (!device.n8n_workflow_id) {
      toast.error("This device is not configured for remote control. Please add an N8n Workflow ID.");
      return;
    }

    try {
      await n8nTrigger({
        workflowId: device.n8n_workflow_id,
        data: {
          deviceId: device.n8n_device_id || device.id,
          ...command,
        },
      });
      
      // Optimistically update the UI for a better experience
      const updatedDevices = devices.map(d => {
        if (d.id === device.id) {
          return { ...d, ...command.state };
        }
        return d;
      });
      setDevices(updatedDevices);
      
      // Persist the state change in our database
      await SmartDevice.update(device.id, { ...command.state, last_seen: new Date().toISOString() });
      toast.success("Command sent successfully!");

    } catch (error) {
      console.error('Error sending N8n command:', error);
      toast.error('Failed to send command to device.');
      // Revert optimistic update on failure
      loadDevices();
    }
  };

  const toggleDevice = async (device) => {
    sendN8nCommand(device, { action: 'toggle', state: { is_on: !device.is_on } });
  };

  const updateDeviceProperty = async (device, property, value) => {
    sendN8nCommand(device, { action: 'set_state', state: { [property]: value } });
  };

  const rooms = [...new Set(devices.map(d => d.room))].filter(Boolean);
  const filteredDevices = selectedRoom === 'all' 
    ? devices 
    : devices.filter(d => d.room === selectedRoom);

  const onlineDevices = devices.filter(d => d.is_online).length;
  const activeDevices = devices.filter(d => d.is_on && d.is_online).length;
  const totalEnergyUsage = devices
    .filter(d => d.is_on && d.energy_usage)
    .reduce((sum, d) => sum + (d.energy_usage || 0), 0);

  const DeviceIcon = ({ type }) => {
    const Icon = deviceTypeIcons[type] || Home;
    return <Icon className="w-5 h-5" />;
  };

  const DeviceCard = ({ device }) => {
    const isControllable = ['light', 'switch', 'outlet', 'tv'].includes(device.device_type);
    const hasSlider = ['light'].includes(device.device_type);
    const hasTempControl = device.device_type === 'thermostat';
    const hasVolumeControl = ['speaker', 'tv'].includes(device.device_type);
    const hasColorControl = device.device_type === 'light' && device.color;

    return (
      <Card className={`transition-all duration-200 ${
        device.is_online 
          ? device.is_on 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
          : 'border-red-200 bg-red-50 dark:bg-red-950/20'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                device.is_online
                  ? device.is_on 
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <DeviceIcon type={device.device_type} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{device.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {deviceTypeLabels[device.device_type]}
                  </Badge>
                  {device.room && (
                    <Badge variant="secondary" className="text-xs">
                      {device.room}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {device.is_online ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEditDevice(device)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Power Control */}
          {isControllable && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Power</span>
              <Switch
                checked={device.is_on && device.is_online}
                onCheckedChange={() => toggleDevice(device)}
                disabled={!device.is_online}
              />
            </div>
          )}

          {/* Brightness Control */}
          {hasSlider && device.is_on && device.is_online && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Brightness</span>
                <span className="text-sm font-medium">{device.brightness || 50}%</span>
              </div>
              <Slider
                value={[device.brightness || 50]}
                onValueChange={(value) => updateDeviceProperty(device, 'brightness', value[0])}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* Color Control */}
          {hasColorControl && device.is_on && device.is_online && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={device.color || '#ffffff'}
                  onChange={(e) => updateDeviceProperty(device, 'color', e.target.value)}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">
                  {device.color || '#ffffff'}
                </span>
              </div>
            </div>
          )}

          {/* Temperature Control */}
          {hasTempControl && device.is_online && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Temperature</span>
                <span className="text-sm font-medium">{device.temperature || 72}°F</span>
              </div>
              <Slider
                value={[device.temperature || 72]}
                onValueChange={(value) => updateDeviceProperty(device, 'temperature', value[0])}
                min={60}
                max={85}
                step={1}
                className="w-full"
              />
            </div>
          )}

          {/* Volume Control */}
          {hasVolumeControl && device.is_on && device.is_online && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Volume</span>
                <span className="text-sm font-medium">{device.volume || 30}%</span>
              </div>
              <Slider
                value={[device.volume || 30]}
                onValueChange={(value) => updateDeviceProperty(device, 'volume', value[0])}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          )}

          {/* Device Info */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Status</span>
              <span className={device.is_online ? 'text-green-600' : 'text-red-600'}>
                {device.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
            {device.battery_level && (
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Battery className="w-3 h-3" />
                  Battery
                </span>
                <span>{device.battery_level}%</span>
              </div>
            )}
            {device.energy_usage && device.is_on && (
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Power
                </span>
                <span>{device.energy_usage}W</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Home className="w-6 h-6" />
            Smart Home Dashboard
          </h1>
          <p className="text-muted-foreground">
            Control and monitor all your smart devices
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="w-4 h-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDevice ? 'Edit Device' : 'Add New Device'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Connect your devices using N8n. Create an N8n workflow with a webhook trigger, add your device node (e.g., Philips Hue), and paste the Workflow ID below.
                  </p>
              </div>

              <div>
                <Label htmlFor="device-name">Device Name *</Label>
                <Input
                  id="device-name"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                  placeholder="Living Room Light"
                />
              </div>
              
              <div>
                <Label htmlFor="device-type">Device Type</Label>
                <Select value={newDevice.device_type} onValueChange={(value) => setNewDevice({...newDevice, device_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(deviceTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="room">Room *</Label>
                <Input
                  id="room"
                  value={newDevice.room}
                  onChange={(e) => setNewDevice({...newDevice, room: e.target.value})}
                  placeholder="Living Room"
                />
              </div>

              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={newDevice.brand}
                  onChange={(e) => setNewDevice({...newDevice, brand: e.target.value})}
                  placeholder="Philips, Nest, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="n8n-workflow-id">N8n Workflow ID *</Label>
                <Input
                  id="n8n-workflow-id"
                  value={newDevice.n8n_workflow_id || ''}
                  onChange={(e) => setNewDevice({...newDevice, n8n_workflow_id: e.target.value})}
                  placeholder="e.g., 4"
                />
              </div>

              <div>
                <Label htmlFor="n8n-device-id">Device ID (for N8n)</Label>
                <Input
                  id="n8n-device-id"
                  value={newDevice.n8n_device_id || ''}
                  onChange={(e) => setNewDevice({...newDevice, n8n_device_id: e.target.value})}
                  placeholder="Optional, e.g., 'living_room_light_1'"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  setEditingDevice(null);
                  setNewDevice({
                    name: '',
                    device_type: 'light',
                    brand: '',
                    room: '',
                    n8n_workflow_id: '',
                    n8n_device_id: '',
                    is_online: true,
                    is_on: false,
                    brightness: 50,
                    temperature: 72,
                    volume: 30,
                    color: '#ffffff'
                  });
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddDevice}>
                  {editingDevice ? 'Update' : 'Add Device'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{devices.length}</p>
                <p className="text-sm text-muted-foreground">Total Devices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{onlineDevices}</p>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Power className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeDevices}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalEnergyUsage}W</p>
                <p className="text-sm text-muted-foreground">Power Usage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Filter */}
      <div className="flex items-center gap-4">
        <Label htmlFor="room-filter">Filter by Room:</Label>
        <Select value={selectedRoom} onValueChange={setSelectedRoom}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            {rooms.map(room => (
              <SelectItem key={room} value={room}>{room}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Devices Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded" />
                  <div className="h-6 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDevices.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {devices.length === 0 ? 'No Smart Devices Yet' : 'No Devices in Selected Room'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {devices.length === 0 
                ? 'Start building your smart home by adding your first device'
                : 'Try selecting a different room or add devices to this room'
              }
            </p>
            {devices.length === 0 && (
              <Button onClick={() => setShowAddDialog(true)} className="bg-primary hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" />
                Add Your First Device
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
