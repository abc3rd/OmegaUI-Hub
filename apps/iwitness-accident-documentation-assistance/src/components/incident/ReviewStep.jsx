import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Calendar, MapPin, Car, Heart, Users, Camera, 
  FileText, CheckCircle2, AlertTriangle, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { US_STATES } from '../core/jurisdictionGate';

export default function ReviewStep({ 
  data, 
  evidenceFiles, 
  consents, 
  onConsentChange 
}) {
  const getStateName = (code) => {
    return US_STATES.find(s => s.code === code)?.name || code;
  };

  const Section = ({ icon: Icon, title, children, color = "slate" }) => (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${color}-50`}>
            <Icon className={`w-4 h-4 text-${color}-600`} />
          </div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );

  const completedSections = [
    data.occurred_at && data.jurisdiction_state,
    data.vehicles_involved?.length > 0,
    true, // Injuries optional
    true, // Witnesses optional
    true, // Evidence optional
    data.narrative?.length > 50
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-50">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Review & Submit</h2>
          <p className="text-sm text-slate-500">Review your incident documentation before submitting</p>
        </div>
      </div>

      {/* Completion Progress */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-50 to-slate-100">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Documentation Progress</span>
            <span className="text-sm text-slate-500">{completedSections}/6 sections</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(completedSections / 6) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section icon={Calendar} title="Date & Location" color="blue">
          {data.occurred_at ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500">Date:</span> {format(new Date(data.occurred_at), 'MMMM d, yyyy')}</p>
              <p><span className="text-slate-500">Time:</span> {format(new Date(data.occurred_at), 'h:mm a')}</p>
              <p><span className="text-slate-500">Location:</span> {data.location_text || 'Not specified'}</p>
              <p><span className="text-slate-500">State:</span> {getStateName(data.jurisdiction_state)}</p>
              {data.jurisdiction_county && (
                <p><span className="text-slate-500">County:</span> {data.jurisdiction_county}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No date/location provided</p>
          )}
        </Section>

        <Section icon={Car} title="Vehicles" color="emerald">
          {data.vehicles_involved?.length > 0 ? (
            <div className="space-y-2">
              {data.vehicles_involved.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {v.is_own_vehicle ? 'Your Vehicle' : `Vehicle ${i + 1}`}
                  </Badge>
                  <span className="text-sm text-slate-600">
                    {[v.year, v.make, v.model].filter(Boolean).join(' ') || 'Details incomplete'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No vehicles added</p>
          )}
        </Section>

        <Section icon={Heart} title="Injuries" color="red">
          {data.injuries?.length > 0 ? (
            <div className="space-y-1">
              {data.injuries.map((inj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      inj.severity === 'severe' ? 'border-red-300 text-red-600' :
                      inj.severity === 'moderate' ? 'border-orange-300 text-orange-600' :
                      'border-yellow-300 text-yellow-600'
                    }`}
                  >
                    {inj.severity}
                  </Badge>
                  <span className="text-sm text-slate-600">{inj.person}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No injuries reported</p>
          )}
        </Section>

        <Section icon={Users} title="Witnesses" color="violet">
          {data.witnesses?.length > 0 ? (
            <p className="text-sm text-slate-600">
              {data.witnesses.length} witness(es) documented
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">No witnesses added</p>
          )}
        </Section>

        <Section icon={Camera} title="Evidence" color="indigo">
          {evidenceFiles?.length > 0 ? (
            <p className="text-sm text-slate-600">
              {evidenceFiles.length} file(s) uploaded
            </p>
          ) : (
            <p className="text-sm text-slate-400 italic">No evidence uploaded</p>
          )}
        </Section>

        <Section icon={FileText} title="Statement" color="teal">
          {data.narrative?.length > 50 ? (
            <p className="text-sm text-slate-600">
              {data.narrative.length} characters written
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <p className="text-sm text-amber-600">Statement is short or missing</p>
            </div>
          )}
        </Section>
      </div>

      {/* Consent Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100">
              <Shield className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">Consent & Agreements</CardTitle>
              <CardDescription>Please review and accept the following</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
            <Checkbox
              id="terms"
              checked={consents.terms_privacy}
              onCheckedChange={(checked) => onConsentChange('terms_privacy', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                Terms of Service & Privacy Policy *
              </Label>
              <p className="text-xs text-slate-500">
                I agree to the Terms of Service and Privacy Policy. I understand my data will be 
                stored securely and used only for incident documentation purposes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
            <Checkbox
              id="accuracy"
              checked={consents.accuracy}
              onCheckedChange={(checked) => onConsentChange('accuracy', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="accuracy" className="text-sm font-medium cursor-pointer">
                Accuracy Confirmation *
              </Label>
              <p className="text-xs text-slate-500">
                I confirm that the information provided is accurate to the best of my knowledge.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50">
            <Checkbox
              id="marketing"
              checked={consents.marketing}
              onCheckedChange={(checked) => onConsentChange('marketing', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="marketing" className="text-sm font-medium cursor-pointer">
                Updates & Tips (Optional)
              </Label>
              <p className="text-xs text-slate-500">
                I would like to receive helpful tips and updates about managing my incident.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}