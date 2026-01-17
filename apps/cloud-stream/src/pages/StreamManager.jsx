import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Radio, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import PlatformCard from "../components/streaming/PlatformCard";
import AddDestinationDialog from "../components/streaming/AddDestinationDialog";
import OBSGuide from "../components/streaming/OBSGuide";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StreamManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const queryClient = useQueryClient();

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => base44.entities.StreamDestination.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.StreamDestination.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['destinations']);
      toast.success('Stream destination added successfully');
      setDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.StreamDestination.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['destinations']);
      toast.success('Stream destination updated');
      setDialogOpen(false);
      setEditingDestination(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.StreamDestination.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['destinations']);
      toast.success('Stream destination deleted');
    },
  });

  const handleSave = (data) => {
    if (editingDestination) {
      updateMutation.mutate({ id: editingDestination.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleToggle = (destination) => {
    updateMutation.mutate({
      id: destination.id,
      data: { ...destination, is_active: !destination.is_active }
    });
  };

  const handleEdit = (destination) => {
    setEditingDestination(destination);
    setDialogOpen(true);
  };

  const handleDelete = (destination) => {
    if (confirm(`Delete ${destination.platform_name}?`)) {
      deleteMutation.mutate(destination.id);
    }
  };

  const activeCount = destinations.filter(d => d.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Stream Manager</h1>
            <p className="text-slate-400">Manage your multi-platform streaming destinations</p>
          </div>
          <Button
            onClick={() => {
              setEditingDestination(null);
              setDialogOpen(true);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Destination
          </Button>
        </div>

        {/* Status Alert */}
        {activeCount > 0 && (
          <Alert className="bg-green-950 border-green-800">
            <Radio className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-300">
              <strong>{activeCount}</strong> destination{activeCount !== 1 ? 's' : ''} active and ready to stream
            </AlertDescription>
          </Alert>
        )}

        {/* OBS Setup Guide */}
        <OBSGuide />

        {/* Stream Destinations */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your Stream Destinations</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-16 bg-slate-800 rounded-lg border border-slate-700">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No destinations yet</h3>
              <p className="text-slate-400 mb-6">Add your first streaming destination to get started</p>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Destination
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {destinations.map(destination => (
                <PlatformCard
                  key={destination.id}
                  destination={destination}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <AddDestinationDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setEditingDestination(null);
          }}
          onSave={handleSave}
          editingDestination={editingDestination}
        />
      </div>
    </div>
  );
}