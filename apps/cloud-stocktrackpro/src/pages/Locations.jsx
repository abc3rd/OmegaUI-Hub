import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocationsGrid from "../components/locations/LocationsGrid";
import CreateLocationDialog from "../components/locations/CreateLocationDialog";

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: () => base44.entities.Location.list(),
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => base44.entities.InventoryItem.list(),
  });

  const updateLocationMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Location.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Location Management</h1>
            <p className="text-slate-600 mt-1">Manage warehouses and stores</p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Location
          </Button>
        </div>

        <LocationsGrid 
          locations={locations}
          inventory={inventory}
          onToggleActive={(locationId, isActive) => 
            updateLocationMutation.mutate({ id: locationId, data: { is_active: isActive } })
          }
          isLoading={isLoading}
        />

        <CreateLocationDialog 
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
        />
      </div>
    </div>
  );
}