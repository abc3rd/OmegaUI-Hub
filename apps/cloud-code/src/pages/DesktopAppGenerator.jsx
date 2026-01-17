import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Computer,
  Copy,
  Loader2,
  Zap,
  Code2,
  Download,
  Terminal,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { InvokeLLM } from '@/integrations/Core';

export default function DesktopAppGenerator() {
  const [appName, setAppName] = useState('MyDesktopApp');
  const [targetOS, setTargetOS] = useState('windows');
  const [generationType, setGenerationType] = useState('webCode');
  
  // State for web code input
  const [htmlCode, setHtmlCode] = useState('<h1>Hello Desktop!</h1>');
  const [cssCode, setCssCode] = useState('body { background: #f0f0f0; }');
  const [jsCode, setJsCode] = useState('console.log("App started");');

  // State for script input
  const [scriptContent, setScriptContent] = useState('');
  
  // State for Q&A input
  const [appPurpose, setAppPurpose] = useState('');

  const [generatedFiles, setGeneratedFiles] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const importFromPlayground = () => {
    try {
      const savedCode = localStorage.getItem('playgroundCode');
      if (savedCode) {
        const { html, css, js } = JSON.parse(savedCode);
        setHtmlCode(html || '');
        setCssCode(css || '');
        setJsCode(js || '');
        setGenerationType('webCode');
        toast.success('Code imported from Playground!');
      } else {
        toast.error('No code found in Playground storage.');
      }
    } catch (error) {
      console.error('Failed to import code from playground:', error);
      toast.error('Failed to import code. Invalid data format.');
    }
  };
  
  const generatePrompt = () => {
    let context = '';
    let framework = 'Electron';
    
    switch (generationType) {
      case 'webCode':
        context = `HTML:
${htmlCode}

CSS:
${cssCode}

JavaScript:
${jsCode}`;
        break;
      case 'script':
        context = `The user wants to wrap the following script into a desktop executable:\n\n${scriptContent}`;
        framework = targetOS === 'windows' ? 'C# Console App' : 'Bash Script';
        break;
      case 'qa':
        context = `The user wants an app for the following purpose: "${appPurpose}". Generate a simple UI for it.`;
        break;
      default:
        return '';
    }

    return `
You are an expert desktop application generator. Your task is to create all the necessary files for a complete project that can be built into a native executable for the specified operating system.

Target OS: ${targetOS}
App Name: ${appName}
Framework/Technology: ${framework}
User's Goal:
${context}

Instructions:
1. Generate a complete, runnable project structure.
2. For an Electron app, include 'package.json', a main process file (e.g., 'main.js'), and renderer files ('index.html', etc.). The 'package.json' should include build scripts for the target OS using 'electron-builder'.
3. For a script wrapper, create a lightweight native host (e.g., C# for Windows, bash for macOS/Linux) that executes the provided script.
4. Include simple, clear build scripts (e.g., 'build.bat' for Windows, 'build.sh' for macOS/Linux).
5. Ensure the code is clean, modern, and follows best practices.

IMPORTANT: Your final output must be a single JSON object. The keys of the object should be the file paths (e.g., "src/index.js", "build.sh"), and the values should be the complete string content of each file.
Example:
{
  "package.json": "{...}",
  "main.js": "const { app, BrowserWindow } = require('electron'); ...",
  "build.sh": "npm install && npm run build"
}
`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedFiles(null);
    toast.info(`Generating ${targetOS} application...`);

    const prompt = generatePrompt();
    if (!prompt) {
      toast.error('Invalid generation type.');
      setIsGenerating(false);
      return;
    }

    try {
      const response = await InvokeLLM({
        prompt,
        response_json_schema: { type: "object" }
      });
      
      if (typeof response === 'object' && response !== null && Object.keys(response).length > 0) {
        setGeneratedFiles(response);
        toast.success('Desktop application files generated!');
      } else {
        throw new Error('AI returned an empty or invalid project structure.');
      }
    } catch (error) {
      console.error("Generation Error:", error);
      toast.error('Failed to generate application files. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Desktop App Generator</h1>
            <p className="text-slate-600">Create native executables from code, scripts, or simple prompts</p>
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Generate App Files
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Computer className="w-5 h-5" />
                  Project Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="appName">Application Name</Label>
                  <Input id="appName" value={appName} onChange={(e) => setAppName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetOS">Target Operating System</Label>
                  <Select value={targetOS} onValueChange={setTargetOS}>
                    <SelectTrigger id="targetOS">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="windows">Windows (.exe)</SelectItem>
                      <SelectItem value="macos">macOS (.dmg)</SelectItem>
                      <SelectItem value="linux">Linux (.AppImage)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Tabs value={generationType} onValueChange={setGenerationType} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="webCode">From Web Code</TabsTrigger>
                <TabsTrigger value="script">From Script</TabsTrigger>
                <TabsTrigger value="qa">Guided (Q&A)</TabsTrigger>
              </TabsList>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mt-4">
                <CardContent className="p-6">
                  <TabsContent value="webCode" className="mt-0 space-y-4">
                    <Button onClick={importFromPlayground} variant="outline" className="w-full">
                      <Code2 className="w-4 h-4 mr-2" />
                      Import from Code Playground
                    </Button>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <Textarea value={htmlCode} onChange={(e) => setHtmlCode(e.target.value)} placeholder="HTML" className="h-32 font-mono text-xs" />
                      <Textarea value={cssCode} onChange={(e) => setCssCode(e.target.value)} placeholder="CSS" className="h-32 font-mono text-xs" />
                      <Textarea value={jsCode} onChange={(e) => setJsCode(e.target.value)} placeholder="JavaScript" className="h-32 font-mono text-xs" />
                    </div>
                  </TabsContent>
                  <TabsContent value="script" className="mt-0 space-y-4">
                    <Label>Script Content</Label>
                    <Textarea value={scriptContent} onChange={(e) => setScriptContent(e.target.value)} placeholder="Paste your .bat, .ps1, or .sh script here..." className="h-48 font-mono text-sm" />
                    <Alert>
                      <Terminal className="h-4 w-4" />
                      <AlertDescription>The generator will create a native launcher to execute this script.</AlertDescription>
                    </Alert>
                  </TabsContent>
                  <TabsContent value="qa" className="mt-0 space-y-4">
                     <Label>What is the main purpose of your application?</Label>
                     <Textarea value={appPurpose} onChange={(e) => setAppPurpose(e.target.value)} placeholder="e.g., 'A simple calculator that can add and subtract numbers' or 'An app to show the current time and date'." />
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Generated Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating && (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                )}
                {!isGenerating && !generatedFiles && (
                  <div className="text-center text-sm text-slate-500 p-8">
                    Click "Generate App Files" to create your project.
                  </div>
                )}
                {generatedFiles && (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        A .zip download is not available. Please manually create each file below.
                      </AlertDescription>
                    </Alert>
                    {Object.entries(generatedFiles).map(([path, content]) => (
                      <div key={path} className="space-y-1">
                        <div className="flex justify-between items-center">
                           <Label htmlFor={path} className="font-mono text-xs">{path}</Label>
                           <Button onClick={() => copyToClipboard(content)} size="xs" variant="ghost">
                             <Copy className="w-3 h-3 mr-1" />
                             Copy
                           </Button>
                        </div>
                        <Textarea id={path} value={content} readOnly className="h-32 font-mono text-xs bg-slate-50" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {generatedFiles && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Terminal className="w-4 h-4" />
                      Build Instructions
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="text-sm text-slate-700 space-y-3">
                   <p>To build your application, follow these steps on your <strong className="capitalize">{targetOS}</strong> machine:</p>
                   <ol className="list-decimal list-inside space-y-2">
                     <li>Create a new empty folder for your project.</li>
                     <li>Manually create each file listed above with its corresponding content inside this folder.</li>
                     <li>
                        Install prerequisites:
                        <ul className="list-disc list-inside ml-4 mt-1 bg-slate-50 p-2 rounded-md">
                          <li>Node.js & npm (for Electron apps)</li>
                          {targetOS === 'windows' && <li>.NET SDK (for script wrappers)</li>}
                        </ul>
                     </li>
                     <li>Open a terminal or command prompt in your project folder.</li>
                     <li>Run the build command:
                        <pre className="bg-slate-800 text-white p-2 rounded-md mt-1 text-xs">
                          {targetOS === 'windows' ? 'build.bat' : 'sh build.sh'}
                        </pre>
                     </li>
                     <li>Find your executable in the newly created 'dist' folder.</li>
                   </ol>
                 </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}