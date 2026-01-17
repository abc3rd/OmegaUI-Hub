import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  QrCode, 
  Type, 
  FileText, 
  Copy, 
  Hash,
  Shuffle,
  Download
} from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

export default function WebUtilities() {
  const [qrText, setQrText] = useState('https://base44.com');
  const [qrDataURL, setQrDataURL] = useState('');
  
  const [markdownText, setMarkdownText] = useState(`# Welcome to Markdown
## This is a subheading
This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2  
- List item 3

[This is a link](https://example.com)

\`\`\`javascript
// Code block
console.log("Hello, world!");
\`\`\`

> This is a blockquote`);
  
  const [loremType, setLoremType] = useState('paragraphs');
  const [loremCount, setLoremCount] = useState(3);
  const [loremOutput, setLoremOutput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [textOutput, setTextOutput] = useState('');

  const generateQRCode = useCallback(async () => {
    if (!qrText.trim()) {
      toast.error('Please enter text or URL for QR code');
      return;
    }

    try {
      // Simple QR code generation using qr-server.com API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrText)}`;
      setQrDataURL(qrUrl);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  }, [qrText]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const downloadQRCode = () => {
    if (!qrDataURL) return;
    
    const link = document.createElement('a');
    link.href = qrDataURL;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateLoremIpsum = () => {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
      'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ];

    let result = '';
    const count = parseInt(loremCount);

    if (loremType === 'paragraphs') {
      for (let i = 0; i < count; i++) {
        const sentenceCount = Math.floor(Math.random() * 4) + 3;
        let paragraph = '';
        for (let j = 0; j < sentenceCount; j++) {
          const wordsInSentence = Math.floor(Math.random() * 10) + 5;
          let sentence = '';
          for (let k = 0; k < wordsInSentence; k++) {
            sentence += words[Math.floor(Math.random() * words.length)] + ' ';
          }
          sentence = sentence.trim();
          sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
          paragraph += sentence + ' ';
        }
        result += paragraph.trim() + '\n\n';
      }
    } else if (loremType === 'sentences') {
      for (let i = 0; i < count; i++) {
        const wordsInSentence = Math.floor(Math.random() * 12) + 8;
        let sentence = '';
        for (let j = 0; j < wordsInSentence; j++) {
          sentence += words[Math.floor(Math.random() * words.length)] + ' ';
        }
        sentence = sentence.trim();
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '. ';
        result += sentence;
      }
    } else if (loremType === 'words') {
      for (let i = 0; i < count; i++) {
        result += words[Math.floor(Math.random() * words.length)] + ' ';
      }
    }

    setLoremOutput(result.trim());
  };

  const formatText = (formatType) => {
    let text = textInput;
    
    switch (formatType) {
      case 'uppercase':
        text = text.toUpperCase();
        break;
      case 'lowercase':
        text = text.toLowerCase();
        break;
      case 'title':
        text = text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        break;
      case 'camel':
        text = text.toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)?/g, (m, chr) => chr ? chr.toUpperCase() : '')
          .replace(/^./, c => c.toLowerCase());
        break;
      case 'kebab':
        text = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
        break;
      case 'snake':
        text = text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        break;
      default:
        break;
    }
    
    setTextOutput(text);
  };

  const copyToClipboard = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Web Utilities</h1>
            <p className="text-slate-600">Essential tools for web development and content creation</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* QR Code Generator */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <QrCode className="w-5 h-5" />
                QR Code Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qrText">Text or URL</Label>
                  <Input
                    id="qrText"
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    placeholder="Enter text or URL to generate QR code"
                  />
                </div>
                <Button onClick={generateQRCode} className="w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  Regenerate QR Code
                </Button>
              </div>

              {qrDataURL && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <img 
                      src={qrDataURL} 
                      alt="Generated QR Code" 
                      className="border border-slate-200 rounded-lg shadow-md"
                    />
                  </div>
                  <Button onClick={downloadQRCode} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Text Formatter */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Type className="w-5 h-5" />
                Text Formatter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="textInput">Input Text</Label>
                  <Textarea
                    id="textInput"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter your text here to format..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => formatText('uppercase')} variant="outline" size="sm">
                    UPPERCASE
                  </Button>
                  <Button onClick={() => formatText('lowercase')} variant="outline" size="sm">
                    lowercase
                  </Button>
                  <Button onClick={() => formatText('title')} variant="outline" size="sm">
                    Title Case
                  </Button>
                  <Button onClick={() => formatText('camel')} variant="outline" size="sm">
                    camelCase
                  </Button>
                  <Button onClick={() => formatText('kebab')} variant="outline" size="sm">
                    kebab-case
                  </Button>
                  <Button onClick={() => formatText('snake')} variant="outline" size="sm">
                    snake_case
                  </Button>
                </div>
              </div>

              {textOutput && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Formatted Text</Label>
                    <Button
                      onClick={() => copyToClipboard(textOutput)}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-lg border">
                    <code className="text-sm font-mono text-slate-700">
                      {textOutput}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Markdown Live Preview */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <FileText className="w-5 h-5" />
                Markdown Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="markdownText">Markdown Input</Label>
                  <Textarea
                    id="markdownText"
                    value={markdownText}
                    onChange={(e) => setMarkdownText(e.target.value)}
                    rows={15}
                    className="font-mono text-sm h-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>HTML Preview</Label>
                  <div className="bg-slate-50 p-4 rounded-lg border h-full prose prose-sm max-w-none">
                    <ReactMarkdown>{markdownText}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lorem Ipsum Generator */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Hash className="w-5 h-5" />
                Lorem Ipsum Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loremType">Type</Label>
                    <Select value={loremType} onValueChange={setLoremType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paragraphs">Paragraphs</SelectItem>
                        <SelectItem value="sentences">Sentences</SelectItem>
                        <SelectItem value="words">Words</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loremCount">Count</Label>
                    <Input
                      id="loremCount"
                      type="number"
                      min="1"
                      max="50"
                      value={loremCount}
                      onChange={(e) => setLoremCount(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={generateLoremIpsum} className="w-full">
                  <Shuffle className="w-4 h-4 mr-2" />
                  Generate Lorem Ipsum
                </Button>
              </div>

              {loremOutput && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Generated Text</Label>
                    <Button
                      onClick={() => copyToClipboard(loremOutput, 'Lorem ipsum copied!')}
                      size="sm"
                      variant="outline"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-slate-100 p-4 rounded-lg border max-h-64 overflow-auto">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {loremOutput}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}