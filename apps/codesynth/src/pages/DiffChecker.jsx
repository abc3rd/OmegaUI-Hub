import React, { useState } from 'react';
import { DiffSession } from "@/entities/DiffSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeftRight, Play, RotateCcw } from 'lucide-react';
import { toast } from "sonner";

import CodeEditor from "../components/diff/CodeEditor";
import DiffViewer from "../components/diff/DiffViewer";

export default function DiffChecker() {
  const [leftCode, setLeftCode] = useState('');
  const [rightCode, setRightCode] = useState('');
  const [leftLanguage, setLeftLanguage] = useState('javascript');
  const [rightLanguage, setRightLanguage] = useState('javascript');
  const [showDiff, setShowDiff] = useState(false);
  const [sessionName, setSessionName] = useState('');

  const handleCompare = () => {
    if (!leftCode && !rightCode) {
      toast.error('Please add code to at least one editor');
      return;
    }
    setShowDiff(true);
  };

  const handleReset = () => {
    setLeftCode('');
    setRightCode('');
    setShowDiff(false);
    setSessionName('');
  };

  const handleSwapCodes = () => {
    const tempCode = leftCode;
    const tempLang = leftLanguage;
    setLeftCode(rightCode);
    setLeftLanguage(rightLanguage);
    setRightCode(tempCode);
    setRightLanguage(tempLang);
  };

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    try {
      await DiffSession.create({
        name: sessionName,
        left_code: leftCode,
        right_code: rightCode,
        left_language: leftLanguage,
        right_language: rightLanguage,
        tags: ['diff']
      });
      toast.success('Session saved successfully');
    } catch (error) {
      toast.error('Failed to save session');
    }
  };

  const handleExport = () => {
    const diffData = {
      timestamp: new Date().toISOString(),
      left_language: leftLanguage,
      right_language: rightLanguage,
      left_code: leftCode,
      right_code: rightCode
    };
    
    const blob = new Blob([JSON.stringify(diffData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diff-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Code Diff Checker</h1>
          <p className="text-slate-400 mt-1">Compare code snippets side by side with intelligent diff highlighting</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Session name (optional)"
            className="w-48 bg-slate-900 border-slate-700 text-white"
          />
          <Button
            onClick={handleSwapCodes}
            variant="outline"
            className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleCompare}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Compare
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="bg-slate-900 border-slate-700 text-white hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {showDiff ? (
          <div className="h-full p-6">
            <DiffViewer
              leftCode={leftCode}
              rightCode={rightCode}
              leftLanguage={leftLanguage}
              rightLanguage={rightLanguage}
              onExport={handleExport}
              onSaveSession={handleSaveSession}
            />
          </div>
        ) : (
          <div className="h-full grid grid-cols-2 gap-6 p-6">
            <CodeEditor
              code={leftCode}
              onCodeChange={setLeftCode}
              language={leftLanguage}
              onLanguageChange={setLeftLanguage}
              title="Left Code"
              placeholder="Paste your first code snippet here..."
              onClear={() => setLeftCode('')}
            />
            <CodeEditor
              code={rightCode}
              onCodeChange={setRightCode}
              language={rightLanguage}
              onLanguageChange={setRightLanguage}
              title="Right Code"
              placeholder="Paste your second code snippet here..."
              onClear={() => setRightCode('')}
            />
          </div>
        )}
      </div>
    </div>
  );
}