import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Network, 
  Bot, 
  Zap, 
  Activity,
  RefreshCw,
  Settings
} from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Start AI Chat",
      description: "Launch remote support session",
      icon: Bot,
      color: "text-blue-400 hover:text-blue-300",
      bg: "hover:bg-blue-500/10",
      url: createPageUrl("AISupport")
    },
    {
      title: "Run Network Test",
      description: "Quick connectivity check",
      icon: Network,
      color: "text-green-400 hover:text-green-300",
      bg: "hover:bg-green-500/10",
      url: createPageUrl("NetworkTools")
    },
    {
      title: "Test API",
      description: "Endpoint health check",
      icon: Zap,
      color: "text-purple-400 hover:text-purple-300",
      bg: "hover:bg-purple-500/10",
      url: createPageUrl("ApiManager")
    },
    {
      title: "View Metrics",
      description: "System performance",
      icon: Activity,
      color: "text-orange-400 hover:text-orange-300",
      bg: "hover:bg-orange-500/10",
      url: createPageUrl("SystemMonitor")
    }
  ];

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Link key={index} to={action.url}>
            <Button 
              variant="ghost" 
              className={`w-full justify-start p-4 h-auto ${action.bg} ${action.color} border border-gray-800 hover:border-gray-700 transition-all duration-200`}
            >
              <action.icon className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-medium text-white">{action.title}</div>
                <div className="text-sm text-gray-400">{action.description}</div>
              </div>
            </Button>
          </Link>
        ))}
        
        <div className="pt-3 border-t border-gray-800">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link to={createPageUrl("Settings")}>
              <Button variant="outline" size="sm" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}