import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw, Cloud } from "lucide-react";
import { toast } from "sonner";

export default function GoogleSheetsSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await base44.functions.invoke('syncGoogleSheets', {});
      
      if (response.data.success) {
        queryClient.invalidateQueries({ queryKey: ['apps'] });
        toast.success(
          <div>
            <div className="font-semibold">Google Sheets Synced!</div>
            <div className="text-sm">
              {response.data.created > 0 && `Created ${response.data.created} new apps. `}
              {response.data.updated > 0 && `Updated ${response.data.updated} apps.`}
            </div>
          </div>
        );
      } else {
        throw new Error(response.data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed: ' + (error.response?.data?.details || error.message));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 text-white"
    >
      {syncing ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <Cloud className="w-4 h-4 mr-2" />
          Sync from Sheets
        </>
      )}
    </Button>
  );
}