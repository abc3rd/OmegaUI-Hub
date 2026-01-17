import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function RefreshDataButton() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    if (!confirm("This will delete all existing apps and replace them with fresh data. Continue?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('refreshAppsData', {});
      toast.success(response.data.message);
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      queryClient.invalidateQueries({ queryKey: ['googleSheets'] });
    } catch (error) {
      toast.error("Failed to refresh data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={loading}
      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
    >
      {loading ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Refreshing...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All Data
        </>
      )}
    </Button>
  );
}