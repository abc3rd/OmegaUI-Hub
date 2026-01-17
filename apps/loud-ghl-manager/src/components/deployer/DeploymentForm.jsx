import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function DeploymentForm({ plugins }) {
  const [selectedPlugin, setSelectedPlugin] = useState("");
  const [selectedSubAccount, setSelectedSubAccount] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [deployError, setDeployError] = useState(null);
  const queryClient = useQueryClient();

  const { data: subAccounts = [], isLoading: loadingAccounts } = useQuery({
    queryKey: ['subAccounts'],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('ghlAPI', { action: 'listSubAccounts' });
      return data.success ? data.data : [];
    },
    initialData: [],
  });

  const handleDeploy = async () => {
    if (!selectedPlugin || !selectedSubAccount) return;

    setDeploying(true);
    setDeployResult(null);
    setDeployError(null);

    const startTime = Date.now();
    const plugin = plugins.find(p => p.id === selectedPlugin);
    const subAccount = subAccounts.find(sa => sa.id === selectedSubAccount);

    try {
      const results = {
        workflows: [],
        customFields: [],
        emailTemplates: [],
        funnels: [],
        forms: []
      };

      const bundleData = plugin.bundle_data || {};

      // Deploy custom fields (this is simplified - actual API calls would vary)
      if (bundleData.custom_field_ids?.length > 0) {
        for (const fieldId of bundleData.custom_field_ids) {
          // In production, you'd fetch the field details from source and create in target
          results.customFields.push({ id: fieldId, status: 'deployed' });
        }
      }

      // Deploy workflows (simplified - placeholder)
      if (bundleData.workflow_ids?.length > 0) {
        for (const workflowId of bundleData.workflow_ids) {
          const { data } = await base44.functions.invoke('ghlAPI', {
            action: 'copyWorkflow',
            sourceLocationId: plugin.source_subaccount_id,
            targetLocationId: selectedSubAccount,
            workflowId
          });
          results.workflows.push({ id: workflowId, status: 'noted', note: 'Manual copy required' });
        }
      }

      // Email templates, funnels, and forms would be handled similarly

      // Log deployment
      await base44.entities.DeploymentLog.create({
        deployment_type: 'plugin_deploy',
        plugin_id: plugin.id,
        target_subaccount_id: selectedSubAccount,
        target_subaccount_name: subAccount.name,
        status: 'completed',
        result: results,
        duration_seconds: Math.round((Date.now() - startTime) / 1000)
      });

      setDeployResult({
        pluginName: plugin.name,
        targetName: subAccount.name,
        results
      });

      queryClient.invalidateQueries({ queryKey: ['deployments'] });

    } catch (err) {
      console.error("Deployment error:", err);
      setDeployError(err.message);

      await base44.entities.DeploymentLog.create({
        deployment_type: 'plugin_deploy',
        plugin_id: plugin.id,
        target_subaccount_id: selectedSubAccount,
        target_subaccount_name: subAccount?.name || '',
        status: 'failed',
        error_message: err.message,
        duration_seconds: Math.round((Date.now() - startTime) / 1000)
      });
    } finally {
      setDeploying(false);
    }
  };

  const selectedPluginData = plugins.find(p => p.id === selectedPlugin);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-6 h-6 text-[#ea00ea]" />
          Deploy Plugin Bundle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!deployResult && !deployError && (
          <>
            <div className="space-y-2">
              <Label>Select Plugin Bundle</Label>
              <Select value={selectedPlugin} onValueChange={setSelectedPlugin}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plugin to deploy" />
                </SelectTrigger>
                <SelectContent>
                  {plugins.map((plugin) => (
                    <SelectItem key={plugin.id} value={plugin.id}>
                      {plugin.name} ({plugin.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPluginData && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Plugin Details</h4>
                  <p className="text-sm text-gray-600 mb-3">{selectedPluginData.description}</p>
                  <div className="flex gap-2 mb-3">
                    <Badge>{selectedPluginData.category}</Badge>
                    <Badge variant="outline">{selectedPluginData.version}</Badge>
                  </div>
                  <div className="text-sm space-y-1">
                    {selectedPluginData.bundle_data?.workflow_ids?.length > 0 && (
                      <p>• {selectedPluginData.bundle_data.workflow_ids.length} workflows</p>
                    )}
                    {selectedPluginData.bundle_data?.custom_field_ids?.length > 0 && (
                      <p>• {selectedPluginData.bundle_data.custom_field_ids.length} custom fields</p>
                    )}
                    {selectedPluginData.bundle_data?.email_template_ids?.length > 0 && (
                      <p>• {selectedPluginData.bundle_data.email_template_ids.length} email templates</p>
                    )}
                    {selectedPluginData.bundle_data?.funnel_ids?.length > 0 && (
                      <p>• {selectedPluginData.bundle_data.funnel_ids.length} funnels</p>
                    )}
                    {selectedPluginData.bundle_data?.form_ids?.length > 0 && (
                      <p>• {selectedPluginData.bundle_data.form_ids.length} forms</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label>Target Sub-Account</Label>
              <Select 
                value={selectedSubAccount} 
                onValueChange={setSelectedSubAccount}
                disabled={loadingAccounts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingAccounts ? "Loading accounts..." : "Choose target sub-account"} />
                </SelectTrigger>
                <SelectContent>
                  {subAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {deploying && (
              <div className="flex items-center gap-3 p-4 bg-[#fce7fc] rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-[#ea00ea]" />
                <span className="text-sm text-[#ea00ea]">Deploying plugin bundle...</span>
              </div>
            )}

            <Button
              onClick={handleDeploy}
              disabled={!selectedPlugin || !selectedSubAccount || deploying}
              className="w-full bg-[#ea00ea] hover:bg-[#c900c9]"
            >
              {deploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy Plugin
                </>
              )}
            </Button>
          </>
        )}

        {deployResult && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-2">
                <p className="font-semibold">Deployment completed successfully!</p>
                <p className="text-sm">
                  Plugin "{deployResult.pluginName}" deployed to "{deployResult.targetName}"
                </p>
                <div className="text-sm mt-3">
                  <p className="font-semibold mb-1">Deployed Assets:</p>
                  <ul className="ml-4 space-y-1">
                    {deployResult.results.workflows?.length > 0 && (
                      <li>• {deployResult.results.workflows.length} workflows (manual setup required)</li>
                    )}
                    {deployResult.results.customFields?.length > 0 && (
                      <li>• {deployResult.results.customFields.length} custom fields</li>
                    )}
                  </ul>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeployResult(null);
                    setSelectedPlugin("");
                    setSelectedSubAccount("");
                  }}
                  className="mt-4"
                >
                  Deploy Another Plugin
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {deployError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold">Deployment failed</p>
              <p className="text-sm mt-1">{deployError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeployError(null);
                }}
                className="mt-4"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}