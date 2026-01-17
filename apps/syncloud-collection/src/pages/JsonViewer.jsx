import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Copy, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FileJson,
  ChevronRight,
  ChevronDown,
  Braces
} from 'lucide-react';

const JsonTreeNode = ({ data, level = 0, name = '' }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  
  const getDataType = (value) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const getValueColor = (type) => {
    const colors = {
      string: 'text-green-600',
      number: 'text-blue-600',
      boolean: 'text-purple-600',
      null: 'text-gray-500',
      array: 'text-orange-600',
      object: 'text-indigo-600'
    };
    return colors[type] || 'text-gray-900';
  };

  if (typeof data !== 'object' || data === null) {
    const type = getDataType(data);
    const displayValue = type === 'string' ? `"${data}"` : String(data);
    
    return (
      <div className={`ml-${level * 4} flex items-center gap-2`}>
        {name && <span className="text-blue-800 font-medium">{name}:</span>}
        <span className={getValueColor(type)}>{displayValue}</span>
        <Badge variant="outline" className="text-xs">{type}</Badge>
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const entries = isArray ? data.map((item, index) => [index, item]) : Object.entries(data);
  const itemCount = entries.length;

  return (
    <div className={`ml-${level * 4}`}>
      <div 
        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 
          <ChevronDown className="w-4 h-4 text-gray-500" /> : 
          <ChevronRight className="w-4 h-4 text-gray-500" />
        }
        {name && <span className="text-blue-800 font-medium">{name}:</span>}
        <span className={getValueColor(isArray ? 'array' : 'object')}>
          {isArray ? '[' : '{'}
        </span>
        <Badge variant="outline" className="text-xs">
          {itemCount} {isArray ? 'items' : 'properties'}
        </Badge>
        {!isExpanded && (
          <span className="text-gray-400">
            ...{isArray ? ']' : '}'}
          </span>
        )}
      </div>
      
      {isExpanded && (
        <div className="ml-4 border-l border-gray-200 pl-2">
          {entries.map(([key, value]) => (
            <JsonTreeNode 
              key={key} 
              data={value} 
              level={level + 1} 
              name={isArray ? `[${key}]` : key}
            />
          ))}
          <div className={`ml-${level * 4} text-gray-500`}>
            {isArray ? ']' : '}'}
          </div>
        </div>
      )}
    </div>
  );
};

export default function JsonViewer() {
  const [rawJson, setRawJson] = useState('');
  const [parsedJson, setParsedJson] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ size: 0, keys: 0, depth: 0 });

  const calculateStats = (obj, currentDepth = 0) => {
    if (typeof obj !== 'object' || obj === null) {
      return { keys: 0, depth: currentDepth };
    }

    let totalKeys = 0;
    let maxDepth = currentDepth;

    if (Array.isArray(obj)) {
      totalKeys = obj.length;
      obj.forEach(item => {
        const childStats = calculateStats(item, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childStats.depth);
      });
    } else {
      const keys = Object.keys(obj);
      totalKeys = keys.length;
      keys.forEach(key => {
        const childStats = calculateStats(obj[key], currentDepth + 1);
        totalKeys += childStats.keys;
        maxDepth = Math.max(maxDepth, childStats.depth);
      });
    }

    return { keys: totalKeys, depth: maxDepth };
  };

  const validateAndParseJson = (jsonString) => {
    if (!jsonString.trim()) {
      setParsedJson(null);
      setIsValid(null);
      setError('');
      setStats({ size: 0, keys: 0, depth: 0 });
      return;
    }

    try {
      const parsed = JSON.parse(jsonString);
      setParsedJson(parsed);
      setIsValid(true);
      setError('');
      
      const calculatedStats = calculateStats(parsed);
      setStats({
        size: new Blob([jsonString]).size,
        keys: calculatedStats.keys,
        depth: calculatedStats.depth
      });
    } catch (err) {
      setParsedJson(null);
      setIsValid(false);
      setError(err.message);
      setStats({ size: new Blob([jsonString]).size, keys: 0, depth: 0 });
    }
  };

  const handleJsonChange = (value) => {
    setRawJson(value);
    validateAndParseJson(value);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setRawJson(content);
        validateAndParseJson(content);
      };
      reader.readAsText(file);
    }
  };

  const formatJson = () => {
    if (parsedJson) {
      const formatted = JSON.stringify(parsedJson, null, 2);
      setRawJson(formatted);
    }
  };

  const minifyJson = () => {
    if (parsedJson) {
      const minified = JSON.stringify(parsedJson);
      setRawJson(minified);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(rawJson);
  };

  const downloadJson = () => {
    const blob = new Blob([rawJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleJson = () => {
    const sample = {
      "name": "John Doe",
      "age": 30,
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zipCode": "10001",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        }
      },
      "hobbies": ["reading", "swimming", "coding"],
      "isActive": true,
      "balance": 1250.75,
      "friends": [
        { "name": "Alice", "age": 28 },
        { "name": "Bob", "age": 32 }
      ]
    };
    const sampleString = JSON.stringify(sample, null, 2);
    setRawJson(sampleString);
    validateAndParseJson(sampleString);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <FileJson className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              JSON Viewer & Validator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              View, validate, and analyze JSON data with syntax highlighting
            </p>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="flex gap-2 mb-4">
          {isValid === true && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Valid JSON
            </Badge>
          )}
          {isValid === false && (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Invalid JSON
            </Badge>
          )}
          <Badge variant="outline">
            <Braces className="w-3 h-3 mr-1" />
            Interactive Viewer
          </Badge>
        </div>

        {/* Stats */}
        {parsedJson && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="p-3">
              <div className="text-sm text-gray-600">Size</div>
              <div className="text-lg font-semibold">{stats.size} bytes</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-gray-600">Keys</div>
              <div className="text-lg font-semibold">{stats.keys}</div>
            </Card>
            <Card className="p-3">
              <div className="text-sm text-gray-600">Depth</div>
              <div className="text-lg font-semibold">{stats.depth}</div>
            </Card>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={loadSampleJson} variant="outline" size="sm">
            Load Sample
          </Button>
          <Button onClick={formatJson} disabled={!parsedJson} size="sm">
            Format
          </Button>
          <Button onClick={minifyJson} disabled={!parsedJson} size="sm">
            Minify
          </Button>
          <Button onClick={copyToClipboard} disabled={!rawJson} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button onClick={downloadJson} disabled={!rawJson} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <label className="inline-flex">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload JSON
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>JSON Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={rawJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="Paste your JSON here or upload a file..."
              className="h-96 font-mono text-sm"
            />
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tree" className="h-96">
              <TabsList className="mb-4">
                <TabsTrigger value="tree">Tree View</TabsTrigger>
                <TabsTrigger value="formatted">Formatted</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tree" className="h-80 overflow-auto border rounded p-4">
                {parsedJson ? (
                  <JsonTreeNode data={parsedJson} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {isValid === false ? (
                      <div className="text-center">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-red-400" />
                        <p>Invalid JSON - fix errors to view tree</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FileJson className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Enter valid JSON to see tree visualization</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="formatted" className="h-80 overflow-auto">
                <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded text-sm font-mono whitespace-pre-wrap">
                  {parsedJson ? JSON.stringify(parsedJson, null, 2) : 'No valid JSON to display'}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}