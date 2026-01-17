import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Heart, Plus, Trash2, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const emptyInjury = {
  person: '',
  description: '',
  severity: 'unknown',
  medical_attention_sought: false
};

const emptyPoliceReport = {
  filed: false,
  report_number: '',
  department: '',
  officer_name: '',
  officer_badge: ''
};

export default function InjuriesStep({ data, onChange }) {
  const injuries = data.injuries || [];
  const policeReport = data.police_report || emptyPoliceReport;

  const addInjury = () => {
    onChange({ ...data, injuries: [...injuries, { ...emptyInjury }] });
  };

  const removeInjury = (index) => {
    onChange({ ...data, injuries: injuries.filter((_, i) => i !== index) });
  };

  const updateInjury = (index, field, value) => {
    const newInjuries = [...injuries];
    newInjuries[index] = { ...newInjuries[index], [field]: value };
    onChange({ ...data, injuries: newInjuries });
  };

  const updatePoliceReport = (field, value) => {
    onChange({ ...data, police_report: { ...policeReport, [field]: value } });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'moderate': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'severe': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Injuries Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Injuries</h2>
              <p className="text-sm text-slate-500">Document any injuries that occurred</p>
            </div>
          </div>
          <Button onClick={addInjury} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Injury
          </Button>
        </div>

        {injuries.length === 0 && (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-sm text-slate-500 text-center">
                No injuries reported. Click "Add Injury" if anyone was injured.
              </p>
            </CardContent>
          </Card>
        )}

        <AnimatePresence mode="popLayout">
          {injuries.map((injury, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Person Injured</Label>
                        <Input
                          placeholder="e.g., Myself, Passenger, Other driver"
                          value={injury.person}
                          onChange={(e) => updateInjury(index, 'person', e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select
                          value={injury.severity}
                          onValueChange={(value) => updateInjury(index, 'severity', value)}
                        >
                          <SelectTrigger className={cn("bg-white", getSeverityColor(injury.severity))}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minor">Minor</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                            <SelectItem value="unknown">Unknown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInjury(index)}
                      className="text-slate-400 hover:text-red-500 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Description of Injury</Label>
                    <Textarea
                      placeholder="Describe the injury..."
                      value={injury.description}
                      onChange={(e) => updateInjury(index, 'description', e.target.value)}
                      className="bg-white resize-none"
                      rows={2}
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id={`medical-${index}`}
                      checked={injury.medical_attention_sought}
                      onCheckedChange={(checked) => updateInjury(index, 'medical_attention_sought', checked)}
                    />
                    <Label htmlFor={`medical-${index}`} className="text-sm cursor-pointer">
                      Medical attention was sought
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Police Report Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Police Report</CardTitle>
                <CardDescription>Was a police report filed?</CardDescription>
              </div>
            </div>
            <Switch
              checked={policeReport.filed}
              onCheckedChange={(checked) => updatePoliceReport('filed', checked)}
            />
          </div>
        </CardHeader>
        
        <AnimatePresence>
          {policeReport.filed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Report Number</Label>
                    <Input
                      placeholder="Police report number"
                      value={policeReport.report_number}
                      onChange={(e) => updatePoliceReport('report_number', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Police Department</Label>
                    <Input
                      placeholder="e.g., Los Angeles PD"
                      value={policeReport.department}
                      onChange={(e) => updatePoliceReport('department', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Officer Name (optional)</Label>
                    <Input
                      placeholder="Responding officer's name"
                      value={policeReport.officer_name}
                      onChange={(e) => updatePoliceReport('officer_name', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Badge Number (optional)</Label>
                    <Input
                      placeholder="Officer's badge number"
                      value={policeReport.officer_badge}
                      onChange={(e) => updatePoliceReport('officer_badge', e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Medical attention reminder */}
      {injuries.some(i => i.medical_attention_sought) && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Keep Your Medical Records</p>
              <p className="text-sm text-amber-700 mt-1">
                Remember to keep copies of all medical records, bills, and treatment documentation. 
                You can upload these in the next step.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}