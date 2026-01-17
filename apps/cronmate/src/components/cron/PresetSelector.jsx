import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Timer, Repeat } from "lucide-react";
import { motion } from "framer-motion";

const PRESET_CATEGORIES = {
  en: {
    common: {
      title: "Common Schedules",
      icon: Clock,
      presets: [
        { name: "Every minute", fields: { minute: "*", hour: "*", day: "*", month: "*", weekday: "*" }, desc: "Runs every minute" },
        { name: "Every hour", fields: { minute: "0", hour: "*", day: "*", month: "*", weekday: "*" }, desc: "Runs at the start of every hour" },
        { name: "Every day at midnight", fields: { minute: "0", hour: "0", day: "*", month: "*", weekday: "*" }, desc: "Runs once daily at midnight" },
        { name: "Every day at 9 AM", fields: { minute: "0", hour: "9", day: "*", month: "*", weekday: "*" }, desc: "Runs every day at 9:00 AM" },
        { name: "Every Monday at 9 AM", fields: { minute: "0", hour: "9", day: "*", month: "*", weekday: "1" }, desc: "Runs every Monday at 9:00 AM" },
        { name: "Weekdays at 9 AM", fields: { minute: "0", hour: "9", day: "*", month: "*", weekday: "1-5" }, desc: "Runs Mon-Fri at 9:00 AM" }
      ]
    },
    business: {
      title: "Business Hours",
      icon: Calendar,
      presets: [
        { name: "Every 15 minutes during business hours", fields: { minute: "*/15", hour: "9-17", day: "*", month: "*", weekday: "1-5" }, desc: "Runs every 15 min, Mon-Fri 9AM-5PM" },
        { name: "Hourly during business hours", fields: { minute: "0", hour: "9-17", day: "*", month: "*", weekday: "1-5" }, desc: "Runs hourly, Mon-Fri 9AM-5PM" },
        { name: "Start of business day", fields: { minute: "0", hour: "9", day: "*", month: "*", weekday: "1-5" }, desc: "Runs at 9AM on weekdays" },
        { name: "End of business day", fields: { minute: "0", hour: "17", day: "*", month: "*", weekday: "1-5" }, desc: "Runs at 5PM on weekdays" },
        { name: "Lunch break", fields: { minute: "0", hour: "12", day: "*", month: "*", weekday: "1-5" }, desc: "Runs at noon on weekdays" }
      ]
    },
    maintenance: {
      title: "Maintenance & Backups",
      icon: Timer,
      presets: [
        { name: "Daily backup at 2 AM", fields: { minute: "0", hour: "2", day: "*", month: "*", weekday: "*" }, desc: "Runs daily at 2:00 AM" },
        { name: "Weekly backup (Sunday 3 AM)", fields: { minute: "0", hour: "3", day: "*", month: "*", weekday: "0" }, desc: "Runs every Sunday at 3:00 AM" },
        { name: "Monthly report (1st at 6 AM)", fields: { minute: "0", hour: "6", day: "1", month: "*", weekday: "*" }, desc: "Runs 1st of every month at 6:00 AM" },
        { name: "Quarterly cleanup", fields: { minute: "0", hour: "1", day: "1", month: "1,4,7,10", weekday: "*" }, desc: "Runs quarterly at 1:00 AM" },
        { name: "Server restart (Sunday 4 AM)", fields: { minute: "0", hour: "4", day: "*", month: "*", weekday: "0" }, desc: "Runs every Sunday at 4:00 AM" }
      ]
    },
    monitoring: {
      title: "Monitoring & Alerts",
      icon: Repeat,
      presets: [
        { name: "Every 5 minutes", fields: { minute: "*/5", hour: "*", day: "*", month: "*", weekday: "*" }, desc: "Runs every 5 minutes" },
        { name: "Every 30 minutes", fields: { minute: "*/30", hour: "*", day: "*", month: "*", weekday: "*" }, desc: "Runs every 30 minutes" },
        { name: "Every 2 hours", fields: { minute: "0", hour: "*/2", day: "*", month: "*", weekday: "*" }, desc: "Runs every 2 hours" },
        { name: "Every 6 hours", fields: { minute: "0", hour: "*/6", day: "*", month: "*", weekday: "*" }, desc: "Runs every 6 hours" },
        { name: "Health check (every 10 min)", fields: { minute: "*/10", hour: "*", day: "*", month: "*", weekday: "*" }, desc: "Runs every 10 minutes" }
      ]
    }
  }
};

export default function PresetSelector({ onSelect, language = "en" }) {
  const categories = PRESET_CATEGORIES[language] || PRESET_CATEGORIES.en;

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        Choose from common cron patterns to get started quickly.
      </div>
      
      {Object.entries(categories).map(([categoryKey, category], categoryIndex) => (
        <motion.div
          key={categoryKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <category.icon className="w-5 h-5 text-indigo-500" />
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid gap-3">
                {category.presets.map((preset, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 justify-start hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                      onClick={() => onSelect(preset)}
                    >
                      <div className="flex-1 text-left space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{preset.name}</span>
                          <Badge variant="secondary" className="ml-2 font-mono text-xs">
                            {Object.values(preset.fields).join(" ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{preset.desc}</p>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}