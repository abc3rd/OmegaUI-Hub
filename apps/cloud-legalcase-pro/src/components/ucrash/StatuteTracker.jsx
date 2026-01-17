import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, AlertTriangle, CheckCircle } from 'lucide-react';
import { format, addYears, differenceInDays, isPast } from 'date-fns';

const jurisdictions = [
  { value: '2', label: 'Florida - Negligence/Tort (2 Years - New Statute)' },
  { value: '4', label: 'Florida - Negligence (4 Years - Old Statute/Specifics)' },
  { value: '2-wd', label: 'Florida - Wrongful Death (2 Years)' },
  { value: '2-mm', label: 'Florida - Med Mal (2 Years from discovery)' },
  { value: '5', label: 'Florida - Breach of Contract (5 Years)' },
  { value: '3', label: 'Georgia - Personal Injury (2 Years)' },
  { value: '4-tx', label: 'Texas - Personal Injury (2 Years)' },
  { value: '2-ny', label: 'New York - Personal Injury (3 Years)' },
  { value: '2-ca', label: 'California - Personal Injury (2 Years)' },
];

export default function StatuteTracker() {
  const [incidentDate, setIncidentDate] = useState('');
  const [jurisdiction, setJurisdiction] = useState('2');
  const [result, setResult] = useState(null);

  const calculateDeadline = () => {
    if (!incidentDate) {
      alert('Please enter a date of incident.');
      return;
    }

    const incident = new Date(incidentDate);
    const yearsToAdd = parseInt(jurisdiction.split('-')[0]);
    const deadline = addYears(incident, yearsToAdd);
    const today = new Date();
    const daysRemaining = differenceInDays(deadline, today);
    const isExpired = isPast(deadline);

    setResult({
      deadline,
      daysRemaining,
      isExpired
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-blue-500" />
            Statute of Limitations Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Quickly determine the filing deadline. Default logic set to Florida Statutes (Operating base of Omega UI).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label>Date of Incident</Label>
              <Input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Case Jurisdiction</Label>
              <Select value={jurisdiction} onValueChange={setJurisdiction}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictions.map(j => (
                    <SelectItem key={j.value} value={j.value}>
                      {j.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={calculateDeadline}
            className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white"
          >
            <Scale className="w-4 h-4 mr-2" />
            Calculate Deadline
          </Button>

          {result && (
            <div className={`mt-6 border-l-4 rounded-r-xl p-6 ${
              result.isExpired 
                ? 'bg-red-50 border-red-500' 
                : result.daysRemaining < 90 
                  ? 'bg-orange-50 border-orange-500' 
                  : 'bg-green-50 border-green-500'
            }`}>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Filing Deadline</h3>
              
              <div className={`text-4xl font-extrabold mb-4 ${
                result.isExpired ? 'text-red-600' : 'text-pink-600'
              }`}>
                {format(result.deadline, 'MMMM d, yyyy')}
              </div>

              <div className={`flex items-center gap-2 text-lg font-bold ${
                result.isExpired 
                  ? 'text-red-600' 
                  : result.daysRemaining < 90 
                    ? 'text-orange-600' 
                    : 'text-green-600'
              }`}>
                {result.isExpired ? (
                  <>
                    <AlertTriangle className="w-6 h-6" />
                    EXPIRED ({Math.abs(result.daysRemaining)} days ago)
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    {result.daysRemaining} Days Remaining to File
                  </>
                )}
              </div>

              {!result.isExpired && result.daysRemaining < 90 && (
                <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                  <p className="text-orange-800 font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    WARNING: Deadline approaching! Take immediate action.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Florida Statute Quick Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { type: 'Personal Injury/Negligence', years: '2 Years', note: 'HB 837 (2023)' },
              { type: 'Medical Malpractice', years: '2 Years', note: 'From discovery' },
              { type: 'Wrongful Death', years: '2 Years', note: 'From date of death' },
              { type: 'Product Liability', years: '4 Years', note: 'Strict liability' },
              { type: 'Breach of Contract', years: '5 Years', note: 'Written contracts' },
              { type: 'Property Damage', years: '4 Years', note: 'Real or personal' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold text-gray-900">{item.type}</div>
                <div className="text-2xl font-bold text-pink-600">{item.years}</div>
                <div className="text-sm text-gray-500">{item.note}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}