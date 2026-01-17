import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PluginForm from "../components/plugin/PluginForm";

export default function PluginManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState(null);
  const queryClient = useQueryClient();

  const { data: plugins = [] } = useQuery({
    queryKey: ['plugins'],
    queryFn: () => base44.entities.PluginBundle.list('-created_date'),
    initialData: [],
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PluginBundle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      setShowForm(false);
      setEditingPlugin(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PluginBundle.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      setShowForm(false);
      setEditingPlugin(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PluginBundle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
    },
  });

  const handleSave = (data) => {
    if (editingPlugin) {
      updateMutation.mutate({ id: editingPlugin.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      automation: 'bg-blue-100 text-blue-800',
      marketing: 'bg-purple-100 text-purple-800',
      sales: 'bg-green-100 text-green-800',
      communication: 'bg-orange-100 text-orange-800',
      analytics: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  const countAssets = (plugin) => {
    const data = plugin.bundle_data || {};
    return {
      workflows: data.workflow_ids?.length || 0,
      customFields: data.custom_field_ids?.length || 0,
      emailTemplates: data.email_template_ids?.length || 0,
      funnels: data.funnel_ids?.length || 0,
      forms: data.form_ids?.length || 0,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#fce7fc]/20 to-[#ea00ea]/10 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Plugin Manager</h1>
            <p className="text-gray-600">
              Create and manage reusable plug-in bundles for deployment
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingPlugin(null);
              setShowForm(true);
            }}
            className="bg-[#ea00ea] hover:bg-[#c900c9] gap-2"
          >
            <Plus className="w-5 h-5" />
            New Plugin
          </Button>
        </div>

        {showForm && (
          <PluginForm
            plugin={editingPlugin}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingPlugin(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {plugins.length === 0 && !showForm ? (
          <Card className="shadow-md">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-[#fce7fc] rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-[#ea00ea]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plugin Bundles Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Create your first plug-in bundle to package GHL assets for deployment
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-[#ea00ea] hover:bg-[#c900c9]"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Plugin
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plugins.map((plugin) => {
              const assets = countAssets(plugin);
              const totalAssets = Object.values(assets).reduce((a, b) => a + b, 0);
              
              return (
                <Card key={plugin.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{plugin.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingPlugin(plugin);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(plugin.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(plugin.status)}>
                        {plugin.status}
                      </Badge>
                      <Badge className={getCategoryColor(plugin.category)}>
                        {plugin.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      {plugin.description || 'No description'}
                    </p>
                    <div className="space-y-2 mb-4">
                      {assets.workflows > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Workflows</span>
                          <span className="font-semibold text-purple-700">{assets.workflows}</span>
                        </div>
                      )}
                      {assets.customFields > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Custom Fields</span>
                          <span className="font-semibold text-blue-700">{assets.customFields}</span>
                        </div>
                      )}
                      {assets.emailTemplates > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Email Templates</span>
                          <span className="font-semibold text-green-700">{assets.emailTemplates}</span>
                        </div>
                      )}
                      {assets.funnels > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Funnels</span>
                          <span className="font-semibold text-orange-700">{assets.funnels}</span>
                        </div>
                      )}
                      {assets.forms > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Forms</span>
                          <span className="font-semibold text-pink-700">{assets.forms}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Total Assets: <span className="font-semibold">{totalAssets}</span>
                      </p>
                      {plugin.version && (
                        <p className="text-xs text-gray-500">
                          Version: <span className="font-semibold">{plugin.version}</span>
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}