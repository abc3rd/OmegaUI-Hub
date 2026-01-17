import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Code,
  Globe,
  FileCode,
  Settings,
  Database,
  ArrowRight,
  Zap,
  Layers,
  Terminal
} from 'lucide-react';
import { CodeSnippet } from '@/entities/CodeSnippet';
import { ApiIntegration } from '@/entities/ApiIntegration';

export default function DevelopmentOverview() {
  const [devStats, setDevStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDevStats();
  }, []);

  const loadDevStats = async () => {
    try {
      const [snippets, integrations] = await Promise.all([
        CodeSnippet.list(),
        ApiIntegration.list()
      ]);

      const languages = [...new Set(snippets.map(s => s.language))];
      const activeIntegrations = integrations.length;

      setDevStats({
        totalSnippets: snippets.length,
        totalIntegrations: activeIntegrations,
        programmingLanguages: languages.length,
        recentSnippets: snippets.filter(s => 
          new Date(s.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      });
    } catch (error) {
      console.error('Failed to load development stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex items-center justify-center mx-auto">
          <Code className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Development</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive development tools for building websites, managing code, testing APIs, and importing data. 
            Everything developers need to create, test, and deploy applications efficiently.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-gray-100 text-gray-800">Web Development</Badge>
          <Badge className="bg-blue-100 text-blue-800">API Management</Badge>
          <Badge className="bg-green-100 text-green-800">Code Organization</Badge>
        </div>
      </div>

      {/* Development Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Code Snippets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <FileCode className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{loading ? '...' : devStats.totalSnippets}</div>
                <div className="text-xs text-green-600">+{devStats.recentSnippets} this week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">API Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-green-500" />
              <div className="text-2xl font-bold">{loading ? '...' : devStats.totalIntegrations}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Terminal className="w-8 h-8 text-purple-500" />
              <div className="text-2xl font-bold">{loading ? '...' : devStats.programmingLanguages}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Layers className="w-8 h-8 text-orange-500" />
              <div className="text-2xl font-bold">{loading ? '...' : '3'}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            What is Development?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Development tools provide everything you need for modern web development and application building. 
            From visual website builders to code snippet management, API testing, and data integration tools, 
            this suite supports both technical and non-technical users in creating digital solutions.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Core Tools:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Visual website builder</li>
                <li>• Code snippet library</li>
                <li>• API testing and integration</li>
                <li>• Data import and processing</li>
                <li>• Custom integration builder</li>
                <li>• Development workflow tools</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Web developers and programmers</li>
                <li>• Business owners building websites</li>
                <li>• API integrators and testers</li>
                <li>• Data analysts and processors</li>
                <li>• No-code/low-code developers</li>
                <li>• Development teams</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Development Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to={createPageUrl('WebsiteBuilder')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-500" />
                    Website Builder
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Create professional websites without coding using our visual builder. 
                  Drag-and-drop interface with responsive templates and modern design elements.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Visual Builder</Badge>
                  <Badge variant="outline">Responsive</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('CodeSnippets')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-green-500" />
                    Code Snippets
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Organize and manage your code snippets across multiple languages. 
                  Search, tag, and reuse code blocks to accelerate your development workflow.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Multi-Language</Badge>
                  <Badge variant="outline">Searchable</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('ApiTester')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-purple-500" />
                    API Tester
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Test and debug API endpoints with support for all HTTP methods, headers, 
                  authentication, and request/response inspection tools.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">HTTP Testing</Badge>
                  <Badge variant="outline">Auth Support</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('ApiIntegrations')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-orange-500" />
                    API Integrations
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Create and manage custom API integrations with third-party services. 
                  Configure authentication, endpoints, and automate data flows.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Custom APIs</Badge>
                  <Badge variant="outline">Automation</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('DataImport')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-red-500" />
                    Data Import
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Import large datasets from CSV, Excel, and other formats with intelligent 
                  mapping, validation, and batch processing capabilities.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Batch Processing</Badge>
                  <Badge variant="outline">Smart Mapping</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Development Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Development Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Plan</h4>
              <p className="text-sm text-muted-foreground">Design your application architecture and identify required integrations</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Build</h4>
              <p className="text-sm text-muted-foreground">Use website builder or code snippets to create your application</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Test</h4>
              <p className="text-sm text-muted-foreground">Verify APIs, test integrations, and validate data imports</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Deploy</h4>
              <p className="text-sm text-muted-foreground">Launch your application and monitor performance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-yellow-500" />
              Rapid Development
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Accelerate your development process with visual builders, code snippets, 
              and pre-built integrations that eliminate repetitive tasks.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="w-5 h-5 text-blue-500" />
              Full-Stack Solution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              From frontend website building to backend API integration and data processing, 
              all your development needs are covered in one platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-green-500" />
              Professional Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Enterprise-grade development tools that scale with your needs, from simple websites 
              to complex applications with multiple integrations.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Development</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Build Your First Website</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Start with the website builder to create a professional site without coding. 
                Explore templates and customize to match your brand.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Organize Your Code</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use the code snippets tool to store and organize reusable code blocks. 
                Build your personal development library for faster coding.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('WebsiteBuilder')}>Build Website</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('CodeSnippets')}>Manage Code</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}