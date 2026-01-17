import React, { useState, useEffect } from "react";
import { ApiIntegration } from "@/entities/ApiIntegration";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

import ApiList from "../components/apimanager/ApiList";
import ApiForm from "../components/apimanager/ApiForm";
import ApiTester from "../components/apimanager/ApiTester";
import ApiStats from "../components/apimanager/ApiStats";

export default function ApiManager() {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedApi, setSelectedApi] = useState(null);
  const [apiToTest, setApiToTest] = useState(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    setIsLoading(true);
    try {
      const data = await ApiIntegration.list("-created_date");
      setIntegrations(data);
    } catch (error) {
      console.error("Failed to load integrations:", error);
      toast.error("Failed to load API integrations.");
    }
    setIsLoading(false);
  };

  const handleEdit = (api) => {
    setSelectedApi(api);
    setIsFormOpen(true);
  };

  const handleDelete = async (apiId) => {
    if (confirm("Are you sure you want to delete this integration?")) {
      try {
        await ApiIntegration.delete(apiId);
        toast.success("API Integration deleted successfully.");
        loadIntegrations();
      } catch (error) {
        toast.error("Failed to delete integration.");
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedApi) {
        await ApiIntegration.update(selectedApi.id, data);
        toast.success("API Integration updated successfully.");
      } else {
        await ApiIntegration.create(data);
        toast.success("API Integration created successfully.");
      }
      setIsFormOpen(false);
      setSelectedApi(null);
      loadIntegrations();
    } catch (error) {
      toast.error(`Failed to ${selectedApi ? 'update' : 'create'} integration.`);
    }
  };

  const handleTest = (api) => {
    setApiToTest(api);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">API Manager</h1>
          <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) setSelectedApi(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-gray-900 border-gray-800 text-white">
              <DialogHeader>
                <DialogTitle>{selectedApi ? "Edit" : "Create"} API Integration</DialogTitle>
              </DialogHeader>
              <ApiForm
                api={selectedApi}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <ApiStats integrations={integrations} isLoading={isLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <ApiList 
              integrations={integrations}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onTest={handleTest}
            />
          </div>
          <div className="lg:col-span-2">
            <ApiTester apiToTest={apiToTest} onTestRun={loadIntegrations} />
          </div>
        </div>
      </div>
    </div>
  );
}