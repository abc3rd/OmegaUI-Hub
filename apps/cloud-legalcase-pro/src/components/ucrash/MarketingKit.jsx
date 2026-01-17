import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Copy, Check } from 'lucide-react';
import { toast } from "sonner";

const assets = [
  {
    title: '1. Standard Tracking Link',
    description: 'Use this link in email signatures or social bios.',
    content: 'https://ucrash.claims/?ref=PARTNER_ID',
    type: 'link'
  },
  {
    title: '2. "Get Help Now" Button Embed',
    description: 'Place this HTML on your law firm\'s "Resources" page.',
    content: `<a href="https://ucrash.claims" style="background:#ea00ea; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">
  Report Accident via uCrash
</a>`,
    type: 'code'
  },
  {
    title: '3. Social Media Blurb',
    description: 'Ready-to-post content for LinkedIn or Facebook.',
    content: `Been involved in an accident? Don't wait on the insurance companies. We use the uCrash system to document evidence instantly. Visit ucrash.claims to start your claim securely. #PersonalInjury #AutoAccident #uCrash #LegalTech`,
    type: 'text'
  },
  {
    title: '4. Email Signature Block',
    description: 'Add to your email signature for passive lead generation.',
    content: `---
Need help after an accident?
Start your claim instantly at ucrash.claims
Powered by Omega UI Legal Technology`,
    type: 'text'
  },
  {
    title: '5. Banner Ad Code',
    description: 'Responsive banner for website integration.',
    content: `<div style="background: linear-gradient(135deg, #ea00ea, #2699fe); padding: 20px; border-radius: 12px; text-align: center;">
  <h3 style="color: white; margin: 0 0 10px 0; font-size: 1.5rem;">Accident? Get Help Now</h3>
  <a href="https://ucrash.claims" style="background: white; color: #ea00ea; padding: 10px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
    Start Your Claim →
  </a>
</div>`,
    type: 'code'
  }
];

export default function MarketingKit() {
  const copyToClipboard = async (content, title) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(`Copied ${title} to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-pink-500" />
            Affiliate Marketing Kit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Resources for Attorneys to promote the uCrash network on their sites. 
            Drive traffic to <code className="bg-gray-100 px-2 py-1 rounded">ucrash.claims</code> and receive lead attribution.
          </p>
        </CardContent>
      </Card>

      {assets.map((asset, idx) => (
        <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{asset.title}</h3>
              <p className="text-gray-600 text-sm">{asset.description}</p>
            </div>
            <Button 
              onClick={() => copyToClipboard(asset.content, asset.title)}
              className="bg-gray-800 hover:bg-gray-900 text-white"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
          
          <div className={`rounded-lg overflow-x-auto ${
            asset.type === 'code' || asset.type === 'link'
              ? 'bg-gray-900 text-green-400 p-4 font-mono text-sm'
              : 'bg-gray-50 text-gray-800 p-4 border'
          }`}>
            <pre className="whitespace-pre-wrap">{asset.content}</pre>
          </div>
        </div>
      ))}

      {/* Preview Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Live Preview: Button Embed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <a 
              href="https://ucrash.claims" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-bold transition-colors shadow-lg"
            >
              Report Accident via uCrash
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Banner Preview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Live Preview: Banner Ad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-100 rounded-lg">
            <div 
              className="p-6 rounded-xl text-center"
              style={{ background: 'linear-gradient(135deg, #ea00ea, #2699fe)' }}
            >
              <h3 className="text-white text-2xl font-bold mb-4">Accident? Get Help Now</h3>
              <a 
                href="https://ucrash.claims"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-pink-500 px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-shadow"
              >
                Start Your Claim →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}