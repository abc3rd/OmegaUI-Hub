import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RecipeForm({ recipe, onSave, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    name: recipe?.name || "",
    description: recipe?.description || "",
    version: recipe?.version || "v1.0",
    status: recipe?.status || "draft",
    recipe_data: recipe?.recipe_data || {
      pipelines: [],
      custom_fields: [],
      workflows: [],
      funnels: []
    }
  });

  const addPipeline = () => {
    setFormData({
      ...formData,
      recipe_data: {
        ...formData.recipe_data,
        pipelines: [...formData.recipe_data.pipelines, { name: "", stages: [""] }]
      }
    });
  };

  const updatePipeline = (index, field, value) => {
    const newPipelines = [...formData.recipe_data.pipelines];
    newPipelines[index][field] = value;
    setFormData({
      ...formData,
      recipe_data: { ...formData.recipe_data, pipelines: newPipelines }
    });
  };

  const removePipeline = (index) => {
    setFormData({
      ...formData,
      recipe_data: {
        ...formData.recipe_data,
        pipelines: formData.recipe_data.pipelines.filter((_, i) => i !== index)
      }
    });
  };

  const addStage = (pipelineIndex) => {
    const newPipelines = [...formData.recipe_data.pipelines];
    newPipelines[pipelineIndex].stages.push("");
    setFormData({
      ...formData,
      recipe_data: { ...formData.recipe_data, pipelines: newPipelines }
    });
  };

  const updateStage = (pipelineIndex, stageIndex, value) => {
    const newPipelines = [...formData.recipe_data.pipelines];
    newPipelines[pipelineIndex].stages[stageIndex] = value;
    setFormData({
      ...formData,
      recipe_data: { ...formData.recipe_data, pipelines: newPipelines }
    });
  };

  const removeStage = (pipelineIndex, stageIndex) => {
    const newPipelines = [...formData.recipe_data.pipelines];
    newPipelines[pipelineIndex].stages = newPipelines[pipelineIndex].stages.filter((_, i) => i !== stageIndex);
    setFormData({
      ...formData,
      recipe_data: { ...formData.recipe_data, pipelines: newPipelines }
    });
  };

  const addCustomField = () => {
    setFormData({
      ...formData,
      recipe_data: {
        ...formData.recipe_data,
        custom_fields: [...formData.recipe_data.custom_fields, { name: "", dataType: "TEXT", fieldKey: "" }]
      }
    });
  };

  const updateCustomField = (index, field, value) => {
    const newFields = [...formData.recipe_data.custom_fields];
    newFields[index][field] = value;
    setFormData({
      ...formData,
      recipe_data: { ...formData.recipe_data, custom_fields: newFields }
    });
  };

  const removeCustomField = (index) => {
    setFormData({
      ...formData,
      recipe_data: {
        ...formData.recipe_data,
        custom_fields: formData.recipe_data.custom_fields.filter((_, i) => i !== index)
      }
    });
  };

  const addWorkflow = () => {
    setFormData({
      ...formData,
      recipe_data: {
        ...formData.recipe_data,
        workflows: [...formData.recipe_data.workflows, { name: "", description: "" }]
      }
    });
  };

  const updateWorkflow = (index, field, value) => {
    const newWorkflows = [...formData.recipe_data.workflows];
    newWorkflows[index][field] = value;
    setFormData({
      ...formData,
      recipe_data: { ...formData.recipe_data, workflows: newWorkflows }
    });
  };

  const removeWorkflow = (index) => {
    setFormData({
      ...formData,
      recipe_data: {
        ...formData.recipe_data,
        workflows: formData.recipe_data.workflows.filter((_, i) => i !== index)
      }
    });
  };

  const addFunnel = () => {
    setFormData({
      ...formData,
      recipe_data: {
        ...formData.recipe_data,
        funnels: [...formData.recipe_data.funnels, { name: "", description: "" }]
      }
    });
  };

  const updateFunnel = (index, field, value) => {
    const newFunnels = [...formData.recipe_data.funnels];
    newFunnels[index][field] = value;
    setFormData({
      ...formData,
      recipe_data: { ...formData.recipe_data, funnels: newFunnels }
    });
  };

  const removeFunnel = (index) => {
    setFormData({
      ...formData,
      recipe_data: {
        ...formData.recipe_data,
        funnels: formData.recipe_data.funnels.filter((_, i) => i !== index)
      }
    });
  };

  return (
    <Card className="mb-6 shadow-lg">
      <CardHeader>
        <CardTitle>{recipe ? 'Edit Recipe' : 'New Snapshot Recipe'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Recipe Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Realtor Snapshot v1"
            />
          </div>
          <div className="space-y-2">
            <Label>Version</Label>
            <Input
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              placeholder="e.g., v1.0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what this snapshot includes..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="pipelines" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
            <TabsTrigger value="fields">Custom Fields</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="funnels">Funnels</TabsTrigger>
          </TabsList>

          <TabsContent value="pipelines" className="space-y-4 mt-4">
            {formData.recipe_data.pipelines.map((pipeline, idx) => (
              <Card key={idx} className="bg-gray-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={pipeline.name}
                      onChange={(e) => updatePipeline(idx, 'name', e.target.value)}
                      placeholder="Pipeline name"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePipeline(idx)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Stages</Label>
                    {pipeline.stages.map((stage, stageIdx) => (
                      <div key={stageIdx} className="flex gap-2">
                        <Input
                          value={stage}
                          onChange={(e) => updateStage(idx, stageIdx, e.target.value)}
                          placeholder={`Stage ${stageIdx + 1}`}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStage(idx, stageIdx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addStage(idx)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Stage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addPipeline}>
              <Plus className="w-4 h-4 mr-2" />
              Add Pipeline
            </Button>
          </TabsContent>

          <TabsContent value="fields" className="space-y-4 mt-4">
            {formData.recipe_data.custom_fields.map((field, idx) => (
              <Card key={idx} className="bg-gray-50">
                <CardContent className="pt-6 space-y-4">
                  <div className="grid md:grid-cols-3 gap-2">
                    <Input
                      value={field.name}
                      onChange={(e) => updateCustomField(idx, 'name', e.target.value)}
                      placeholder="Field name"
                    />
                    <Select
                      value={field.dataType}
                      onValueChange={(value) => updateCustomField(idx, 'dataType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TEXT">Text</SelectItem>
                        <SelectItem value="NUMBER">Number</SelectItem>
                        <SelectItem value="DATE">Date</SelectItem>
                        <SelectItem value="CHECKBOX">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={field.fieldKey}
                      onChange={(e) => updateCustomField(idx, 'fieldKey', e.target.value)}
                      placeholder="field_key"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomField(idx)}
                  >
                    <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addCustomField}>
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Field
            </Button>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4 mt-4">
            {formData.recipe_data.workflows.map((workflow, idx) => (
              <Card key={idx} className="bg-gray-50">
                <CardContent className="pt-6 space-y-4">
                  <Input
                    value={workflow.name}
                    onChange={(e) => updateWorkflow(idx, 'name', e.target.value)}
                    placeholder="Workflow name"
                  />
                  <Textarea
                    value={workflow.description}
                    onChange={(e) => updateWorkflow(idx, 'description', e.target.value)}
                    placeholder="Workflow description"
                    rows={2}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWorkflow(idx)}
                  >
                    <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addWorkflow}>
              <Plus className="w-4 h-4 mr-2" />
              Add Workflow
            </Button>
          </TabsContent>

          <TabsContent value="funnels" className="space-y-4 mt-4">
            {formData.recipe_data.funnels.map((funnel, idx) => (
              <Card key={idx} className="bg-gray-50">
                <CardContent className="pt-6 space-y-4">
                  <Input
                    value={funnel.name}
                    onChange={(e) => updateFunnel(idx, 'name', e.target.value)}
                    placeholder="Funnel name"
                  />
                  <Textarea
                    value={funnel.description}
                    onChange={(e) => updateFunnel(idx, 'description', e.target.value)}
                    placeholder="Funnel description"
                    rows={2}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFunnel(idx)}
                  >
                    <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={addFunnel}>
              <Plus className="w-4 h-4 mr-2" />
              Add Funnel
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)} disabled={isLoading} className="bg-[#ea00ea] hover:bg-[#c900c9]">
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Recipe'}
        </Button>
      </CardFooter>
    </Card>
  );
}