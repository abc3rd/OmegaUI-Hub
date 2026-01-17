import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Home as HomeIcon,
  Shield,
  Zap,
  Settings,
  ArrowRight,
  Lightbulb,
  Activity
} from 'lucide-react';
import { SmartDevice } from '@/entities/SmartDevice';
import { AutomationRule } from '@/entities/AutomationRule';

export default function SmartHomeOverview() {
  const [smartStats, setSmartStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSmartStats();
  }, []);

  const loadSmartStats = async () => {
    try {
      const [devices, rules] = await Promise.all([
        SmartDevice.list(),
        AutomationRule.list()
      ]);

      const onlineDevices = devices.filter(d => d.is_online);
      const activeRules = rules.filter(r => r.is_active);
      const deviceTypes = [...new Set(devices.map(d => d.device_type))];
      
      setSmartStats({
        totalDevices: devices.length,
        onlineDevices: onlineDevices.length,
        deviceTypes: deviceTypes.length,
        totalRules: rules.length,
        activeRules: activeRules.length
      });
    } catch (error) {
      console.error('Failed to load smart home stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto">
          <HomeIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Smart Home</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Control and automate your entire home with intelligent device management, energy monitoring, 
            security systems, and custom automation rules. Create a truly connected living experience.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">Device Control</Badge>
          <Badge className="bg-cyan-100 text-cyan-800">Automation</Badge>
          <Badge className="bg-green-100 text-green-800">Energy Management</Badge>
        </div>
      </div>

      {/* Smart Home Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Connected Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <HomeIcon className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : smartStats.totalDevices}</div>
                <div className="text-xs text-green-600">{smartStats.onlineDevices} online</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Device Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Lightbulb className="w-8 h-8 text-yellow-500" />
              <div className="text-2xl font-bold">{loading ? '...' : smartStats.deviceTypes}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Automation Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : smartStats.totalRules}</div>
                <div className="text-xs text-muted-foreground">{smartStats.activeRules} active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <div className="text-xs text-muted-foreground">All systems operational</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HomeIcon className="w-5 h-5" />
            What is Smart Home?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Smart Home technology transforms your living space into an intelligent, responsive environment. 
            Control lights, climate, security, and entertainment systems from a unified dashboard while 
            creating custom automation rules that make your home work exactly how you want it to.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Core Capabilities:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Unified device control dashboard</li>
                <li>• Custom automation rule creation</li>
                <li>• Real-time energy monitoring</li>
                <li>• Advanced security management</li>
                <li>• Voice and mobile control integration</li>
                <li>• Scheduling and scene management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Tech-savvy homeowners</li>
                <li>• Energy-conscious families</li>
                <li>• Security-minded individuals</li>
                <li>• Busy professionals</li>
                <li>• Accessibility-focused users</li>
                <li>• Anyone wanting home convenience</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Smart Home Applications</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to={createPageUrl('SmartHome')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HomeIcon className="w-5 h-5 text-blue-500" />
                    Device Dashboard
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Control all your smart devices from one central location. Monitor status, 
                  adjust settings, and manage your entire connected home ecosystem effortlessly.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Device Control</Badge>
                  <Badge variant="outline">Status Monitoring</Badge>
                  <Badge variant="outline">Unified Interface</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('SmartAutomation')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-500" />
                    Automation Rules
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Create custom automation rules that make your home intelligent. Set up triggers, 
                  conditions, and actions that happen automatically based on your preferences.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Custom Rules</Badge>
                  <Badge variant="outline">Smart Triggers</Badge>
                  <Badge variant="outline">Automated Actions</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('EnergyMonitor')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Energy Monitor
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Track your home's energy consumption in real-time. Identify energy-hungry devices, 
                  optimize usage patterns, and reduce your environmental impact and utility bills.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Real-Time Monitoring</Badge>
                  <Badge variant="outline">Usage Analytics</Badge>
                  <Badge variant="outline">Cost Optimization</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('SecurityCenter')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-500" />
                    Security Center
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Comprehensive home security management with camera monitoring, door lock control, 
                  motion detection, and intelligent alerts to keep your family safe.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Security Monitoring</Badge>
                  <Badge variant="outline">Smart Alerts</Badge>
                  <Badge variant="outline">Access Control</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Smart Home Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Home Setup Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Connect</h4>
              <p className="text-sm text-muted-foreground">Add and configure your smart devices in the dashboard</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Automate</h4>
              <p className="text-sm text-muted-foreground">Create custom automation rules for your daily routines</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Monitor</h4>
              <p className="text-sm text-muted-foreground">Track energy usage and optimize for efficiency and cost savings</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-red-600 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Secure</h4>
              <p className="text-sm text-muted-foreground">Set up security monitoring and access controls</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              Energy Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Reduce energy consumption through intelligent automation and real-time monitoring. 
              Lower your utility bills while reducing your environmental impact.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-red-500" />
              Enhanced Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Keep your home secure with intelligent monitoring, automated alerts, and remote access control. 
              Peace of mind whether you're home or away.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-purple-500" />
              Convenience & Comfort
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automate daily routines and create the perfect environment for every moment. 
              Your home adapts to your lifestyle automatically.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Smart Home</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Connect Your Devices</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Start by adding your existing smart devices to the dashboard. 
                Even a few lights or a thermostat can make a big difference.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Create Simple Automations</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Set up basic automation rules like turning lights on at sunset 
                or adjusting temperature when you arrive home.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('SmartHome')}>Device Dashboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('SmartAutomation')}>Create Automation</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}