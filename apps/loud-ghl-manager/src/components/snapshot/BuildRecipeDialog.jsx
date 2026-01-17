import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BuildRecipeDialog({ recipe, onClose }) {
  const [subAccountName, setSubAccountName] = useState(`${recipe.name} - ${new Date().toLocaleDateString()}`);
  const [building, setBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const buildRecipe = async () => {
    setBuilding(true);
    setProgress(0);
    setError(null);
    
    const startTime = Date.now();

    try {
      // Step 1: Create sub-account
      setCurrentStep("Creating sub-account...");
      setProgress(10);
      
      const { data: createResult } = await base44.functions.invoke('ghlAPI', {
        action: 'createSubAccount',
        name: subAccountName
      });

      if (!createResult.success) {
        throw new Error(createResult.error || 'Failed to create sub-account');
      }

      const locationId = createResult.data.id;
      setProgress(20);

      const results = {
        subAccountId: locationId,
        pipelines: [],
        customFields: [],
        workflows: [],
        funnels: []
      };

      // Step 2: Create pipelines
      const recipeData = recipe.recipe_data || {};
      const totalSteps = 
        (recipeData.pipelines?.length || 0) + 
        (recipeData.custom_fields?.length || 0) +
        (recipeData.workflows?.length || 0) +
        (recipeData.funnels?.length || 0);
      
      let completedSteps = 0;

      if (recipeData.pipelines?.length > 0) {
        setCurrentStep("Creating pipelines...");
        for (const pipeline of recipeData.pipelines) {
          const { data: pipelineResult } = await base44.functions.invoke('ghlAPI', {
            action: 'createPipeline',
            locationId,
            name: pipeline.name,
            stages: pipeline.stages || []
          });
          if (pipelineResult.success) {
            results.pipelines.push(pipelineResult.data);
          }
          completedSteps++;
          setProgress(20 + (completedSteps / totalSteps) * 60);
        }
      }

      // Step 3: Create custom fields
      if (recipeData.custom_fields?.length > 0) {
        setCurrentStep("Creating custom fields...");
        for (const field of recipeData.custom_fields) {
          const { data: fieldResult } = await base44.functions.invoke('ghlAPI', {
            action: 'createCustomField',
            locationId,
            name: field.name,
            dataType: field.dataType,
            fieldKey: field.fieldKey
          });
          if (fieldResult.success) {
            results.customFields.push(fieldResult.data);
          }
          completedSteps++;
          setProgress(20 + (completedSteps / totalSteps) * 60);
        }
      }

      // Step 4: Workflows (placeholder)
      if (recipeData.workflows?.length > 0) {
        setCurrentStep("Workflows noted (manual creation required)...");
        results.workflows = recipeData.workflows.map(w => ({ name: w.name, note: 'Manual creation required' }));
        completedSteps += recipeData.workflows.length;
        setProgress(20 + (completedSteps / totalSteps) * 60);
      }

      // Step 5: Funnels (placeholder)
      if (recipeData.funnels?.length > 0) {
        setCurrentStep("Funnels noted (manual creation required)...");
        results.funnels = recipeData.funnels.map(f => ({ name: f.name, note: 'Manual creation required' }));
        completedSteps += recipeData.funnels.length;
        setProgress(20 + (completedSteps / totalSteps) * 60);
      }

      setProgress(90);

      // Log deployment
      setCurrentStep("Logging deployment...");
      await base44.entities.DeploymentLog.create({
        deployment_type: 'snapshot_build',
        recipe_id: recipe.id,
        target_subaccount_id: locationId,
        target_subaccount_name: subAccountName,
        status: 'completed',
        result: results,
        duration_seconds: Math.round((Date.now() - startTime) / 1000)
      });

      // Update recipe last_built
      await base44.entities.SnapshotRecipe.update(recipe.id, {
        last_built: new Date().toISOString()
      });

      setProgress(100);
      setCurrentStep("Build complete!");
      setResult(results);
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['deployments'] });

    } catch (err) {
      console.error("Build error:", err);
      setError(err.message);
      
      await base44.entities.DeploymentLog.create({
        deployment_type: 'snapshot_build',
        recipe_id: recipe.id,
        target_subaccount_id: '',
        target_subaccount_name: subAccountName,
        status: 'failed',
        error_message: err.message,
        duration_seconds: Math.round((Date.now() - startTime) / 1000)
      });
    } finally {
      setBuilding(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Build Snapshot Recipe</DialogTitle>
          <DialogDescription>
            This will create a new GHL sub-account and provision all assets defined in "{recipe.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!building && !result && !error && (
            <div className="space-y-2">
              <Label>Sub-Account Name</Label>
              <Input
                value={subAccountName}
                onChange={(e) => setSubAccountName(e.target.value)}
                placeholder="Enter sub-account name"
              />
            </div>
          )}

          {building && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-[#ea00ea]" />
                <span className="text-sm text-gray-600">{currentStep}</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-500">{progress}% complete</p>
            </div>
          )}

          {result && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="space-y-2">
                  <p className="font-semibold">Build completed successfully!</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>✓ Sub-account created: {subAccountName}</li>
                    <li>✓ {result.pipelines.length} pipelines created</li>
                    <li>✓ {result.customFields.length} custom fields created</li>
                    {result.workflows.length > 0 && <li>⚠ {result.workflows.length} workflows noted (manual setup needed)</li>}
                    {result.funnels.length > 0 && <li>⚠ {result.funnels.length} funnels noted (manual setup needed)</li>}
                  </ul>
                  <p className="text-xs mt-3 text-gray-600">
                    You can now log into GHL and save this sub-account as a Snapshot.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold">Build failed</p>
                <p className="text-sm mt-1">{error}</p>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {!building && !result && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={buildRecipe}
                className="bg-[#ea00ea] hover:bg-[#c900c9]"
                disabled={!subAccountName.trim()}
              >
                Start Build
              </Button>
            </>
          )}
          {(result || error) && (
            <Button onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}