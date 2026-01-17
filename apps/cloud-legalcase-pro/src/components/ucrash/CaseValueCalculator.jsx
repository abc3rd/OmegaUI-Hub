import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, AlertTriangle } from 'lucide-react';

const caseTypes = [
  { value: '1.5', label: 'Auto Accident (Minor)' },
  { value: '2.5', label: 'Auto Accident (Severe)' },
  { value: '2.0', label: 'Slip and Fall' },
  { value: '3.5', label: 'Medical Malpractice' },
  { value: '4.0', label: 'Wrongful Death' },
  { value: '3.0', label: 'Product Liability' },
];

const liabilityOptions = [
  { value: '1.0', label: 'Clear Liability (100% Defendant Fault)' },
  { value: '0.75', label: 'Disputed Liability (Likely 75% Fault)' },
  { value: '0.5', label: 'Comparative Negligence (50/50)' },
  { value: '0.2', label: 'High Risk / Unclear' },
];

export default function CaseValueCalculator() {
  const [formData, setFormData] = useState({
    caseType: '2.5',
    medBills: '',
    lostWages: '',
    futureMeds: '',
    liability: '1.0'
  });
  
  const [result, setResult] = useState(null);

  const calculateSettlement = () => {
    const medBills = parseFloat(formData.medBills) || 0;
    const lostWages = parseFloat(formData.lostWages) || 0;
    const futureMeds = parseFloat(formData.futureMeds) || 0;
    const multiplierBase = parseFloat(formData.caseType);
    const liabilityAdj = parseFloat(formData.liability);

    const economicDamages = medBills + lostWages + futureMeds;
    const lowMult = multiplierBase;
    const highMult = multiplierBase + 1.5;

    const lowEst = economicDamages * lowMult;
    const highEst = economicDamages * highMult;

    const finalLow = lowEst * liabilityAdj;
    const finalHigh = highEst * liabilityAdj;

    setResult({
      economicDamages,
      lowMult,
      highMult,
      liabilityAdj,
      finalLow,
      finalHigh
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-pink-500" />
            Settlement Value Estimator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-lg">
            <p className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <strong>For internal support team use only. Not legal advice.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label>Case Type</Label>
              <Select 
                value={formData.caseType} 
                onValueChange={(v) => setFormData({...formData, caseType: v})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {caseTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Total Medical Bills ($)</Label>
              <Input
                type="number"
                placeholder="e.g. 15000"
                value={formData.medBills}
                onChange={(e) => setFormData({...formData, medBills: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Lost Wages ($)</Label>
              <Input
                type="number"
                placeholder="e.g. 4500"
                value={formData.lostWages}
                onChange={(e) => setFormData({...formData, lostWages: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Future Medical Estimate ($)</Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={formData.futureMeds}
                onChange={(e) => setFormData({...formData, futureMeds: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <Label>Liability Clarity (Multiplier Adjustment)</Label>
            <Select 
              value={formData.liability} 
              onValueChange={(v) => setFormData({...formData, liability: v})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {liabilityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={calculateSettlement}
            className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Estimated Range
          </Button>

          {result && (
            <div className="mt-6 bg-purple-50 border-l-4 border-pink-500 rounded-r-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Estimated Settlement Range</h3>
              
              <div className="text-4xl font-extrabold text-pink-600 mb-4">
                {formatCurrency(result.finalLow)} - {formatCurrency(result.finalHigh)}
              </div>

              <div className="space-y-2 text-gray-700">
                <p><strong>Breakdown:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Economic Damages:</strong> {formatCurrency(result.economicDamages)}</li>
                  <li><strong>Injury Severity Multiplier:</strong> {result.lowMult}x to {result.highMult}x</li>
                  <li><strong>Liability Adjustment:</strong> {result.liabilityAdj * 100}% recoverable</li>
                </ul>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                *Calculated using the Multiplier Method (1.5x to 5x specials) adjusted for liability. 
                Actual results vary based on venue and insurance limits.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}