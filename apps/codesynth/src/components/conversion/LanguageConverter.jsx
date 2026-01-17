import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Copy, Loader2, Wand2 } from 'lucide-react';
import { InvokeLLM } from "@/integrations/Core";
import { toast } from "sonner";

const LANGUAGES = {
  'javascript': 'JavaScript',
  'typescript': 'TypeScript',
  'python': 'Python',
  'java': 'Java',
  'csharp': 'C#',
  'cpp': 'C++',
  'html': 'HTML',
  'css': 'CSS',
  'php': 'PHP',
  'ruby': 'Ruby',
  'go': 'Go',
  'rust': 'Rust',
  'swift': 'Swift',
  'kotlin': 'Kotlin',
  'dart': 'Dart (Flutter)',
  'jsx': 'React (JSX)',
  'tsx': 'React (TSX)',
  'vue': 'Vue.js',
  'flutter': 'Flutter/Dart',
  'react': 'React',
  'angular': 'Angular',
  'svelte': 'Svelte'
};

export default function LanguageConverter() {
  const [sourceCode, setSourceCode] = useState('');
  const [convertedCode, setConvertedCode] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = async () => {
    if (!sourceCode.trim()) {
      toast.error('Please enter source code to convert');
      return;
    }
    if (!sourceLanguage || !targetLanguage) {
      toast.error('Please select both source and target languages');
      return;
    }
    if (sourceLanguage === targetLanguage) {
      toast.error('Source and target languages must be different');
      return;
    }

    setIsConverting(true);
    try {
      const prompt = `Convert the following ${LANGUAGES[sourceLanguage]} code to ${LANGUAGES[targetLanguage]}. 
      
      Requirements:
      - Maintain the same functionality and logic
      - Follow best practices for the target language
      - Include necessary imports and dependencies
      - Add comments explaining significant changes if needed
      - Ensure the code is syntactically correct and follows conventions
      
      Source code (${LANGUAGES[sourceLanguage]}):
      \`\`\`${sourceLanguage}
      ${sourceCode}
      \`\`\`
      
      Please provide only the converted code in ${LANGUAGES[targetLanguage]}, properly formatted:`;

      const result = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setConvertedCode(result);
      toast.success('Code converted successfully');
    } catch (error) {
      toast.error('Failed to convert code. Please try again.');
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied to clipboard');
  };

  const handleSwapLanguages = () => {
    const tempLang = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(tempLang);
    setSourceCode(convertedCode);
    setConvertedCode('');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Code Converter</h1>
        <p className="text-slate-400">Convert code between any programming languages using advanced AI</p>
      </div>

      <div className="flex justify-center items-center gap-4 mb-6">
        <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
          <SelectTrigger className="w-48 bg-slate-900 border-slate-700 text-white">
            <SelectValue placeholder="From Language" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {Object.entries(LANGUAGES).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-white hover:bg-slate-700">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSwapLanguages}
          disabled={!sourceLanguage || !targetLanguage}
          className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
        >
          <ArrowRight className="w-4 h-4" />
        </Button>

        <Select value={targetLanguage} onValueChange={setTargetLanguage}>
          <SelectTrigger className="w-48 bg-slate-900 border-slate-700 text-white">
            <SelectValue placeholder="To Language" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {Object.entries(LANGUAGES).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-white hover:bg-slate-700">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleConvert}
          disabled={isConverting || !sourceCode.trim() || !sourceLanguage || !targetLanguage}
          className="bg-purple-600 hover:bg-purple-700 px-6"
        >
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Convert
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">
              Source Code {sourceLanguage && `(${LANGUAGES[sourceLanguage]})`}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(sourceCode)}
              disabled={!sourceCode}
              className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              placeholder="Paste your source code here..."
              className="h-96 font-mono text-sm bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">
              Converted Code {targetLanguage && `(${LANGUAGES[targetLanguage]})`}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(convertedCode)}
              disabled={!convertedCode}
              className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={convertedCode}
              readOnly
              placeholder={isConverting ? "Converting..." : "Converted code will appear here..."}
              className="h-96 font-mono text-sm bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 resize-none"
            />
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-800">
        <h3 className="text-lg font-semibold text-white mb-3">Supported Conversions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
          <div>• JavaScript ↔ TypeScript</div>
          <div>• React ↔ Vue ↔ Angular</div>
          <div>• Python ↔ Java ↔ C#</div>
          <div>• HTML/CSS ↔ React/Flutter</div>
          <div>• Swift ↔ Kotlin ↔ Dart</div>
          <div>• PHP ↔ Node.js ↔ Python</div>
          <div>• C++ ↔ Rust ↔ Go</div>
          <div>• And many more combinations!</div>
        </div>
      </div>
    </div>
  );
}