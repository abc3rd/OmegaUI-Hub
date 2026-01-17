
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiProxy } from '@/functions/apiProxy';
import { Send, Plus, Trash2, Globe, Clock, FileJson, Server } from 'lucide-react';
import { toast } from 'sonner';
import { ApiIntegration } from '@/entities/ApiIntegration';

const KeyValueEditor = ({ values, setValues, title }) => {
  const addRow = () => setValues([...values, { key: '', value: '' }]);
  const removeRow = (index) => setValues(values.filter((_, i) => i !== index));
  const updateRow = (index, field, value) => {
    const newValues = [...values];
    newValues[index][field] = value;
    setValues(newValues);
  };

  return (
    <div className="space-y-2">
      {values.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Key"
            value={item.key}
            onChange={(e) => updateRow(index, 'key', e.target.value)}
          />
          <Input
            placeholder="Value"
            value={item.value}
            onChange={(e) => updateRow(index, 'value', e.target.value)}
          />
          <Button variant="ghost" size="icon" onClick={() => removeRow(index)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addRow} className="gap-2">
        <Plus className="w-4 h-4" /> Add {title}
      </Button>
    </div>
  );
};

const ResponseViewer = ({ response }) => {
  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Server className="w-16 h-16 mb-4" />
        <p>Your API response will appear here.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 400 && status < 500) return 'text-yellow-500';
    if (status >= 500) return 'text-red-500';
    return 'text-foreground';
  };
  
  let formattedBody = response.body;
  try {
    formattedBody = JSON.stringify(JSON.parse(response.body), null, 2);
  } catch (e) {
    // Not a JSON response, leave as is
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className={`font-bold ${getStatusColor(response.status)}`}>
          Status: {response.status} {response.statusText}
        </div>
        <div><Clock className="inline w-4 h-4 mr-1" />Time: {response.duration}ms</div>
        <div><FileJson className="inline w-4 h-4 mr-1" />Size: {(response.size / 1024).toFixed(2)} KB</div>
      </div>
      <Tabs defaultValue="body">
        <TabsList>
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>
        <TabsContent value="body">
          <pre className="text-xs bg-muted p-4 rounded-md h-96 overflow-auto">
            <code>{formattedBody}</code>
          </pre>
        </TabsContent>
        <TabsContent value="headers">
          <pre className="text-xs bg-muted p-4 rounded-md h-96 overflow-auto">
            <code>{JSON.stringify(response.headers, null, 2)}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default function ApiTester() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [queryParams, setQueryParams] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [body, setBody] = useState('{\n  "key": "value"\n}');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedIntegrations, setSavedIntegrations] = useState([]);

  useEffect(() => {
    const loadIntegrations = async () => {
      const data = await ApiIntegration.list();
      setSavedIntegrations(data);
    };
    loadIntegrations();
  }, []);

  const handleLoadEndpoint = (endpointId) => {
    if (!endpointId) return;
    
    let selectedIntegration, selectedEndpoint;
    for (const integration of savedIntegrations) {
        const endpoint = integration.endpoints.find(ep => ep.id === endpointId);
        if (endpoint) {
            selectedIntegration = integration;
            selectedEndpoint = endpoint;
            break;
        }
    }

    if (selectedIntegration && selectedEndpoint) {
        setUrl(selectedIntegration.base_url + selectedEndpoint.path);
        setMethod(selectedEndpoint.method);
        setQueryParams(selectedEndpoint.params || []); // Ensure params is an array
        setHeaders(selectedEndpoint.headers || []); // Ensure headers is an array
        setBody(selectedEndpoint.body_template || '');
        toast.success(`Loaded "${selectedEndpoint.name}" endpoint.`);
    }
  };
  
  const handleSend = async () => {
    setLoading(true);
    setResponse(null);
    
    try {
      const fullUrl = new URL(url);
      queryParams.forEach(param => {
        if(param.key) fullUrl.searchParams.append(param.key, param.value)
      });
      
      const requestHeaders = headers.reduce((acc, header) => {
        if(header.key) acc[header.key] = header.value;
        return acc;
      }, {});

      const result = await apiProxy({
        url: fullUrl.toString(),
        method,
        headers: requestHeaders,
        body: (method !== 'GET' && method !== 'HEAD') ? body : null
      });

      setResponse(result.data);

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || error.message || "An unknown error occurred.";
      setResponse({
          status: 500,
          statusText: 'Client Error',
          headers: {},
          body: JSON.stringify({ error: errorMsg }, null, 2),
          duration: 0,
          size: 0
      });
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">API Tester</h1>
        </div>
        <div className="w-72">
            <Select onValueChange={handleLoadEndpoint}>
                <SelectTrigger>
                    <SelectValue placeholder="Load a saved endpoint..." />
                </SelectTrigger>
                <SelectContent>
                    {savedIntegrations.map(integration => (
                        <React.Fragment key={integration.id}>
                            <p className="p-2 text-xs font-semibold text-muted-foreground">{integration.name}</p>
                            {integration.endpoints.map(endpoint => (
                                <SelectItem key={endpoint.id} value={endpoint.id}>
                                    <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded mr-2">{endpoint.method}</span>
                                    {endpoint.name}
                                </SelectItem>
                            ))}
                        </React.Fragment>
                    ))}
                </SelectContent>
            </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* URL Input */}
          <div className="flex gap-2">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              placeholder="https://api.example.com/data"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button onClick={handleSend} disabled={loading} className="w-[120px] gap-2">
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"/> : <Send className="w-4 h-4"/>}
              Send
            </Button>
          </div>

          {/* Request Config */}
          <Tabs defaultValue="params">
            <TabsList>
              <TabsTrigger value="params">Query Params</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
            </TabsList>
            <TabsContent value="params" className="p-4">
              <KeyValueEditor values={queryParams} setValues={setQueryParams} title="Param" />
            </TabsContent>
            <TabsContent value="headers" className="p-4">
              <KeyValueEditor values={headers} setValues={setHeaders} title="Header" />
            </TabsContent>
            <TabsContent value="body" className="p-4">
              <Textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="font-mono h-40"
                disabled={method === 'GET' || method === 'HEAD'}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Response</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponseViewer response={response} />
        </CardContent>
      </Card>
    </div>
  );
}
