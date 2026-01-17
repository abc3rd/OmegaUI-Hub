import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Copy, Loader2, GitCompareArrows } from 'lucide-react';
import { toast } from 'sonner';
import { InvokeLLM } from '@/integrations/Core';

const LANGUAGES = [
  'JavaScript',
  'Dart',
  'Python',
  'Java',
  'C++',
  'Go',
  'Rust',
  'TypeScript',
  'HTML',
  'CSS',
  'Ruby',
  'PHP',
];

export default function CodeConverter() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [sourceLang, setSourceLang] = useState('JavaScript');
  const [targetLang, setTargetLang] = useState('Dart');
  const [isLoading, setIsLoading] = useState(false);

  const handleConvert = async () => {
    if (!inputCode.trim()) {
      toast.error('Please enter some code to convert.');
      return;
    }

    setIsLoading(true);
    setOutputCode('');
    toast.info(`Converting from ${sourceLang} to ${targetLang}...`);

    const prompt = `
      You are an expert code converter. Convert the following code snippet from ${sourceLang} to ${targetLang}.
      IMPORTANT: Provide ONLY the raw, converted code block. Do not include any explanations, introductions, or markdown formatting like \`\`\`.
      
      Code to convert:
      ${inputCode}
    `;

    try {
      const response = await InvokeLLM({ prompt });
      if (typeof response === 'string') {
        setOutputCode(response.trim());
        toast.success('Code converted successfully!');
      } else {
        throw new Error('Unexpected response format from AI.');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Failed to convert code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    toast.success('Converted code copied to clipboard!');
  };
  
  const swapLanguages = () => {
    const oldSource = sourceLang;
    const oldTarget = targetLang;
    setSourceLang(oldTarget);
    setTargetLang(oldSource);
    setInputCode(outputCode);
    setOutputCode(inputCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Code Converter</h1>
            <p className="text-slate-600">Translate code snippets between languages using AI</p>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <GitCompareArrows className="w-5 h-5" />
              AI-Powered Code Translator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-center">
              {/* Input Pane */}
              <div className="space-y-4">
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger>
                    <SelectValue placeholder="Source Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={`source-${lang}`} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder={`Enter ${sourceLang} code here...`}
                  className="h-96 font-mono text-sm resize-none bg-slate-50"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-4">
                 <Button
                    onClick={swapLanguages}
                    variant="outline"
                    size="icon"
                    className="hidden lg:flex"
                    title="Swap Languages"
                 >
                    <GitCompareArrows className="w-4 h-4" />
                 </Button>
                <Button onClick={handleConvert} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  Convert
                </Button>
              </div>

              {/* Output Pane */}
              <div className="space-y-4">
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger>
                    <SelectValue placeholder="Target Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={`target-${lang}`} value={lang}>{lang}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative h-96">
                  <Textarea
                    value={outputCode}
                    readOnly
                    placeholder={`Converted ${targetLang} code will appear here...`}
                    className="h-full font-mono text-sm resize-none bg-slate-100"
                  />
                  {outputCode && (
                    <Button
                      onClick={copyToClipboard}
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}