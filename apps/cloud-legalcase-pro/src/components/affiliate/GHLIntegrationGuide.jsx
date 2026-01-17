import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, QrCode, Mail, Users, RefreshCw, 
  CheckCircle2, Zap, Database
} from 'lucide-react';

export default function GHLIntegrationGuide() {
  const flowSteps = [
    {
      platform: 'GHL',
      icon: Users,
      title: 'Affiliate Signs Up',
      description: 'New affiliate added to GHL contact list with custom fields',
      color: 'bg-orange-100 text-orange-700'
    },
    {
      platform: 'GHL',
      icon: Mail,
      title: 'Welcome Email Sent',
      description: 'GHL workflow sends email with personalized tracking link & QR',
      color: 'bg-orange-100 text-orange-700'
    },
    {
      platform: 'Both',
      icon: QrCode,
      title: 'QR Code Generated',
      description: 'Use GHL QR generator or our built-in - both use same ref code',
      color: 'bg-purple-100 text-purple-700'
    },
    {
      platform: 'App',
      icon: Zap,
      title: 'Lead Submits Form',
      description: 'Lead lands on intake page, affiliate code captured automatically',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      platform: 'App',
      icon: Database,
      title: 'Lead Created',
      description: 'Lead saved with affiliate reference, click event logged',
      color: 'bg-blue-100 text-blue-700'
    },
    {
      platform: 'GHL',
      icon: RefreshCw,
      title: 'Webhook Triggers',
      description: 'GHL receives new lead data, creates opportunity in pipeline',
      color: 'bg-orange-100 text-orange-700'
    },
    {
      platform: 'Both',
      icon: CheckCircle2,
      title: 'Status Synced',
      description: 'Pipeline stage updates flow between both platforms',
      color: 'bg-green-100 text-green-700'
    },
  ];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-orange-500" />
          GoHighLevel ↔ uCrash Integration Flow
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {flowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {step.platform}
                    </Badge>
                    <span className="font-semibold">{step.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">💡 GHL QR Code Setup</h4>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. In GHL, go to Marketing → QR Codes</li>
            <li>2. Create new QR with URL: <code className="bg-yellow-100 px-1 rounded">yourapp.com/LeadIntake?ref=AFFILIATE_CODE&source=qr</code></li>
            <li>3. Use custom field <code className="bg-yellow-100 px-1 rounded">{'{{contact.affiliate_code}}'}</code> for dynamic codes</li>
            <li>4. Download & share with affiliate via email workflow</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}