import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Monitor, Download, Settings, Play, CheckCircle2 } from 'lucide-react';

export default function LocalAISetup() {
  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Monitor className="w-5 h-5 text-purple-400" />
          Local AI Setup Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-purple-500/10 border-purple-500/30">
          <AlertDescription className="text-purple-200">
            Run AI models locally on your machine - <strong>100% FREE</strong>, no API costs!
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-purple-300 font-bold">1</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download LM Studio
              </h3>
              <p className="text-slate-300 text-sm mb-2">
                Visit <a href="https://lmstudio.ai" target="_blank" className="text-cyan-400 hover:text-cyan-300 underline">lmstudio.ai</a> and download for your OS
              </p>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Available for Windows, Mac, and Linux
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-purple-300 font-bold">2</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Download a Model
              </h3>
              <p className="text-slate-300 text-sm mb-2">
                In LM Studio, search and download a model. Recommended options:
              </p>
              <ul className="space-y-1 text-sm text-slate-400 ml-4">
                <li>• <strong className="text-slate-300">Llama 3.2 (3B)</strong> - Fast, great for testing</li>
                <li>• <strong className="text-slate-300">Mistral 7B</strong> - Balanced performance</li>
                <li>• <strong className="text-slate-300">Qwen 2.5 (7B)</strong> - Excellent quality</li>
                <li>• <strong className="text-slate-300">Phi-3 (3.8B)</strong> - Microsoft's efficient model</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-purple-300 font-bold">3</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start the Server
              </h3>
              <p className="text-slate-300 text-sm mb-2">
                In LM Studio:
              </p>
              <ol className="space-y-1 text-sm text-slate-400 ml-4">
                <li>1. Load your downloaded model</li>
                <li>2. Click on "Local Server" tab</li>
                <li>3. Click "Start Server"</li>
                <li>4. Server will run on <code className="bg-slate-700 px-2 py-0.5 rounded text-cyan-300">http://localhost:1234</code></li>
              </ol>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Configure in UCP</h3>
              <p className="text-slate-300 text-sm mb-2">
                In the Configuration panel:
              </p>
              <ol className="space-y-1 text-sm text-slate-400 ml-4">
                <li>1. Click "Add" under AI Providers</li>
                <li>2. Select "Local LM Studio"</li>
                <li>3. Model name can be anything (e.g., "local-model")</li>
                <li>4. Click "Save Provider"</li>
                <li>5. Set it as default by clicking the star icon ⭐</li>
              </ol>
            </div>
          </div>
        </div>

        <Alert className="bg-cyan-500/10 border-cyan-500/30">
          <AlertDescription className="text-cyan-200 text-sm">
            <strong>💡 Pro Tip:</strong> Keep LM Studio running in the background while using this app. 
            Your data stays 100% private - nothing leaves your computer!
          </AlertDescription>
        </Alert>

        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <h4 className="text-white font-semibold mb-2 text-sm">Troubleshooting</h4>
          <ul className="space-y-1 text-xs text-slate-400">
            <li>• <strong>Connection failed?</strong> Make sure LM Studio server is running</li>
            <li>• <strong>Slow responses?</strong> Try a smaller model (3B-7B parameters)</li>
            <li>• <strong>Out of memory?</strong> Close other apps or use a quantized model</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}