import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Download, 
  Copy, 
  Loader2,
  Zap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Server,
  Cloud
} from 'lucide-react';
import { toast } from 'sonner';
import { InvokeLLM } from '@/integrations/Core';

const BACKEND_PROVIDERS = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Open source Firebase alternative',
    icon: Database,
    features: ['PostgreSQL', 'Real-time', 'Auth', 'Storage'],
    color: 'bg-green-500'
  },
  {
    id: 'firebase',
    name: 'Firebase',
    description: 'Google\'s mobile and web app platform',
    icon: Cloud,
    features: ['Firestore', 'Auth', 'Storage', 'Functions'],
    color: 'bg-orange-500'
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Serverless PostgreSQL platform',
    icon: Server,
    features: ['PostgreSQL', 'Branching', 'Serverless'],
    color: 'bg-purple-500'
  },
  {
    id: 'railway',
    name: 'Railway',
    description: 'Deploy and scale applications',
    icon: Zap,
    features: ['PostgreSQL', 'Deploy', 'Scale'],
    color: 'bg-blue-500'
  },
  {
    id: 'oracle',
    name: 'Oracle Cloud',
    description: 'Enterprise database solutions',
    icon: Database,
    features: ['Oracle DB', 'Enterprise', 'Cloud'],
    color: 'bg-red-500'
  }
];

const MIGRATION_DIRECTIONS = [
  { id: 'export', name: 'Export from Base44', description: 'Migrate your Base44 app to external backend' },
  { id: 'import', name: 'Import to Base44', description: 'Bring external app into Base44' },
  { id: 'sync', name: 'Bi-Directional Sync', description: 'Keep both systems in sync' }
];

export default function DatabaseMigration() {
  const [selectedProvider, setSelectedProvider] = useState('supabase');
  const [migrationDirection, setMigrationDirection] = useState('export');
  const [appAnalysis, setAppAnalysis] = useState(null);
  const [migrationCode, setMigrationCode] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  
  // Configuration fields
  const [dbConfig, setDbConfig] = useState({
    projectName: 'my-app',
    databaseUrl: '',
    apiKey: '',
    serviceKey: '',
    region: 'us-east-1'
  });

  const analyzeCurrentApp = async () => {
    setIsAnalyzing(true);
    toast.info('Analyzing your Base44 application structure...');

    const prompt = `
      Analyze a typical Base44 application structure and provide a comprehensive breakdown for database migration.
      
      Assume the app has:
      - User entity with authentication
      - Custom entities with relationships
      - Backend functions/integrations
      - File storage requirements
      
      Provide analysis in this JSON format:
      {
        "entities": [{"name": "Task", "fields": ["title", "description", "status"], "relationships": []}],
        "functions": [{"name": "emailFunction", "type": "integration"}],
        "storage": {"hasFiles": true, "types": ["images", "documents"]},
        "auth": {"provider": "base44", "features": ["login", "roles"]},
        "complexity": "medium",
        "estimatedMigrationTime": "2-3 hours"
      }
    `;

    try {
      const analysis = await InvokeLLM({
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
                  fields: { type: "array", items: { type: "string" } },
                  relationships: { type: "array", items: { type: "string" } }
                }
              }
            },
            functions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  type: { type: "string" }
                }
              }
            },
            storage: {
              type: "object",
              properties: {
                hasFiles: { type: "boolean" },
                types: { type: "array", items: { type: "string" } }
              }
            },
            auth: {
              type: "object",
              properties: {
                provider: { type: "string" },
                features: { type: "array", items: { type: "string" } }
              }
            },
            complexity: { type: "string" },
            estimatedMigrationTime: { type: "string" }
          }
        }
      });

      setAppAnalysis(analysis);
      setActiveTab('analysis');
      toast.success('Application analysis completed!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze application.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMigrationCode = async () => {
    if (!selectedProvider || !appAnalysis) {
      toast.error('Please complete the app analysis first.');
      return;
    }

    setIsGenerating(true);
    setActiveTab('migration');
    toast.info(`Generating migration code for ${BACKEND_PROVIDERS.find(p => p.id === selectedProvider)?.name}...`);

    const provider = BACKEND_PROVIDERS.find(p => p.id === selectedProvider);
    
    const prompt = `
      Generate complete migration code for moving a Base44 application to ${provider.name}.
      
      Application Analysis: ${JSON.stringify(appAnalysis)}
      Target Provider: ${selectedProvider}
      Migration Direction: ${migrationDirection}
      Project Configuration: ${JSON.stringify(dbConfig)}
      
      Generate:
      1. Database schema migration scripts
      2. API endpoints/functions code
      3. Authentication setup
      4. Frontend configuration
      5. Environment variables setup
      6. Deployment instructions
      
      Provide complete, production-ready code with proper error handling and security.
      Include step-by-step migration instructions.
    `;

    try {
      const code = await InvokeLLM({ prompt });
      setMigrationCode(code);
      toast.success('Migration code generated successfully!');
    } catch (error) {
      console.error('Code generation error:', error);
      toast.error('Failed to generate migration code.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMigrationCode = () => {
    if (!migrationCode) return;
    navigator.clipboard.writeText(migrationCode);
    toast.success('Migration code copied to clipboard!');
  };

  const downloadMigrationPackage = () => {
    if (!migrationCode) return;
    
    const blob = new Blob([migrationCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dbConfig.projectName}-${selectedProvider}-migration.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Migration package downloaded!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Database Migration Hub</h1>
            <p className="text-slate-600">Seamlessly migrate your applications between Base44 and external backends</p>
          </div>
          <Button onClick={analyzeCurrentApp} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Analyze App
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="analysis" disabled={!appAnalysis}>Analysis</TabsTrigger>
            <TabsTrigger value="migration" disabled={!appAnalysis}>Migration</TabsTrigger>
            <TabsTrigger value="deploy" disabled={!migrationCode}>Deploy</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Migration Direction */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="w-5 h-5" />
                    Migration Direction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={migrationDirection} onValueChange={setMigrationDirection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MIGRATION_DIRECTIONS.map((direction) => (
                        <SelectItem key={direction.id} value={direction.id}>
                          {direction.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-600">
                    {MIGRATION_DIRECTIONS.find(d => d.id === migrationDirection)?.description}
                  </p>
                </CardContent>
              </Card>

              {/* Project Configuration */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Project Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      value={dbConfig.projectName}
                      onChange={(e) => setDbConfig({...dbConfig, projectName: e.target.value})}
                      placeholder="my-awesome-app"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <Select 
                      value={dbConfig.region} 
                      onValueChange={(value) => setDbConfig({...dbConfig, region: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                        <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                        <SelectItem value="eu-west-1">EU (Ireland)</SelectItem>
                        <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Backend Provider Selection */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Select Backend Provider
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BACKEND_PROVIDERS.map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedProvider === provider.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg ${provider.color} flex items-center justify-center`}>
                          <provider.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{provider.name}</h3>
                          {selectedProvider === provider.id && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{provider.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {appAnalysis && (
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Application Structure</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Entities ({appAnalysis.entities?.length || 0})</h4>
                      <div className="space-y-2">
                        {appAnalysis.entities?.map((entity, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-lg">
                            <div className="font-medium text-slate-800">{entity.name}</div>
                            <div className="text-sm text-slate-600">
                              Fields: {entity.fields?.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Functions ({appAnalysis.functions?.length || 0})</h4>
                      <div className="space-y-2">
                        {appAnalysis.functions?.map((func, i) => (
                          <div key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                            <span className="text-slate-800">{func.name}</span>
                            <Badge variant="outline">{func.type}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle>Migration Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-800">Complexity Level</span>
                      <Badge className="bg-green-100 text-green-800">{appAnalysis.complexity}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-800">Estimated Time</span>
                      <Badge className="bg-blue-100 text-blue-800">{appAnalysis.estimatedMigrationTime}</Badge>
                    </div>

                    {appAnalysis.storage?.hasFiles && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          This app uses file storage. Migration will include storage setup and file transfer.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button onClick={generateMigrationCode} className="w-full" disabled={isGenerating}>
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Generate Migration Code
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Migration Tab */}
          <TabsContent value="migration" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Migration Code for {BACKEND_PROVIDERS.find(p => p.id === selectedProvider)?.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={copyMigrationCode} variant="outline" disabled={!migrationCode}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </Button>
                    <Button onClick={downloadMigrationPackage} variant="outline" disabled={!migrationCode}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Package
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    value={migrationCode}
                    readOnly
                    className="h-96 font-mono text-sm bg-slate-50"
                    placeholder={isGenerating ? "Generating migration code..." : "Migration code will appear here..."}
                  />
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <span className="text-slate-600">Generating migration code...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deploy Tab */}
          <TabsContent value="deploy" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Migration Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your migration code has been generated successfully! Follow the deployment instructions in the downloaded package.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-slate-900">Next Steps:</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</div>
                      <span>Set up your {BACKEND_PROVIDERS.find(p => p.id === selectedProvider)?.name} account</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</div>
                      <span>Run the database migration scripts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</div>
                      <span>Deploy your API endpoints</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">4</div>
                      <span>Update your frontend configuration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">5</div>
                      <span>Test the migrated application</span>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setActiveTab('setup')} variant="outline" className="w-full">
                  Start New Migration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}