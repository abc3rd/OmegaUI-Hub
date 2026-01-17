import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Server,
  Database,
  GitBranch,
  Cloud,
  Shield,
  Zap,
  CheckCircle,
  Loader2,
  FileCode,
  Copy,
  ArrowRight,
  Settings,
  Users,
  Gauge,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { InvokeLLM } from '@/integrations/Core';

const HOSTING_PLATFORMS = [
  { id: 'supabase', name: 'Supabase', icon: Database, color: 'bg-green-500' },
  { id: 'neon', name: 'Neon', icon: Zap, color: 'bg-purple-500' },
  { id: 'railway', name: 'Railway', icon: Server, color: 'bg-blue-500' },
  { id: 'firebase', name: 'Firebase', icon: Cloud, color: 'bg-orange-500' },
  { id: 'vercel', name: 'Vercel', icon: Globe, color: 'bg-black' }
];

const FEATURES = [
  { id: 'auth', name: 'Authentication', icon: Users, description: 'User login/registration system' },
  { id: 'security', name: 'Security', icon: Shield, description: 'Role-based access control' },
  { id: 'api', name: 'REST API', icon: Server, description: 'Full CRUD API endpoints' },
  { id: 'realtime', name: 'Real-time', icon: Zap, description: 'Live data synchronization' },
  { id: 'storage', name: 'File Storage', icon: FileCode, description: 'File upload/management' },
  { id: 'analytics', name: 'Analytics', icon: Gauge, description: 'Usage tracking and metrics' }
];

export default function BackendArchitect() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Project Configuration
  const [projectName, setProjectName] = useState('my-fullstack-app');
  const [description, setDescription] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('supabase');
  const [selectedFeatures, setSelectedFeatures] = useState(['auth', 'api']);
  
  // Database Configuration
  const [entities, setEntities] = useState([]);
  const [customSchema, setCustomSchema] = useState('');
  
  // Migration Source
  const [migrationSource, setMigrationSource] = useState('new');
  const [sourceCode, setSourceCode] = useState('');
  
  // Generated Output
  const [generatedProject, setGeneratedProject] = useState(null);
  
  // Interview Questions State
  const [answers, setAnswers] = useState({
    appType: '',
    userCount: '',
    dataTypes: [],
    features: [],
    integrations: []
  });

  const toggleFeature = (featureId) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const analyzeCodeForEntities = async () => {
    if (!sourceCode.trim()) {
      toast.error('Please provide source code to analyze.');
      return;
    }

    setIsProcessing(true);
    toast.info('Analyzing your code structure...');

    const prompt = `
Analyze the following code and extract database entities/models that would be needed.

Code to analyze:
${sourceCode}

Please identify:
1. Data models/entities that need database tables
2. Relationships between entities
3. Required fields for each entity
4. Suggested data types

Return a JSON array of entities in this format:
[
  {
    "name": "User",
    "fields": [
      {"name": "id", "type": "uuid", "primary": true},
      {"name": "email", "type": "string", "unique": true},
      {"name": "name", "type": "string"}
    ],
    "relationships": [
      {"type": "hasMany", "entity": "Post"}
    ]
  }
]
`;

    try {
      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  fields: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        type: { type: "string" },
                        primary: { type: "boolean" },
                        unique: { type: "boolean" },
                        required: { type: "boolean" }
                      }
                    }
                  },
                  relationships: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        entity: { type: "string" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (result.entities && Array.isArray(result.entities)) {
        setEntities(result.entities);
        toast.success(`Found ${result.entities.length} entities in your code!`);
      } else {
        throw new Error('No entities found');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze code. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateFullProject = async () => {
    setIsProcessing(true);
    toast.info('Generating your complete full-stack project...');

    const platform = HOSTING_PLATFORMS.find(p => p.id === selectedPlatform);
    const features = selectedFeatures.map(fId => FEATURES.find(f => f.id === fId)?.name).join(', ');

    const prompt = `
You are a senior full-stack architect. Generate a complete, production-ready project structure.

Project Details:
- Name: ${projectName}
- Description: ${description}
- Platform: ${platform.name}
- Features: ${features}
- Entities: ${JSON.stringify(entities)}

Generate:
1. Database schema (PostgreSQL)
2. API endpoints with authentication
3. Frontend React components
4. Deployment configuration
5. GitHub Actions CI/CD pipeline
6. Environment setup
7. Migration scripts
8. Security configurations

Return as JSON with file paths as keys and file contents as values:
{
  "database/schema.sql": "-- Database schema here",
  "api/routes/auth.js": "// Authentication routes",
  "frontend/src/App.js": "// React app component",
  "package.json": "{ project config }",
  ".github/workflows/deploy.yml": "# CI/CD pipeline",
  "README.md": "# Setup instructions"
}

Make it production-ready with proper error handling, security, and scalability.
`;

    try {
      const result = await InvokeLLM({
        prompt,
        response_json_schema: { type: "object" }
      });

      if (typeof result === 'object' && Object.keys(result).length > 0) {
        setGeneratedProject(result);
        setCurrentStep(4);
        toast.success('Complete project generated successfully!');
      } else {
        throw new Error('No project files generated');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate project. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyAllFiles = () => {
    if (!generatedProject) return;
    
    const allContent = Object.entries(generatedProject)
      .map(([path, content]) => `// File: ${path}\n${content}`)
      .join('\n\n' + '='.repeat(50) + '\n\n');
    
    navigator.clipboard.writeText(allContent);
    toast.success('All project files copied to clipboard!');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Project Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="my-awesome-app"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform">Hosting Platform</Label>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {HOSTING_PLATFORMS.map((platform) => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your application..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Features & Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FEATURES.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={feature.id}
                        checked={selectedFeatures.includes(feature.id)}
                        onCheckedChange={() => toggleFeature(feature.id)}
                      />
                      <div className="flex items-center gap-2">
                        <feature.icon className="w-4 h-4 text-slate-600" />
                        <div>
                          <Label htmlFor={feature.id} className="font-medium">
                            {feature.name}
                          </Label>
                          <p className="text-xs text-slate-500">{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep(2)} className="bg-blue-600 hover:bg-blue-700">
                Next: Database Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database & Migration Setup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={migrationSource} onValueChange={setMigrationSource}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="new">New Database</TabsTrigger>
                    <TabsTrigger value="analyze">Analyze Code</TabsTrigger>
                    <TabsTrigger value="migrate">Migrate from Base44</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="new" className="space-y-4">
                    <Label>Custom Database Schema</Label>
                    <Textarea
                      value={customSchema}
                      onChange={(e) => setCustomSchema(e.target.value)}
                      placeholder="CREATE TABLE users (id UUID PRIMARY KEY, email TEXT UNIQUE...);"
                      className="h-32 font-mono text-sm"
                    />
                  </TabsContent>
                  
                  <TabsContent value="analyze" className="space-y-4">
                    <Label>Source Code to Analyze</Label>
                    <Textarea
                      value={sourceCode}
                      onChange={(e) => setSourceCode(e.target.value)}
                      placeholder="Paste your existing code here to analyze database needs..."
                      className="h-32 font-mono text-sm"
                    />
                    <Button onClick={analyzeCodeForEntities} disabled={isProcessing}>
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="w-4 h-4 mr-2" />
                      )}
                      Analyze Code Structure
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="migrate" className="space-y-4">
                    <Alert>
                      <Database className="h-4 w-4" />
                      <AlertDescription>
                        This will analyze your Base44 entities and create migration scripts.
                      </AlertDescription>
                    </Alert>
                    <Button onClick={analyzeCodeForEntities} disabled={isProcessing}>
                      <Database className="w-4 h-4 mr-2" />
                      Analyze Base44 Entities
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {entities.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>Detected Entities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {entities.map((entity, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-slate-900">{entity.name}</h4>
                        <div className="mt-2 space-y-1">
                          {entity.fields?.map((field, fIndex) => (
                            <div key={fIndex} className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="font-mono">{field.name}</span>
                              <Badge variant="outline">{field.type}</Badge>
                              {field.primary && <Badge className="bg-blue-100 text-blue-800">Primary</Badge>}
                              {field.unique && <Badge className="bg-green-100 text-green-800">Unique</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button onClick={() => setCurrentStep(3)} className="bg-blue-600 hover:bg-blue-700">
                Next: Review & Generate
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Review Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Project Details</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Name:</strong> {projectName}</div>
                      <div><strong>Platform:</strong> {HOSTING_PLATFORMS.find(p => p.id === selectedPlatform)?.name}</div>
                      <div><strong>Entities:</strong> {entities.length}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Selected Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedFeatures.map(fId => {
                        const feature = FEATURES.find(f => f.id === fId);
                        return (
                          <Badge key={fId} className="bg-blue-100 text-blue-800">
                            {feature?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button onClick={generateFullProject} disabled={isProcessing} size="lg">
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Generate Complete Project
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Project Generated Successfully!
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={copyAllFiles} variant="outline">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy All Files
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Alert className="border-green-200 bg-green-50 mb-6">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your complete full-stack project has been generated with {Object.keys(generatedProject || {}).length} files!
                  </AlertDescription>
                </Alert>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {generatedProject && Object.entries(generatedProject).map(([path, content]) => (
                    <div key={path} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-semibold">{path}</span>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(content);
                            toast.success(`${path} copied!`);
                          }}
                          size="sm"
                          variant="ghost"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="bg-slate-50 rounded p-2 max-h-32 overflow-auto">
                        <pre className="text-xs font-mono text-slate-700">
                          {typeof content === 'string' ? content.substring(0, 200) + '...' : JSON.stringify(content, null, 2).substring(0, 200) + '...'}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <p><strong>1. Create GitHub Repository:</strong> Create a new repository and push your generated code</p>
                  <p><strong>2. Set Environment Variables:</strong> Configure your database and API keys in your hosting platform</p>
                  <p><strong>3. Deploy:</strong> Your CI/CD pipeline will automatically deploy when you push to main branch</p>
                  <p><strong>4. Configure Domain:</strong> Set up your custom domain in your hosting platform</p>
                </div>
                
                <Alert className="mt-4">
                  <Cloud className="h-4 w-4" />
                  <AlertDescription>
                    The generated project includes automatic deployment to {HOSTING_PLATFORMS.find(p => p.id === selectedPlatform)?.name} with GitHub Actions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button onClick={() => {
                setCurrentStep(1);
                setGeneratedProject(null);
                setEntities([]);
              }}>
                Start New Project
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Backend Architect</h1>
            <p className="text-slate-600">AI-powered full-stack project generator with auto-deployment</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep
                    ? 'bg-blue-600 text-white'
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step < currentStep ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
            ))}
          </div>
        </div>

        {renderStep()}
      </div>
    </div>
  );
}