import React, { useState, useEffect } from 'react';
import { testApiEndpoint } from '@/functions/testApiEndpoint';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { ApiIntegration } from "@/entities/ApiIntegration";
import { toast } from "sonner";

export default function ApiTester({ apiToTest, onTestRun }) {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [body, setBody] = useState('{}');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (apiToTest) {
      setUrl(apiToTest.endpoint_url || '');
    }
  }, [apiToTest]);

  const handleTest = async () => {
    setIsLoading(true);
    setResponse(null);
    let parsedHeaders, parsedBody;
    try {
      parsedHeaders = JSON.parse(headers);
    } catch {
      toast.error("Invalid JSON in Headers.");
      setIsLoading(false);
      return;
    }
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        toast.error("Invalid JSON in Body.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const res = await testApiEndpoint({ url, method, headers: parsedHeaders, body: parsedBody });
      setResponse(res.data);
      if (apiToTest) {
        await ApiIntegration.update(apiToTest.id, { 
          status: res.data.status >= 200 && res.data.status < 300 ? 'active' : 'error',
          last_tested: new Date().toISOString(),
          response_time: res.data.responseTime
        });
        toast.success(`Test for ${apiToTest.name} complete.`);
        onTestRun(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      setResponse({
        error: "Client-side error",
        message: error.message
      });
      toast.error("An error occurred while testing the endpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 400 && status < 500) return 'text-yellow-400';
    if (status >= 500) return 'text-red-400';
    return 'text-white';
  };

  return (
    <Card className="bg-gray-900 border-gray-800 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-cyan-400" />
          API Endpoint Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Endpoint URL" value={url} onChange={(e) => setUrl(e.target.value)} className="bg-gray-800 border-gray-700"/>
        </div>
        <div>
          <Label>Headers (JSON)</Label>
          <Textarea value={headers} onChange={(e) => setHeaders(e.target.value)} rows={4} className="bg-gray-800 border-gray-700 font-mono text-sm"/>
        </div>
        {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
          <div>
            <Label>Body (JSON)</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="bg-gray-800 border-gray-700 font-mono text-sm"/>
          </div>
        )}
        <Button onClick={handleTest} disabled={isLoading || !url} className="w-full bg-cyan-600 hover:bg-cyan-700">
          {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Send Request
        </Button>
        {response && (
          <div className="space-y-2 pt-4 border-t border-gray-800">
            <h3 className="font-semibold text-lg">Response</h3>
            <div className="flex items-center gap-4">
              <div className={`font-bold text-lg ${getStatusColor(response.status)}`}>
                Status: {response.status} {response.statusText}
              </div>
              <div className="text-gray-400">Time: {response.responseTime}ms</div>
            </div>
            <div className="bg-gray-950 p-3 rounded-md border border-gray-700 max-h-64 overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(response.body, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}