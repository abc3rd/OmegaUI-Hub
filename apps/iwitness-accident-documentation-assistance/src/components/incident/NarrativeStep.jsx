import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PenLine, Lightbulb, CheckCircle2 } from 'lucide-react';

export default function NarrativeStep({ data, onChange }) {
  const prompts = [
    "What were you doing immediately before the incident?",
    "Describe exactly what happened during the incident.",
    "What did you do immediately after the incident?",
    "Were there any other important details?"
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-teal-50">
          <PenLine className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Your Account</h2>
          <p className="text-sm text-slate-500">Describe what happened in your own words</p>
        </div>
      </div>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-start gap-3 pt-4">
          <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Writing Tips</p>
            <ul className="text-sm text-amber-700 mt-1 space-y-1">
              <li>• Be as specific as possible about times and locations</li>
              <li>• Stick to the facts — describe what you saw and heard</li>
              <li>• Include any statements made by other parties</li>
              <li>• Don't worry about perfect grammar — clarity is key</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Guided Prompts</CardTitle>
          <CardDescription>Use these questions to help structure your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 bg-slate-50 rounded-lg p-4">
            {prompts.map((prompt, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600 flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-600">{prompt}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Your Statement</CardTitle>
          <CardDescription>
            Write a detailed account of what happened
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="I was driving [direction] on [street name] when..."
            value={data.narrative || ''}
            onChange={(e) => onChange({ ...data, narrative: e.target.value })}
            className="min-h-[300px] bg-white resize-none text-base leading-relaxed"
          />
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-slate-500">
              {data.narrative?.length || 0} characters
            </p>
            {data.narrative?.length > 100 && (
              <div className="flex items-center gap-1 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Good detail!</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}