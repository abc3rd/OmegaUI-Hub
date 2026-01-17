import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Terminal, Send, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const ResultDisplay = ({ result }) => {
  if (!result) return null;
  
  const { test_type, target, success } = result;
  
  let output;
  if (result.raw_output) {
      output = result.raw_output;
  } else {
      output = JSON.stringify(result, null, 2);
  }

  return (
    <div className="mt-4">
      <h3 className="font-semibold text-white mb-2">Result:</h3>
      <div className="bg-black rounded-lg p-4 font-mono text-sm border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <span className={success ? 'text-green-400' : 'text-red-400'}>
            {success ? 'SUCCESS' : 'FAILED'}
          </span>
          <span className="text-gray-500">
            {`> ${test_type} ${target}`}
          </span>
        </div>
        <ScrollArea className="h-60">
          <pre className="whitespace-pre-wrap text-gray-300">{output}</pre>
        </ScrollArea>
      </div>
    </div>
  );
};

export default function NetworkTester({ onRunTest, isTesting, result }) {
  const [testType, setTestType] = useState('ping');
  const [target, setTarget] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!target.trim()) return;
    onRunTest({ test_type: testType, target });
  };

  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          Run Network Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="ping">Ping</SelectItem>
                <SelectItem value="dns_lookup">DNS Lookup</SelectItem>
                <SelectItem value="port_scan">Port Scan</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="e.g., google.com or 8.8.8.8"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <Button type="submit" disabled={isTesting || !target.trim()} className="w-full bg-cyan-600 hover:bg-cyan-700">
            {isTesting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Run Test
          </Button>
        </form>
        <ResultDisplay result={result} />
      </CardContent>
    </Card>
  );
}