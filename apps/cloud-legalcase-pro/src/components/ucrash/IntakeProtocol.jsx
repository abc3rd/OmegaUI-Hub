import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Car, Stethoscope, AlertTriangle, Building } from 'lucide-react';

const checklists = [
  {
    id: 'auto',
    title: 'Auto Accident Checklist',
    icon: Car,
    color: 'border-pink-500',
    bgColor: 'bg-pink-50',
    items: [
      { id: 'police', label: 'Police Report / Crash Exchange', note: 'Must have exchange number.' },
      { id: 'photos', label: 'Photos of Damage', note: '4 angles of vehicle + interior.' },
      { id: 'medical', label: 'Medical Status', note: 'Has client sought treatment within 14 days? (PIP Rule).' },
      { id: 'insurance', label: 'Insurance Info', note: "Photo of client's insurance card." },
    ]
  },
  {
    id: 'medmal',
    title: 'Medical Malpractice Checklist',
    icon: Stethoscope,
    color: 'border-blue-500',
    bgColor: 'bg-blue-50',
    items: [
      { id: 'timeline', label: 'Timeline of Care', note: 'Exact dates of procedure and discovery of injury.' },
      { id: 'provider', label: 'Provider Info', note: 'Name of Doctor and Facility.' },
      { id: 'treatment', label: 'Subsequent Treatment', note: 'Corrective surgeries required?' },
      { id: 'statute', label: 'Statute Check', note: 'Is it within 2 years of incident?', warning: true },
    ]
  },
  {
    id: 'slipfall',
    title: 'Slip & Fall / Premises Checklist',
    icon: AlertTriangle,
    color: 'border-orange-500',
    bgColor: 'bg-orange-50',
    items: [
      { id: 'incident', label: 'Incident Report', note: 'Was a manager notified? Report filed?' },
      { id: 'hazard', label: 'Hazard ID', note: 'What caused the fall? (Liquid, uneven surface).' },
      { id: 'footwear', label: 'Footwear', note: 'Photos of shoes worn during incident.' },
      { id: 'witnesses', label: 'Witnesses', note: 'Names and numbers of observers.' },
    ]
  },
  {
    id: 'wrongfuldeath',
    title: 'Wrongful Death Checklist',
    icon: Building,
    color: 'border-gray-800',
    bgColor: 'bg-gray-100',
    items: [
      { id: 'relationship', label: 'Relationship to Deceased', note: 'Spouse, child, parent, or personal representative.' },
      { id: 'deathcert', label: 'Death Certificate', note: 'Obtain official copy.' },
      { id: 'cause', label: 'Cause of Death', note: 'Documentation of how negligence caused death.' },
      { id: 'dependents', label: 'Dependents', note: 'List of surviving dependents and their relationship.' },
      { id: 'estate', label: 'Estate Status', note: 'Has estate been opened? Personal representative appointed?' },
    ]
  }
];

export default function IntakeProtocol() {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleItem = (checklistId, itemId) => {
    const key = `${checklistId}-${itemId}`;
    setCheckedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getChecklistProgress = (checklistId, items) => {
    const completed = items.filter(item => checkedItems[`${checklistId}-${item.id}`]).length;
    return { completed, total: items.length };
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 uCrash Support Team Protocol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Before referring a lead to the network, ensure the following "Evidence Packet" is complete based on case type.
          </p>
        </CardContent>
      </Card>

      {checklists.map(checklist => {
        const Icon = checklist.icon;
        const progress = getChecklistProgress(checklist.id, checklist.items);
        
        return (
          <Card key={checklist.id} className={`shadow-lg border-t-4 ${checklist.color}`}>
            <CardHeader className={checklist.bgColor}>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5" />
                  {checklist.title}
                </div>
                <span className="text-sm font-normal text-gray-600">
                  {progress.completed}/{progress.total} complete
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {checklist.items.map(item => {
                  const key = `${checklist.id}-${item.id}`;
                  const isChecked = checkedItems[key] || false;
                  
                  return (
                    <label
                      key={item.id}
                      className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                        isChecked ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(checklist.id, item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className={`font-semibold ${item.warning ? 'text-orange-600' : 'text-gray-900'}`}>
                          {item.label}
                        </p>
                        <p className="text-sm text-gray-600">{item.note}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}