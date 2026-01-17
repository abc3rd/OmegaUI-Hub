import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const FIELD_INFO = {
  en: {
    minute: {
      label: "Minute",
      description: "Minute of the hour (0-59)",
      examples: ["*", "0", "15", "0,30", "*/15"]
    },
    hour: {
      label: "Hour", 
      description: "Hour of the day (0-23)",
      examples: ["*", "0", "12", "9-17", "*/2"]
    },
    day: {
      label: "Day of Month",
      description: "Day of the month (1-31)", 
      examples: ["*", "1", "15", "1,15", "*/7"]
    },
    month: {
      label: "Month",
      description: "Month of the year (1-12)",
      examples: ["*", "1", "6", "1,6,12", "*/3"]
    },
    weekday: {
      label: "Day of Week",
      description: "Day of the week (0=Sunday, 7=Sunday)",
      examples: ["*", "0", "1", "1-5", "1,3,5"]
    }
  }
};

const COMMON_VALUES = {
  minute: [
    { value: "*", label: "Every minute" },
    { value: "0", label: "At minute 0" },
    { value: "15", label: "At minute 15" },
    { value: "30", label: "At minute 30" },
    { value: "0,30", label: "At minutes 0 and 30" },
    { value: "*/5", label: "Every 5 minutes" },
    { value: "*/15", label: "Every 15 minutes" },
    { value: "*/30", label: "Every 30 minutes" }
  ],
  hour: [
    { value: "*", label: "Every hour" },
    { value: "0", label: "At midnight (0)" },
    { value: "6", label: "At 6 AM" },
    { value: "9", label: "At 9 AM" },
    { value: "12", label: "At noon (12)" },
    { value: "18", label: "At 6 PM" },
    { value: "9-17", label: "Business hours (9-17)" },
    { value: "*/2", label: "Every 2 hours" },
    { value: "*/4", label: "Every 4 hours" }
  ],
  day: [
    { value: "*", label: "Every day" },
    { value: "1", label: "First day of month" },
    { value: "15", label: "15th of month" },
    { value: "1,15", label: "1st and 15th" },
    { value: "*/7", label: "Every 7 days" },
    { value: "1-7", label: "First week" }
  ],
  month: [
    { value: "*", label: "Every month" },
    { value: "1", label: "January only" },
    { value: "6", label: "June only" },
    { value: "12", label: "December only" },
    { value: "1,4,7,10", label: "Quarterly" },
    { value: "*/3", label: "Every 3 months" },
    { value: "*/6", label: "Every 6 months" }
  ],
  weekday: [
    { value: "*", label: "Every day" },
    { value: "0", label: "Sunday only" },
    { value: "1", label: "Monday only" },
    { value: "5", label: "Friday only" },
    { value: "1-5", label: "Weekdays (Mon-Fri)" },
    { value: "6,0", label: "Weekends (Sat-Sun)" },
    { value: "1,3,5", label: "Mon, Wed, Fri" }
  ]
};

export default function FieldSelector({ cronFields, onChange, language = "en" }) {
  const fieldInfo = FIELD_INFO[language] || FIELD_INFO.en;

  const updateField = (field, value) => {
    onChange({
      ...cronFields,
      [field]: value
    });
  };

  const renderFieldCard = (fieldKey, fieldData) => (
    <Card key={fieldKey} className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{fieldData.label}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-2">
                  <p className="font-medium">{fieldData.description}</p>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Examples:</p>
                    <div className="flex flex-wrap gap-1">
                      {fieldData.examples.map((example, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label htmlFor={fieldKey}>Select Value</Label>
          <Select
            value={cronFields[fieldKey]}
            onValueChange={(value) => updateField(fieldKey, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COMMON_VALUES[fieldKey].map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono text-sm mr-2">{option.value}</span>
                    <span className="text-xs text-gray-500">{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor={`${fieldKey}-custom`}>Or Enter Custom</Label>
          <Input
            id={`${fieldKey}-custom`}
            placeholder={`e.g., ${fieldData.examples.join(', ')}`}
            value={cronFields[fieldKey]}
            onChange={(e) => updateField(fieldKey, e.target.value)}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Configure each field of your cron expression. Use the dropdown for common patterns or enter custom values.
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(fieldInfo).map(([fieldKey, fieldData]) =>
          renderFieldCard(fieldKey, fieldData)
        )}
      </div>
    </div>
  );
}