import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Download,
  Eye,
  Code2,
  Smartphone,
  Tablet,
  Monitor,
  ArrowRight
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";

const defaultHTML = `<div class="container">
    <h1>Welcome to the Code Playground!</h1>
    <p>Edit the HTML, CSS, and JavaScript to see your changes live.</p>
    <button id="clickMe">Click me!</button>
</div>`;

const defaultCSS = `/* Add your CSS styles here */
body {
    background-color: #fff;
}
.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    text-align: center;
}

h1 {
    color: #2563eb;
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

p {
    color: #64748b;
    font-size: 1.1rem;
    margin-bottom: 2rem;
}

#clickMe {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s ease;
}

#clickMe:hover {
    transform: translateY(-2px);
}`;

const defaultJS = `// Add your JavaScript here
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickMe');

    button.addEventListener('click', function() {
        button.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        button.textContent = 'Clicked! 🎉';

        setTimeout(() => {
            button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            button.textContent = 'Click me!';
        }, 2000);
    });
});`;

export default function CodePlayground() {
  const [html, setHtml] = useState(defaultHTML);
  const [css, setCss] = useState(defaultCSS);
  const [js, setJs] = useState(defaultJS);
  const [srcDoc, setSrcDoc] = useState('');
  const [activeTab, setActiveTab] = useState('html');
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const runCode = useCallback(() => {
    const generatePreviewContentLocal = () => {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Preview</title>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
        </html>
      `;
    };
    setSrcDoc(generatePreviewContentLocal());
  }, [html, css, js]);

  useEffect(() => {
    runCode();
  }, [runCode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runCode();
    }, 500);

    return () => clearTimeout(timer);
  }, [html, css, js, runCode]);

  const downloadCode = () => {
    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview</title>
        <style>${css}</style>
      </head>
      <body>
        ${html}
        <script>${js}</script>
      </body>
      </html>
    `;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Project downloaded successfully!');
  };

  const exportToFlutterGenerator = () => {
    try {
      const playgroundCode = JSON.stringify({ html, css, js });
      localStorage.setItem('playgroundCode', playgroundCode);
      toast.success('Code exported! Navigate to Flutter Generator to continue.');
      setTimeout(() => {
        window.location.href = createPageUrl('FlutterGenerator');
      }, 1000);
    } catch (error) {
      toast.error('Could not export code.');
      console.error("Error exporting to Flutter Generator:", error);
    }
  };

  const getDeviceStyles = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'max-w-sm mx-auto border-8 border-gray-800 rounded-[2.5rem] overflow-hidden shadow-xl';
      case 'tablet':
        return 'max-w-3xl mx-auto border-4 border-gray-600 rounded-2xl overflow-hidden shadow-xl';
      default:
        return 'w-full border border-gray-300 rounded-lg overflow-hidden shadow-lg';
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1">
        {/* Workflow Progress Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Step 1: Design & Code</h3>
                <p className="text-sm text-blue-700">Create your web application interface and functionality</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Web App Workflow</Badge>
              <Button 
                onClick={exportToFlutterGenerator}
                variant="outline" 
                size="sm"
              >
                Next: Convert to Mobile
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Code Playground</h1>
            <p className="text-slate-600">Build and test your web projects with live preview</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={runCode} className="bg-blue-600 hover:bg-blue-700">
              <Play className="w-4 h-4 mr-2" />
              Run Code
            </Button>
            <Button onClick={downloadCode} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={exportToFlutterGenerator} className="bg-green-600 hover:bg-green-700">
              <Smartphone className="w-4 h-4 mr-2" />
              Continue to Mobile
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0">
          {/* Code Editor */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Code2 className="w-5 h-5" />
                  Code Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="html" className="flex items-center gap-2">
                    HTML
                  </TabsTrigger>
                  <TabsTrigger value="css" className="flex items-center gap-2">
                    CSS
                  </TabsTrigger>
                  <TabsTrigger value="js" className="flex items-center gap-2">
                    JS
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 min-h-0">
                  <TabsContent value="html" className="h-full mt-0">
                    <Textarea
                      value={html}
                      onChange={(e) => setHtml(e.target.value)}
                      className="h-full min-h-[400px] font-mono text-sm resize-none border-0 bg-slate-50 focus:bg-white transition-colors"
                      placeholder="Enter your HTML code here..."
                    />
                  </TabsContent>
                  <TabsContent value="css" className="h-full mt-0">
                    <Textarea
                      value={css}
                      onChange={(e) => setCss(e.target.value)}
                      className="h-full min-h-[400px] font-mono text-sm resize-none border-0 bg-slate-50 focus:bg-white transition-colors"
                      placeholder="Enter your CSS code here..."
                    />
                  </TabsContent>
                  <TabsContent value="js" className="h-full mt-0">
                    <Textarea
                      value={js}
                      onChange={(e) => setJs(e.target.value)}
                      className="h-full min-h-[400px] font-mono text-sm resize-none border-0 bg-slate-50 focus:bg-white transition-colors"
                      placeholder="Enter your JavaScript code here..."
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('tablet')}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 bg-slate-100 rounded-lg p-4 min-h-[400px]">
                <div className={getDeviceStyles()}>
                  <iframe
                    srcDoc={srcDoc}
                    className="w-full h-96 bg-white"
                    title="Code Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}