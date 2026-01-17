import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, AlertTriangle, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CronPreview({ expression, description, isValid, language, onCopy }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getNextRuns = (expr) => {
    // Simple next run calculation - in real app would use a cron parsing library
    const now = new Date();
    const runs = [];
    
    // Mock next runs for demo
    for (let i = 0; i < 5; i++) {
      const nextRun = new Date(now);
      
      if (expr === "* * * * *") {
        nextRun.setMinutes(nextRun.getMinutes() + i + 1);
      } else if (expr === "0 * * * *") {
        nextRun.setHours(nextRun.getHours() + i + 1, 0, 0, 0);
      } else if (expr === "0 0 * * *") {
        nextRun.setDate(nextRun.getDate() + i + 1);
        nextRun.setHours(0, 0, 0, 0);
      } else {
        nextRun.setHours(nextRun.getHours() + (i + 1) * 2);
      }
      
      runs.push(nextRun);
    }
    
    return runs;
  };

  const nextRuns = getNextRuns(expression);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-indigo-500" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Cron Expression</span>
              <Badge variant={isValid ? "default" : "destructive"} className="text-xs">
                {isValid ? "Valid" : "Invalid"}
              </Badge>
            </div>
            <div className="relative">
              <code className={`block w-full p-3 rounded-lg font-mono text-lg bg-gray-50 border-2 ${
                isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
              }`}>
                {expression}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-1 right-1 h-8 w-8 p-0"
                onClick={handleCopy}
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Check className="w-4 h-4 text-green-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Copy className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700">Description</span>
            <p className="mt-1 p-3 bg-indigo-50 rounded-lg text-indigo-800 border border-indigo-200">
              {description}
            </p>
          </div>

          {!isValid && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <strong>Invalid expression:</strong> Please check your cron syntax. Each field should contain valid values or patterns.
              </div>
            </div>
          )}
        </div>

        {isValid && (
          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-700">Next 5 Runs</span>
            <div className="space-y-2">
              {nextRuns.map((run, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm"
                >
                  <span className="text-gray-600">Run #{index + 1}</span>
                  <span className="font-mono text-gray-800">
                    {run.toLocaleString(language === 'en' ? 'en-US' : language, {
                      dateStyle: 'short',
                      timeStyle: 'medium'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}