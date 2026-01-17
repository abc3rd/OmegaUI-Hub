import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Sprout,
  Scissors,
  Ruler,
  Flower,
  ArrowRight,
  TreePine,
  Droplets,
  Sun
} from 'lucide-react';
import { Plant } from '@/entities/Plant';
import { YardTask } from '@/entities/YardTask';
import { YardLayout } from '@/entities/YardLayout';

export default function YardGardenOverview() {
  const [yardStats, setYardStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadYardStats();
  }, []);

  const loadYardStats = async () => {
    try {
      const [plants, tasks, layouts] = await Promise.all([
        Plant.list(),
        YardTask.list(),
        YardLayout.list()
      ]);

      const houseplants = plants.filter(p => p.category === 'Houseplant');
      const overdueTasks = tasks.filter(task => {
        if (!task.last_completed) return true;
        const nextDue = new Date(task.last_completed);
        nextDue.setDate(nextDue.getDate() + task.frequency_days);
        return nextDue <= new Date();
      });

      setYardStats({
        totalPlants: plants.length,
        houseplants: houseplants.length,
        outdoorPlants: plants.length - houseplants.length,
        totalTasks: tasks.length,
        overdueTasks: overdueTasks.length,
        totalLayouts: layouts.length
      });
    } catch (error) {
      console.error('Failed to load yard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Sprout className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Yard & Garden</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your outdoor spaces with intelligent plant care, maintenance tracking, 
            3D yard design tools, and smart landscaping solutions. Create beautiful, thriving gardens.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-green-100 text-green-800">Plant Care</Badge>
          <Badge className="bg-emerald-100 text-emerald-800">Yard Design</Badge>
          <Badge className="bg-lime-100 text-lime-800">Maintenance Tracking</Badge>
        </div>
      </div>

      {/* Yard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Total Plants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Sprout className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : yardStats.totalPlants}</div>
                <div className="text-xs text-muted-foreground">{yardStats.houseplants} indoor, {yardStats.outdoorPlants} outdoor</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Maintenance Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Scissors className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : yardStats.totalTasks}</div>
                <div className="text-xs text-orange-600">{yardStats.overdueTasks} overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Yard Designs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <TreePine className="w-8 h-8 text-emerald-500" />
              <div className="text-2xl font-bold">{loading ? '...' : yardStats.totalLayouts}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Care Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Droplets className="w-8 h-8 text-cyan-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">Good</div>
                <div className="text-xs text-muted-foreground">Overall health</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="w-5 h-5" />
            What is Yard & Garden?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Yard & Garden tools help you create and maintain beautiful outdoor spaces through intelligent plant care, 
            maintenance scheduling, and advanced 3D design capabilities. Whether you're tending houseplants or 
            designing entire landscapes, these tools provide the guidance and organization you need for success.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Core Features:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Individual plant care tracking</li>
                <li>• Maintenance task scheduling</li>
                <li>• 3D yard design and planning</li>
                <li>• Sod and material calculators</li>
                <li>• Watering and fertilizing reminders</li>
                <li>• Seasonal care guidance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Homeowners and renters</li>
                <li>• Gardening enthusiasts</li>
                <li>• Landscape designers</li>
                <li>• Plant collectors and hobbyists</li>
                <li>• Property maintenance teams</li>
                <li>• Anyone growing plants</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Garden & Yard Tools</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to={createPageUrl('YardCare')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-blue-500" />
                    Care Hub
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Manage all your yard maintenance tasks with intelligent scheduling and reminders. 
                  Keep track of mowing, pruning, fertilizing, and seasonal care activities.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Task Scheduling</Badge>
                  <Badge variant="outline">Smart Reminders</Badge>
                  <Badge variant="outline">Maintenance Tracking</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('MyPlants')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flower className="w-5 h-5 text-green-500" />
                    My Plants
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Track individual plants with personalized care schedules, watering reminders, 
                  and health monitoring. Perfect for both indoor houseplants and outdoor gardens.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Plant Profiles</Badge>
                  <Badge variant="outline">Care Reminders</Badge>
                  <Badge variant="outline">Health Tracking</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('YardDesigner')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-emerald-500" />
                    Yard Designer
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Design your perfect outdoor space with our 3D yard planning tool. 
                  Visualize layouts, plan installations, and create beautiful landscapes.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">3D Design</Badge>
                  <Badge variant="outline">Layout Planning</Badge>
                  <Badge variant="outline">Visual Preview</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('SodCalculator')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-orange-500" />
                    Sod Calculator
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Calculate exactly how much sod, mulch, soil, or other materials you need 
                  for your landscaping projects. Get accurate estimates and cost projections.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Material Calculator</Badge>
                  <Badge variant="outline">Cost Estimation</Badge>
                  <Badge variant="outline">Project Planning</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Garden Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Garden Management Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Plan</h4>
              <p className="text-sm text-muted-foreground">Design your space and select plants suited to your environment</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Plant</h4>
              <p className="text-sm text-muted-foreground">Install plants and set up care schedules based on their needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Care</h4>
              <p className="text-sm text-muted-foreground">Follow automated reminders for watering, fertilizing, and maintenance</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-lime-600 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Grow</h4>
              <p className="text-sm text-muted-foreground">Watch your garden thrive with consistent, organized care</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sun className="w-5 h-5 text-yellow-500" />
              Thriving Plants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Never forget to water or fertilize again. Automated reminders and care schedules 
              ensure your plants get exactly what they need, when they need it.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TreePine className="w-5 h-5 text-green-500" />
              Beautiful Spaces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Design stunning outdoor spaces with 3D planning tools. Visualize your ideas 
              before investing in plants and materials, ensuring perfect results.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="w-5 h-5 text-blue-500" />
              Smart Care
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Intelligent scheduling adapts to seasons, weather, and individual plant needs. 
              Spend less time worrying and more time enjoying your beautiful garden.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Yard & Garden</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Add Your First Plants</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Start by cataloging your current plants in "My Plants". Set up care schedules 
                and get immediate watering and fertilizing reminders.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Plan Your Space</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use the Yard Designer to visualize improvements to your outdoor space. 
                Experiment with different layouts before making changes.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('MyPlants')}>Add Plants</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('YardDesigner')}>Design Space</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}