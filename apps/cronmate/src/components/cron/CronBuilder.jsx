import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import FieldSelector from "./FieldSelector";
import PresetSelector from "./PresetSelector";
import CronPreview from "./CronPreview";
import VoiceControls from "./VoiceControls";

const LANGUAGES = {
  en: { name: "English", flag: "🇺🇸" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  it: { name: "Italiano", flag: "🇮🇹" },
  pt: { name: "Português", flag: "🇵🇹" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ko: { name: "한국어", flag: "🇰🇷" },
  zh: { name: "中文", flag: "🇨🇳" }
};

export default function CronBuilder({ onSave, initialData }) {
  const [cronFields, setCronFields] = useState({
    minute: "*",
    hour: "*", 
    day: "*",
    month: "*",
    weekday: "*"
  });
  
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState("builder");
  const [expression, setExpression] = useState("* * * * *");
  const [description, setDescription] = useState("");
  const [isValid, setIsValid] = useState(true);

  const generateDescription = useCallback((fields, lang) => {
    const descriptions = {
      en: {
        every_minute: "Every minute",
        every_hour: "Every hour",
        daily: "Every day",
        weekly: "Every week",
        monthly: "Every month",
        at: "at",
        on: "on",
        every: "every"
      },
      es: {
        every_minute: "Cada minuto",
        every_hour: "Cada hora", 
        daily: "Cada día",
        weekly: "Cada semana",
        monthly: "Cada mes",
        at: "a las",
        on: "el",
        every: "cada"
      },
      fr: {
        every_minute: "Chaque minute",
        every_hour: "Chaque heure",
        daily: "Chaque jour", 
        weekly: "Chaque semaine",
        monthly: "Chaque mois",
        at: "à",
        on: "le",
        every: "chaque"
      }
    };

    const t = descriptions[lang] || descriptions.en;
    
    // Simple description logic
    if (fields.minute === "*" && fields.hour === "*" && fields.day === "*" && fields.month === "*" && fields.weekday === "*") {
      return t.every_minute;
    }
    if (fields.minute !== "*" && fields.hour !== "*" && fields.day === "*" && fields.month === "*" && fields.weekday === "*") {
      return `${t.daily} ${t.at} ${fields.hour}:${fields.minute.padStart(2, '0')}`;
    }
    
    const newExpression = `${fields.minute} ${fields.hour} ${fields.day} ${fields.month} ${fields.weekday}`;
    return `Custom schedule: ${newExpression}`;
  }, []);

  const validateCronExpression = useCallback((expr) => {
    const parts = expr.split(' ');
    if (parts.length !== 5) return false;
    
    // Basic validation - could be more comprehensive
    return parts.every(part => {
      if (part === '*') return true;
      if (/^\d+$/.test(part)) return true;
      if (/^\d+-\d+$/.test(part)) return true;
      if (/^\d+(,\d+)*$/.test(part)) return true;
      if (/^\*\/\d+$/.test(part)) return true;
      return false;
    });
  }, []);

  const generateExpression = useCallback(() => {
    const newExpression = `${cronFields.minute} ${cronFields.hour} ${cronFields.day} ${cronFields.month} ${cronFields.weekday}`;
    setExpression(newExpression);
    setDescription(generateDescription(cronFields, language));
    setIsValid(validateCronExpression(newExpression));
  }, [cronFields, language, generateDescription, validateCronExpression]);

  useEffect(() => {
    if (initialData) {
      setCronFields(initialData.fields || {
        minute: "*",
        hour: "*", 
        day: "*",
        month: "*",
        weekday: "*"
      });
      setName(initialData.name || "");
      setLanguage(initialData.language || "en");
    }
  }, [initialData]);

  useEffect(() => {
    generateExpression();
  }, [generateExpression]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(expression);
    toast.success("Cron expression copied to clipboard!");
  };

  const handlePresetSelect = (preset) => {
    setCronFields(preset.fields);
    setActiveTab("builder");
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a name for your cron job");
      return;
    }
    
    const cronData = {
      name,
      expression,
      description,
      language,
      fields: cronFields
    };
    
    onSave?.(cronData);
    toast.success("Cron expression saved!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 mb-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Cron Expression Generator
          </h1>
        </motion.div>
        <p className="text-gray-600 text-lg">Create and understand cron job schedules with ease</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-500" />
                  Configuration
                </CardTitle>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LANGUAGES).map(([code, lang]) => (
                      <SelectItem key={code} value={code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Job Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Daily backup, Weekly reports..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="builder">Visual Builder</TabsTrigger>
                    <TabsTrigger value="presets">Quick Presets</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="builder" className="space-y-4">
                    <FieldSelector
                      cronFields={cronFields}
                      onChange={setCronFields}
                      language={language}
                    />
                  </TabsContent>
                  
                  <TabsContent value="presets">
                    <PresetSelector
                      onSelect={handlePresetSelect}
                      language={language}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <CronPreview
            expression={expression}
            description={description}
            isValid={isValid}
            language={language}
            onCopy={copyToClipboard}
          />
          
          <VoiceControls
            text={description}
            language={language}
          />

          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  disabled={!isValid || !name.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Expression
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}