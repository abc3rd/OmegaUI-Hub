
import React, { useState, useEffect, useCallback } from 'react';
import { SmartDevice } from '@/entities/SmartDevice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Lightbulb,
  Thermometer,
  Volume2,
  Tv,
  RefreshCw,
  Leaf
} from 'lucide-react';
import { toast } from 'sonner';

const deviceTypeIcons = {
  light: Lightbulb,
  thermostat: Thermometer,
  speaker: Volume2,
  tv: Tv,
  outlet: Zap,
  security_camera: Activity,
  door_lock: Activity,
  sensor: Activity,
  switch: Zap,
  garage_door: Activity
};

const generateEnergyData = (devices) => {
  const now = new Date();
  const hourlyData = [];
  
  // Generate 24 hours of sample data
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now - i * 60 * 60 * 1000);
    let totalUsage = 0;
    
    devices.forEach(device => {
      if (device.is_on && device.energy_usage) {
        // Add some variation based on device type and time of day
        let baseUsage = device.energy_usage || 0;
        const timeVariation = Math.sin((23 - i) * Math.PI / 12) * 0.3 + 0.7; // Peak during evening hours
        const randomVariation = 0.8 + Math.random() * 0.4; // ±20% variation
        totalUsage += baseUsage * timeVariation * randomVariation;
      }
    });
    
    hourlyData.push({
      time: hour.toLocaleTimeString([], { hour: '2-digit' }),
      usage: Math.round(totalUsage * 100) / 100,
      cost: Math.round(totalUsage * 0.12 * 100) / 100 // $0.12 per kWh average
    });
  }
  
  return hourlyData;
};

export default function EnergyMonitor() {
  const [devices, setDevices] = useState([]);
  const [energyData, setEnergyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  const createSampleDevices = useCallback(async () => {
    const sampleDevices = [
      {
        name: 'Living Room Lights',
        device_type: 'light',
        brand: 'Philips Hue',
        room: 'Living Room',
        is_online: true,
        is_on: true,
        brightness: 75,
        energy_usage: 45,
        color: '#FF6B35'
      },
      {
        name: 'Main Thermostat',
        device_type: 'thermostat',
        brand: 'Nest',
        room: 'Hallway',
        is_online: true,
        is_on: true,
        temperature: 72,
        energy_usage: 1200
      },
      {
        name: 'Kitchen Outlets',
        device_type: 'outlet',
        brand: 'TP-Link',
        room: 'Kitchen',
        is_online: true,
        is_on: true,
        energy_usage: 320
      },
      {
        name: 'Living Room TV',
        device_type: 'tv',
        brand: 'Samsung',
        room: 'Living Room',
        is_online: true,
        is_on: false,
        energy_usage: 180
      },
      {
        name: 'Bedroom Lights',
        device_type: 'light',
        brand: 'LIFX',
        room: 'Bedroom',
        is_online: true,
        is_on: false,
        brightness: 0,
        energy_usage: 35
      }
    ];

    try {
      for (const device of sampleDevices) {
        await SmartDevice.create(device);
      }
      toast.success('Sample smart home devices created for monitoring');
    } catch (error) {
      console.error('Error creating sample devices:', error);
    }
  }, []); // No external dependencies needed for this function

  const loadEnergyData = useCallback(async () => {
    try {
      setLoading(true);
      const devicesData = await SmartDevice.list().catch(() => []);
      
      // If no devices exist, create some sample smart devices
      if (devicesData.length === 0) {
        await createSampleDevices();
        const newDevicesData = await SmartDevice.list().catch(() => []);
        setDevices(newDevicesData);
      } else {
        setDevices(devicesData);
      }
      
    } catch (error) {
      console.error('Error loading energy data:', error);
      toast.error('Failed to load energy monitoring data');
    } finally {
      setLoading(false);
    }
  }, [createSampleDevices]); // Depends on createSampleDevices, setLoading, setDevices

  useEffect(() => {
    loadEnergyData();
  }, [loadEnergyData]); // Depends on loadEnergyData

  useEffect(() => {
    if (devices.length > 0) {
      const data = generateEnergyData(devices);
      setEnergyData(data);
    }
  }, [devices]);

  const activeDevices = devices.filter(d => d.is_on);
  const totalCurrentUsage = activeDevices.reduce((sum, device) => sum + (device.energy_usage || 0), 0);
  const dailyUsage = energyData.reduce((sum, hour) => sum + hour.usage, 0);
  const dailyCost = energyData.reduce((sum, hour) => sum + hour.cost, 0);
  const avgHourlyUsage = dailyUsage / 24;

  // Calculate efficiency score
  const onlineDevices = devices.filter(d => d.is_online).length;
  const efficiencyScore = Math.round(((onlineDevices - activeDevices.length) / Math.max(onlineDevices, 1)) * 100);

  const deviceUsageData = devices
    .filter(d => d.energy_usage > 0)
    .sort((a, b) => (b.energy_usage || 0) - (a.energy_usage || 0))
    .map(device => ({
      name: device.name,
      usage: device.is_on ? device.energy_usage : 0,
      potential: device.energy_usage,
      room: device.room
    }));

  const roomUsageData = devices.reduce((acc, device) => {
    const room = device.room || 'Unknown';
    const usage = device.is_on ? (device.energy_usage || 0) : 0;
    
    if (!acc[room]) {
      acc[room] = { room, usage: 0, devices: 0 };
    }
    acc[room].usage += usage;
    acc[room].devices += 1;
    return acc;
  }, {});

  const roomData = Object.values(roomUsageData);
  const colors = ['#282361', '#69378d', '#fdc600', '#28a745', '#ff0000', '#0ea5e9'];

  const refreshData = () => {
    if (devices.length > 0) {
      const newData = generateEnergyData(devices);
      setEnergyData(newData);
      toast.success('Energy data refreshed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Energy Monitor
          </h1>
          <p className="text-muted-foreground">
            Track and optimize your smart home energy consumption
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button variant="outline" className="gap-2">
            <TrendingDown className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Usage
              </CardTitle>
              <Zap className="w-5 h-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {Math.round(totalCurrentUsage)}W
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">
                {activeDevices.length} devices active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Daily Usage
              </CardTitle>
              <Activity className="w-5 h-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {Math.round(dailyUsage * 100) / 100}kWh
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success">-12%</span>
              <span className="text-muted-foreground">vs yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Daily Cost
              </CardTitle>
              <DollarSign className="w-5 h-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              ${Math.round(dailyCost * 100) / 100}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-muted-foreground">
                ~${Math.round(dailyCost * 30 * 100) / 100}/month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Efficiency Score
              </CardTitle>
              <Leaf className="w-5 h-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {efficiencyScore}%
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-success">Optimized</span>
              <span className="text-muted-foreground">energy usage</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Energy Usage Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Energy Usage (24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border opacity-50" />
                  <XAxis 
                    dataKey="time" 
                    fontSize={12}
                    tick={{ fill: 'var(--foreground)' }}
                  />
                  <YAxis fontSize={12} tick={{ fill: 'var(--foreground)' }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                    formatter={(value, name) => [
                      name === 'usage' ? `${value}W` : `$${value}`,
                      name === 'usage' ? 'Power Usage' : 'Cost'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="usage" 
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="var(--secondary)"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Usage Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary" />
              Device Usage Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceUsageData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} tick={{ fill: 'var(--foreground)' }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    fontSize={10}
                    tick={{ fill: 'var(--foreground)' }}
                    width={100}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                    formatter={(value) => [`${value}W`, 'Power Usage']}
                  />
                  <Bar 
                    dataKey="usage" 
                    fill="var(--primary)" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room Usage and Device List */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Room Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-success" />
              Usage by Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="usage"
                    label={({ room, percent }) => 
                      percent > 5 ? `${room} ${(percent * 100).toFixed(0)}%` : ''
                    }
                  >
                    {roomData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}W`, 'Power Usage']}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Status List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Device Status ({devices.length} devices)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {devices.map((device) => {
                  const DeviceIcon = deviceTypeIcons[device.device_type] || Zap;
                  return (
                    <div key={device.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <DeviceIcon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground">{device.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {device.room} • {device.brand}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium text-foreground">
                            {device.is_on ? `${device.energy_usage || 0}W` : 'Off'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {device.is_on ? 'Active' : 'Standby'}
                          </p>
                        </div>
                        <Badge 
                          variant={device.is_online ? 'default' : 'secondary'}
                          className={device.is_online ? 'bg-success' : 'bg-muted'}
                        >
                          {device.is_online ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {devices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p>No smart devices found.</p>
                    <Button 
                      onClick={loadEnergyData} 
                      className="mt-2"
                    >
                      Add Sample Devices
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
