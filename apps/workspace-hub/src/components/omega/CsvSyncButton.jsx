import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CsvSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();

  const parseCsvLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Fetch CSV from public folder
      const response = await fetch('/assets/omega_assets.csv');
      if (!response.ok) throw new Error('CSV file not found');
      
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file is empty or invalid');
      }

      // Parse CSV (skip header row)
      const apps = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length >= 3 && values[0] && values[2]) {
          apps.push({
            name: values[0],
            description: values[1] || '',
            url: values[2],
            category: 'Tools', // Default category
            status: 'active',
            tags: [],
            featured: false,
            views: 0
          });
        }
      }

      if (apps.length === 0) {
        throw new Error('No valid apps found in CSV');
      }

      // Get existing apps
      const existingApps = await base44.entities.apps.list();
      
      // Create a map of existing apps by name
      const existingMap = new Map();
      existingApps.forEach(app => {
        existingMap.set(app.name.toLowerCase(), app);
      });

      // Update or create apps
      let updated = 0;
      let created = 0;

      for (const app of apps) {
        const existing = existingMap.get(app.name.toLowerCase());
        
        if (existing) {
          // Update existing app
          await base44.entities.apps.update(existing.id, {
            description: app.description,
            url: app.url,
            // Keep existing category, tags, featured, views
            category: existing.category || app.category,
            tags: existing.tags || app.tags,
            featured: existing.featured || app.featured,
            views: existing.views || app.views
          });
          updated++;
        } else {
          // Create new app
          await base44.entities.apps.create(app);
          created++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ['apps'] });
      toast.success(
        <div>
          <div className="font-semibold">Sync Complete!</div>
          <div className="text-sm">
            {created > 0 && `Created ${created} new apps. `}
            {updated > 0 && `Updated ${updated} apps.`}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={syncing}
      className="w-full bg-gradient-to-r from-[#EA00EA] to-[#9D00FF] hover:from-[#9D00FF] hover:to-[#EA00EA]"
    >
      {syncing ? (
        <>
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          Syncing...
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync from CSV
        </>
      )}
    </Button>
  );
}