import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Settings } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function ChartElement({ element, onUpdate, isSelected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [chartData, setChartData] = useState(element.chartData || [
    { name: 'Item A', value: 40 },
    { name: 'Item B', value: 30 },
    { name: 'Item C', value: 20 },
    { name: 'Item D', value: 10 },
  ]);

  const handleDataChange = (index, field, value) => {
    const newData = [...chartData];
    newData[index][field] = field === 'value' ? parseFloat(value) || 0 : value;
    setChartData(newData);
  };

  const addDataPoint = () => {
    setChartData([...chartData, { name: `Item ${chartData.length + 1}`, value: 10 }]);
  };

  const removeDataPoint = (index) => {
    setChartData(chartData.filter((_, i) => i !== index));
  };

  const saveChanges = () => {
    onUpdate(element.id, { chartData });
    setIsEditing(false);
  };

  const renderChart = () => {
    const data = element.chartData || chartData;
    
    switch (element.chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={element.donut ? '40%' : 0}
                outerRadius="80%"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-full h-full bg-white rounded-lg p-4 relative">
        {renderChart()}
        
        {isSelected && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Chart Data</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-xs">Label</Label>
                  <Input
                    value={item.name}
                    onChange={(e) => handleDataChange(index, 'name', e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="w-24">
                  <Label className="text-xs">Value</Label>
                  <Input
                    type="number"
                    value={item.value}
                    onChange={(e) => handleDataChange(index, 'value', e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mt-5 h-9 w-9 text-red-500"
                  onClick={() => removeDataPoint(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button variant="outline" onClick={addDataPoint} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Data Point
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={saveChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}