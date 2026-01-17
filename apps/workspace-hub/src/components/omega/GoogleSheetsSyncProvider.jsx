import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const GoogleSheetsSyncContext = createContext();

export const useGoogleSheetsSync = () => {
  const context = useContext(GoogleSheetsSyncContext);
  if (!context) {
    throw new Error("useGoogleSheetsSync must be used within GoogleSheetsSyncProvider");
  }
  return context;
};

export default function GoogleSheetsSyncProvider({ children }) {
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Fetch from Google Sheets
  const { data: sheetsData, isLoading: sheetsLoading, refetch: refetchSheets } = useQuery({
    queryKey: ['googleSheets'],
    queryFn: async () => {
      const response = await base44.functions.invoke('syncGoogleSheets', {});
      return response.data;
    },
    enabled: syncEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });

  // Fetch from database
  const { data: dbApps, isLoading: dbLoading, refetch: refetchDb } = useQuery({
    queryKey: ['apps'],
    queryFn: () => base44.entities.apps.list('-updated_date'),
    initialData: [],
  });

  // Merge and return data
  const apps = syncEnabled && sheetsData?.apps ? sheetsData.apps : dbApps;
  const isLoading = syncEnabled ? sheetsLoading : dbLoading;

  const toggleSync = () => {
    setSyncEnabled(!syncEnabled);
  };

  const manualSync = async () => {
    if (syncEnabled) {
      await refetchSheets();
      setLastSyncTime(new Date());
    }
  };

  useEffect(() => {
    if (sheetsData?.apps) {
      setLastSyncTime(new Date());
    }
  }, [sheetsData]);

  return (
    <GoogleSheetsSyncContext.Provider
      value={{
        apps,
        isLoading,
        syncEnabled,
        toggleSync,
        manualSync,
        lastSyncTime,
      }}
    >
      {children}
    </GoogleSheetsSyncContext.Provider>
  );
}