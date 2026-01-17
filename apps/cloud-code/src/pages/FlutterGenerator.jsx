import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Monitor, 
  Apple, 
  Download, 
  Copy, 
  Loader2,
  Zap,
  CheckCircle,
  Code2,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { InvokeLLM } from '@/integrations/Core';

const PLATFORMS = [
  { id: 'android', name: 'Android', icon: Smartphone },
  { id: 'ios', name: 'iOS', icon: Apple },
  { id: 'windows', name: 'Windows', icon: Monitor },
  { id: 'macos', name: 'macOS', icon: Apple },
  { id: 'linux', name: 'Linux', icon: Monitor },
  { id: 'web', name: 'Web', icon: Code2 }
];

const SAMPLE_HTML = `<div class="container">
  <h1>My App</h1>
  <p>Welcome to my Flutter app!</p>
  <button id="myButton">Click Me</button>
  <div class="card">
    <h3>Card Title</h3>
    <p>Card content goes here</p>
  </div>
</div>`;

const SAMPLE_CSS = `.container {
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #2196F3;
  font-size: 24px;
  margin-bottom: 16px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

button {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
}`;

const SAMPLE_JS = `document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('myButton');
  button.addEventListener('click', function() {
    alert('Hello from Flutter!');
  });
});`;

export default function FlutterGenerator() {
  const [htmlCode, setHtmlCode] = useState(SAMPLE_HTML);
  const [cssCode, setCssCode] = useState(SAMPLE_CSS);
  const [jsCode, setJsCode] = useState(SAMPLE_JS);
  const [flutterCode, setFlutterCode] = useState('');
  const [appName, setAppName] = useState('MyApp');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['android', 'ios']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  const importFromPlayground = () => {
    try {
      const savedCode = localStorage.getItem('playgroundCode');
      if (savedCode) {
        const { html, css, js } = JSON.parse(savedCode);
        setHtmlCode(html || '');
        setCssCode(css || '');
        setJsCode(js || '');
        toast.success('Code imported from Playground!');
      } else {
        toast.error('No code found in Playground storage.');
      }
    } catch (error) {
      console.error('Failed to import code from playground:', error);
      toast.error('Failed to import code from Playground. Invalid data format.');
    }
  };

  const togglePlatform = (platformId) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const generateFlutterCode = async () => {
    if (!htmlCode.trim() && !cssCode.trim()) {
      toast.error('Please provide some HTML or CSS code to convert.');
      return;
    }

    setIsGenerating(true);
    setActiveTab('output');
    toast.info('Converting your web code to Flutter...');

    const platforms = selectedPlatforms.join(', ');
    
    const prompt = `
You are a Flutter expert. Convert the following web code to a complete Flutter application.

App Name: ${appName}
Target Platforms: ${platforms}

HTML:
${htmlCode}

CSS:
${cssCode}

JavaScript:
${jsCode}

Requirements:
1. Create a complete Flutter app with proper main.dart structure
2. Convert HTML elements to appropriate Flutter widgets
3. Convert CSS styles to Flutter styling (Colors, TextStyles, etc.)
4. Convert JavaScript interactions to Dart event handlers
5. Use Material Design components where appropriate
6. Make it responsive and platform-appropriate
7. Include necessary imports and dependencies

Provide ONLY the complete Flutter/Dart code, no explanations or markdown formatting.
`;

    try {
      const response = await InvokeLLM({ prompt });
      if (typeof response === 'string') {
        setFlutterCode(response.trim());
        toast.success('Flutter code generated successfully!');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate Flutter code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyFlutterCode = () => {
    if (!flutterCode) return;
    navigator.clipboard.writeText(flutterCode);
    toast.success('Flutter code copied to clipboard!');
  };

  const downloadFlutterProject = () => {
    if (!flutterCode) return;
    
    const blob = new Blob([flutterCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${appName.toLowerCase().replace(/\s+/g, '_')}_main.dart`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Flutter code downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Workflow Progress Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Step 2: Convert to Mobile</h3>
                <p className="text-sm text-green-700">Transform your web code into native mobile applications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Web App Workflow</Badge>
              <Button 
                onClick={() => window.location.href = '/BackendArchitect'}
                variant="outline" 
                size="sm"
              >
                Next: Setup Backend
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Flutter Cross-Platform Generator</h1>
            <p className="text-slate-600">Convert your web code to native Flutter applications</p>
          </div>
          <Button onClick={importFromPlayground} className="bg-blue-600 hover:bg-blue-700">
            <Code2 className="w-4 h-4 mr-2" />
            Import from Playground
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Configuration */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Zap className="w-5 h-5" />
                  App Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName">App Name</Label>
                    <Input
                      id="appName"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Enter your app name"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Target Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((platform) => (
                      <Button
                        key={platform.id}
                        variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePlatform(platform.id)}
                        className="flex items-center gap-2"
                      >
                        <platform.icon className="w-4 h-4" />
                        {platform.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Code Input/Output */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Smartphone className="w-5 h-5" />
                    Code Converter
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={activeTab === 'input' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('input')}
                    >
                      Web Code Input
                    </Button>
                    <Button
                      variant={activeTab === 'output' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTab('output')}
                    >
                      Flutter Output
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'input' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>HTML</Label>
                        <Textarea
                          value={htmlCode}
                          onChange={(e) => setHtmlCode(e.target.value)}
                          className="h-64 font-mono text-sm"
                          placeholder="Enter your HTML code..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CSS</Label>
                        <Textarea
                          value={cssCode}
                          onChange={(e) => setCssCode(e.target.value)}
                          className="h-64 font-mono text-sm"
                          placeholder="Enter your CSS code..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>JavaScript</Label>
                        <Textarea
                          value={jsCode}
                          onChange={(e) => setJsCode(e.target.value)}
                          className="h-64 font-mono text-sm"
                          placeholder="Enter your JavaScript code..."
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button 
                        onClick={generateFlutterCode}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isGenerating ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        Generate Flutter Code
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Generated Flutter Code</Label>
                      <div className="flex gap-2">
                        <Button
                          onClick={copyFlutterCode}
                          size="sm"
                          variant="outline"
                          disabled={!flutterCode}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button
                          onClick={downloadFlutterProject}
                          size="sm"
                          variant="outline"
                          disabled={!flutterCode}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="relative">
                      <Textarea
                        value={flutterCode}
                        readOnly
                        className="h-96 font-mono text-sm bg-slate-50"
                        placeholder={isGenerating ? "Generating Flutter code..." : "Generated Flutter code will appear here..."}
                      />
                      {isGenerating && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="text-slate-600">Converting to Flutter...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Support */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Platform Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {PLATFORMS.map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <platform.icon className="w-5 h-5 text-slate-600" />
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                    {selectedPlatforms.includes(platform.id) ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">HTML to Flutter Widgets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">CSS to Flutter Styling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">JS to Dart Logic</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Cross-Platform Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Material Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Responsive Layout</span>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p><strong>1.</strong> Enter your HTML, CSS, and JavaScript code</p>
                <p><strong>2.</strong> Select target platforms</p>
                <p><strong>3.</strong> Click "Generate Flutter Code"</p>
                <p><strong>4.</strong> Download and integrate into your Flutter project</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}