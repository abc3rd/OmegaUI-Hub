import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload, Copy, Trash2 } from 'lucide-react';

const PROGRAMMING_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'c',
  'html', 'css', 'scss', 'php', 'ruby', 'go', 'rust', 'swift',
  'kotlin', 'scala', 'sql', 'json', 'xml', 'yaml', 'markdown',
  'shell', 'powershell', 'dockerfile', 'jsx', 'tsx', 'vue', 'dart'
];

export default function CodeEditor({ 
  code, 
  onCodeChange, 
  language, 
  onLanguageChange, 
  title, 
  placeholder,
  onClear,
  onUpload 
}) {
  const fileInputRef = React.useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onCodeChange(e.target.result);
        
        // Auto-detect language from file extension
        const extension = file.name.split('.').pop().toLowerCase();
        const langMap = {
          'js': 'javascript', 'ts': 'typescript', 'py': 'python',
          'java': 'java', 'cs': 'csharp', 'cpp': 'cpp', 'c': 'c',
          'html': 'html', 'css': 'css', 'scss': 'scss', 'php': 'php',
          'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'swift': 'swift',
          'kt': 'kotlin', 'scala': 'scala', 'sql': 'sql',
          'json': 'json', 'xml': 'xml', 'yml': 'yaml', 'yaml': 'yaml',
          'md': 'markdown', 'sh': 'shell', 'jsx': 'jsx', 'tsx': 'tsx',
          'vue': 'vue', 'dart': 'dart'
        };
        if (langMap[extension]) {
          onLanguageChange(langMap[extension]);
        }
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h3 className="font-medium text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {PROGRAMMING_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang} className="text-white hover:bg-slate-700">
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            ref={fileInputRef}
            type="file"
            accept=".js,.ts,.py,.java,.cs,.cpp,.c,.html,.css,.php,.rb,.go,.rs,.swift,.kt,.scala,.sql,.json,.xml,.yml,.yaml,.md,.sh,.jsx,.tsx,.vue,.dart"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <Upload className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            disabled={!code}
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={!code}
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4">
        <Textarea
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder={placeholder}
          className="h-full resize-none font-mono text-sm bg-slate-950 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
          style={{ minHeight: '400px' }}
        />
      </div>
      
      <div className="px-4 py-2 border-t border-slate-700 text-xs text-slate-400 flex items-center justify-between">
        <span>{code ? `${code.split('\n').length} lines, ${code.length} characters` : 'Empty'}</span>
        <span>{language ? language.toUpperCase() : 'No language selected'}</span>
      </div>
    </div>
  );
}