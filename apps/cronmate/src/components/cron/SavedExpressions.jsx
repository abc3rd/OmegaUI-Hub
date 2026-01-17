import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Copy, Play } from "lucide-react";
import { CronExpression } from "@/entities/CronExpression";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SavedExpressions({ onEdit, onLoad }) {
  const [expressions, setExpressions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExpressions();
  }, []);

  const loadExpressions = async () => {
    try {
      const data = await CronExpression.list('-created_date');
      setExpressions(data);
    } catch (error) {
      toast.error("Failed to load saved expressions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await CronExpression.delete(id);
      setExpressions(prev => prev.filter(expr => expr.id !== id));
      toast.success("Expression deleted");
    } catch (error) {
      toast.error("Failed to delete expression");
    }
  };

  const handleCopy = (expression) => {
    navigator.clipboard.writeText(expression);
    toast.success("Expression copied to clipboard!");
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Saved Expressions ({expressions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence>
          {expressions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No saved expressions yet.</p>
              <p className="text-sm">Create and save your first cron expression!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expressions.map((expr, index) => (
                <motion.div
                  key={expr.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{expr.name}</h4>
                      <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {expr.expression}
                      </code>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Badge variant="outline" className="text-xs">
                        {expr.language?.toUpperCase() || 'EN'}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{expr.description}</p>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onLoad(expr)}
                      className="flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(expr)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(expr.expression)}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(expr.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}