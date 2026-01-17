import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Share } from 'lucide-react';

function calculateDiff(left, right) {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const result = [];
  
  let i = 0, j = 0;
  
  while (i < leftLines.length || j < rightLines.length) {
    const leftLine = leftLines[i] || '';
    const rightLine = rightLines[j] || '';
    
    if (i >= leftLines.length) {
      result.push({ type: 'added', leftLine: '', rightLine, leftLineNum: '', rightLineNum: j + 1 });
      j++;
    } else if (j >= rightLines.length) {
      result.push({ type: 'removed', leftLine, rightLine: '', leftLineNum: i + 1, rightLineNum: '' });
      i++;
    } else if (leftLine === rightLine) {
      result.push({ type: 'unchanged', leftLine, rightLine, leftLineNum: i + 1, rightLineNum: j + 1 });
      i++;
      j++;
    } else {
      result.push({ type: 'changed', leftLine, rightLine, leftLineNum: i + 1, rightLineNum: j + 1 });
      i++;
      j++;
    }
  }
  
  return result;
}

export default function DiffViewer({ 
  leftCode, 
  rightCode, 
  leftLanguage, 
  rightLanguage,
  onExport,
  onSaveSession
}) {
  const diff = calculateDiff(leftCode || '', rightCode || '');
  
  const stats = {
    added: diff.filter(line => line.type === 'added').length,
    removed: diff.filter(line => line.type === 'removed').length,
    changed: diff.filter(line => line.type === 'changed').length,
    unchanged: diff.filter(line => line.type === 'unchanged').length
  };

  const getLineStyle = (type) => {
    switch (type) {
      case 'added':
        return 'bg-green-500/10 border-l-4 border-green-500';
      case 'removed':
        return 'bg-red-500/10 border-l-4 border-red-500';
      case 'changed':
        return 'bg-yellow-500/10 border-l-4 border-yellow-500';
      default:
        return 'bg-slate-900/50';
    }
  };

  if (!leftCode && !rightCode) {
    return (
      <Card className="h-full bg-slate-900 border-slate-700 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">No code to compare</p>
          <p className="text-sm">Add code to both editors to see the diff</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900 rounded-t-lg">
        <div className="flex items-center gap-4">
          <h3 className="font-medium text-white">Diff Results</h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
              +{stats.added}
            </Badge>
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500">
              -{stats.removed}
            </Badge>
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
              ~{stats.changed}
            </Badge>
            <Badge variant="outline" className="bg-slate-500/20 text-slate-400 border-slate-500">
              ={stats.unchanged}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveSession}
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <Share className="w-4 h-4 mr-2" />
            Save Session
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-slate-950 rounded-b-lg">
        <div className="grid grid-cols-2 gap-0 h-full">
          <div className="border-r border-slate-700">
            <div className="sticky top-0 bg-slate-800 px-4 py-2 text-sm font-medium text-white border-b border-slate-700">
              Left ({leftLanguage || 'Unknown'})
            </div>
            <div className="font-mono text-sm">
              {diff.map((line, index) => (
                <div key={index} className={`flex ${getLineStyle(line.type)}`}>
                  <div className="w-12 px-2 py-1 text-slate-500 text-right border-r border-slate-700 bg-slate-800/50">
                    {line.leftLineNum}
                  </div>
                  <div className="flex-1 px-3 py-1 text-white whitespace-pre-wrap break-all">
                    {line.leftLine}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="sticky top-0 bg-slate-800 px-4 py-2 text-sm font-medium text-white border-b border-slate-700">
              Right ({rightLanguage || 'Unknown'})
            </div>
            <div className="font-mono text-sm">
              {diff.map((line, index) => (
                <div key={index} className={`flex ${getLineStyle(line.type)}`}>
                  <div className="w-12 px-2 py-1 text-slate-500 text-right border-r border-slate-700 bg-slate-800/50">
                    {line.rightLineNum}
                  </div>
                  <div className="flex-1 px-3 py-1 text-white whitespace-pre-wrap break-all">
                    {line.rightLine}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}