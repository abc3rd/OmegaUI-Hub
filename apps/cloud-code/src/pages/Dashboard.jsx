import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Code2, 
  Palette, 
  Wrench, 
  Sparkles,
  GitCompareArrows,
  Layers,
  ArrowRight,
  Smartphone,
  Database,
  Computer,
  Server,
  Zap,
  Target,
  Clock
} from 'lucide-react';

const WORKFLOWS = [
  {
    id: 'web-app',
    title: 'Build a Web Application',
    description: 'Create a complete web app from design to deployment',
    icon: Code2,
    color: 'bg-blue-500',
    steps: ['Design & Code', 'Convert to Mobile', 'Setup Backend', 'Deploy'],
    estimatedTime: '30-60 minutes',
    difficulty: 'Beginner',
    tools: ['Code Playground', 'Flutter Generator', 'Backend Architect']
  },
  {
    id: 'mobile-app',
    title: 'Create Mobile Application',
    description: 'Build native mobile apps for iOS and Android',
    icon: Smartphone,
    color: 'bg-green-500',
    steps: ['Design Interface', 'Code Logic', 'Generate Flutter', 'Test & Deploy'],
    estimatedTime: '45-90 minutes',
    difficulty: 'Intermediate',
    tools: ['Design Tools', 'Code Playground', 'Flutter Generator']
  },
  {
    id: 'desktop-app',
    title: 'Build Desktop Application',
    description: 'Create native desktop apps for Windows, Mac, Linux',
    icon: Computer,
    color: 'bg-purple-500',
    steps: ['Define Requirements', 'Generate Code', 'Build Executable'],
    estimatedTime: '20-45 minutes',
    difficulty: 'Beginner',
    tools: ['Desktop App Generator']
  },
  {
    id: 'migrate-backend',
    title: 'Migrate Backend & Database',
    description: 'Move your app from one platform to another seamlessly',
    icon: Database,
    color: 'bg-orange-500',
    steps: ['Analyze Current', 'Choose Target', 'Generate Migration', 'Deploy'],
    estimatedTime: '60-120 minutes',
    difficulty: 'Advanced',
    tools: ['Database Migration', 'Backend Architect']
  },
  {
    id: 'full-stack',
    title: 'Complete Full-Stack Project',
    description: 'Build entire application with frontend, backend, and database',
    icon: Server,
    color: 'bg-indigo-500',
    steps: ['Plan Architecture', 'Build Frontend', 'Create Backend', 'Deploy & Scale'],
    estimatedTime: '90-180 minutes',
    difficulty: 'Advanced',
    tools: ['Backend Architect', 'Code Playground', 'Database Migration']
  },
  {
    id: 'convert-code',
    title: 'Convert & Analyze Code',
    description: 'Translate between languages and analyze websites',
    icon: GitCompareArrows,
    color: 'bg-teal-500',
    steps: ['Upload/Input Code', 'Select Target', 'Convert & Download'],
    estimatedTime: '10-20 minutes',
    difficulty: 'Beginner',
    tools: ['Code Converter', 'Site Explorer']
  }
];

const QUICK_TOOLS = [
  { id: 'design-tools', name: 'Design Tools', icon: Palette, url: '/DesignTools' },
  { id: 'image-editor', name: 'Image Editor', icon: Sparkles, url: '/ImageEditor' },
  { id: 'css-generators', name: 'CSS Generators', icon: Layers, url: '/CSSGenerators' },
  { id: 'web-utilities', name: 'Web Utilities', icon: Wrench, url: '/WebUtilities' }
];

export default function Dashboard() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const startWorkflow = (workflowId) => {
    const workflow = WORKFLOWS.find(w => w.id === workflowId);
    if (!workflow) return;

    // Navigate to the appropriate starting tool based on workflow
    switch (workflowId) {
      case 'web-app':
        window.location.href = createPageUrl('CodePlayground');
        break;
      case 'mobile-app':
        window.location.href = createPageUrl('DesignTools');
        break;
      case 'desktop-app':
        window.location.href = createPageUrl('DesktopAppGenerator');
        break;
      case 'migrate-backend':
        window.location.href = createPageUrl('DatabaseMigration');
        break;
      case 'full-stack':
        window.location.href = createPageUrl('BackendArchitect');
        break;
      case 'convert-code':
        window.location.href = createPageUrl('CodeConverter');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold">DevToolkit</h1>
          </div>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Welcome to your complete development companion. What would you like to accomplish today?
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-200">
            <Target className="w-5 h-5" />
            <span>Choose your goal below and we'll guide you through the entire process</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-8">
        {/* Main Workflows */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Guided Workflows</h2>
            <p className="text-slate-600">Step-by-step processes to accomplish your development goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WORKFLOWS.map((workflow) => (
              <Card 
                key={workflow.id} 
                className={`bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group ${
                  selectedWorkflow === workflow.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 ${workflow.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <workflow.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={getDifficultyColor(workflow.difficulty)}>
                        {workflow.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-slate-900">{workflow.title}</CardTitle>
                  <p className="text-sm text-slate-600">{workflow.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>{workflow.estimatedTime}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-700">Process Steps:</p>
                      <div className="space-y-1">
                        {workflow.steps.map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-xs text-slate-600">
                            <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </div>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-700">Tools Used:</p>
                      <div className="flex flex-wrap gap-1">
                        {workflow.tools.map((tool) => (
                          <Badge key={tool} variant="outline" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      startWorkflow(workflow.id);
                    }}
                    className="w-full group-hover:bg-blue-700 transition-colors duration-200"
                  >
                    Start This Workflow
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Tools Section */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Quick Tools</h3>
            <p className="text-slate-600">Access individual tools for specific tasks</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_TOOLS.map((tool) => (
              <Link key={tool.id} to={tool.url}>
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <tool.icon className="w-8 h-8 mx-auto mb-2 text-slate-600 group-hover:text-blue-600 transition-colors duration-200" />
                    <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
                      {tool.name}
                    </h4>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center py-8">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">New to DevToolkit?</h3>
              <p className="text-slate-600 mb-4">
                Not sure where to start? Try the "Build a Web Application" workflow - it's perfect for beginners 
                and will walk you through creating a complete project from scratch.
              </p>
              <Button 
                onClick={() => startWorkflow('web-app')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Beginner Tutorial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}