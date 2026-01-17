import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Camera, 
  Package, 
  Rocket, 
  TrendingUp, 
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: () => base44.entities.SnapshotRecipe.list('-created_date'),
    initialData: [],
  });

  const { data: plugins = [] } = useQuery({
    queryKey: ['plugins'],
    queryFn: () => base44.entities.PluginBundle.list('-created_date'),
    initialData: [],
  });

  const { data: deployments = [] } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => base44.entities.DeploymentLog.list('-created_date', 10),
    initialData: [],
  });

  const activeRecipes = recipes.filter(r => r.status === 'active').length;
  const activePlugins = plugins.filter(p => p.status === 'active').length;
  const recentDeployments = deployments.length;
  const successfulDeployments = deployments.filter(d => d.status === 'completed').length;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#fce7fc]/20 to-[#ea00ea]/10 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to SynCloud GHL Tool
          </h1>
          <p className="text-lg text-gray-600">
            Your central hub for managing GoHighLevel snapshots and plug-ins
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#ea00ea] to-[#ff00ff] text-white border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Snapshot Recipes</CardTitle>
                <Camera className="w-6 h-6 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">{activeRecipes}</div>
              <p className="text-pink-100 text-sm">Active recipes ready to build</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Plugin Bundles</CardTitle>
                <Package className="w-6 h-6 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">{activePlugins}</div>
              <p className="text-purple-100 text-sm">Active plug-ins ready to deploy</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Deployments</CardTitle>
                <Rocket className="w-6 h-6 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">{recentDeployments}</div>
              <p className="text-blue-100 text-sm">Total deployments tracked</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Success Rate</CardTitle>
                <TrendingUp className="w-6 h-6 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold mb-1">
                {recentDeployments > 0 ? Math.round((successfulDeployments / recentDeployments) * 100) : 0}%
              </div>
              <p className="text-green-100 text-sm">Successful deployments</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#ea00ea]" />
                Recent Deployments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deployments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Rocket className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No deployments yet</p>
                  <p className="text-sm">Start by building a snapshot or deploying a plug-in</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deployments.map((deployment) => (
                    <div 
                      key={deployment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(deployment.status)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {deployment.target_subaccount_name || 'Unknown Account'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {deployment.deployment_type === 'snapshot_build' ? 'Snapshot Build' : 'Plugin Deployment'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {format(new Date(deployment.created_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(deployment.created_date), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={createPageUrl("SnapshotBuilder")} className="block">
                <Button className="w-full bg-[#ea00ea] hover:bg-[#c900c9] justify-start gap-3">
                  <Camera className="w-5 h-5" />
                  Build New Snapshot
                </Button>
              </Link>
              <Link to={createPageUrl("PluginManager")} className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Package className="w-5 h-5" />
                  Create Plug-in Bundle
                </Button>
              </Link>
              <Link to={createPageUrl("PluginDeployer")} className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Rocket className="w-5 h-5" />
                  Deploy Plug-in
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}