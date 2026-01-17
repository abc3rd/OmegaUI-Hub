import React, { useState } from 'react';
import { CronExpression } from "@/entities/CronExpression";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

import CronBuilder from "../components/cron/CronBuilder";
import SavedExpressions from "../components/cron/SavedExpressions";

export default function CronGeneratorPage() {
  const [currentExpression, setCurrentExpression] = useState(null);
  const [activeTab, setActiveTab] = useState("builder");

  const handleSave = async (cronData) => {
    try {
      if (currentExpression?.id) {
        await CronExpression.update(currentExpression.id, cronData);
      } else {
        await CronExpression.create(cronData);
      }
      setCurrentExpression(null);
      setActiveTab("saved"); // Switch to saved tab to show the result
    } catch (error) {
      console.error("Failed to save cron expression:", error);
    }
  };

  const handleEdit = (expression) => {
    setCurrentExpression(expression);
    setActiveTab("builder");
  };

  const handleLoad = (expression) => {
    setCurrentExpression(expression);
    setActiveTab("builder");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm border shadow-lg">
              <TabsTrigger value="builder" className="flex items-center gap-2">
                ⚙️ Builder
              </TabsTrigger>
              <TabsTrigger value="saved" className="flex items-center gap-2">
                💾 Saved
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="builder">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CronBuilder
                onSave={handleSave}
                initialData={currentExpression}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="saved">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <SavedExpressions
                onEdit={handleEdit}
                onLoad={handleLoad}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}