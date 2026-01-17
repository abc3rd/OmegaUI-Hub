import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket } from "lucide-react";
import DeploymentForm from "../components/deployer/DeploymentForm";

export default function PluginDeployer() {
  const { data: plugins = [] } = useQuery({
    queryKey: ['plugins'],
    queryFn: () => base44.entities.PluginBundle.filter({ status: 'active' }),
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#fce7fc]/20 to-[#ea00ea]/10 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Plugin Deployer</h1>
          <p className="text-gray-600">
            Deploy plug-in bundles to specific GHL sub-accounts
          </p>
        </div>

        {plugins.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-[#fce7fc] rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-10 h-10 text-[#ea00ea]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Plugins Available</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You need to create and activate plug-in bundles before you can deploy them. Visit the Plugin Manager to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <DeploymentForm plugins={plugins} />
        )}
      </div>
    </div>
  );
}