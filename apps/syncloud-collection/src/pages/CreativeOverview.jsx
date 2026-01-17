
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Palette,
  Video,
  Paintbrush,
  Pipette,
  Type,
  ArrowRight,
  Sparkles,
  Camera,
  Layers
} from 'lucide-react';

export default function CreativeOverview() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <Palette className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Creative Tools</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unleash your creativity with professional design tools, screen recording capabilities, 
            color palette generators, and typography matching. Everything you need for visual excellence.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-pink-100 text-pink-800">Visual Design</Badge>
          <Badge className="bg-purple-100 text-purple-800">Content Creation</Badge>
          <Badge className="bg-blue-100 text-blue-800">Professional Tools</Badge>
        </div>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            What are Creative Tools?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Creative Tools empower you to produce stunning visual content and multimedia projects. Whether you're 
            designing graphics, recording tutorials, building color schemes, or matching typography, these tools 
            provide professional-grade capabilities that help bring your creative vision to life.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Creative Capabilities:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• High-quality screen recording</li>
                <li>• Professional design studio</li>
                <li>• Intelligent color palette creation</li>
                <li>• Typography matching and pairing</li>
                <li>• Multi-format export options</li>
                <li>• Professional templates and assets</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Graphic designers and artists</li>
                <li>• Content creators and influencers</li>
                <li>• Marketing professionals</li>
                <li>• Educators and trainers</li>
                <li>• Web designers and developers</li>
                <li>• Anyone creating visual content</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Creative Applications</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to={createPageUrl('ScreenRecorder')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-red-500" />
                    Screen Recorder
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Capture high-quality screen recordings for tutorials, presentations, and demonstrations. 
                  Perfect for creating educational content and software walkthroughs.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">HD Recording</Badge>
                  <Badge variant="outline">Audio Capture</Badge>
                  <Badge variant="outline">Easy Sharing</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('DesignStudio')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-5 h-5 text-blue-500" />
                    Design Studio
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Professional graphic design tool with layers, effects, and advanced editing capabilities. 
                  Create stunning visuals for marketing, social media, and branding.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Advanced Editor</Badge>
                  <Badge variant="outline">Professional Effects</Badge>
                  <Badge variant="outline">Multi-Layer</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('ColorPalette')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pipette className="w-5 h-5 text-green-500" />
                    Color Palette
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Generate beautiful color palettes for your design projects. Extract colors from images, 
                  create harmonious combinations, and export in various formats.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Color Theory</Badge>
                  <Badge variant="outline">Image Analysis</Badge>
                  <Badge variant="outline">Export Ready</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('FontMatcher')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-purple-500" />
                    Font Matcher
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Identify fonts from images and find perfect typography pairings for your designs. 
                  Discover new fonts and create harmonious text layouts.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Font Recognition</Badge>
                  <Badge variant="outline">Typography Pairing</Badge>
                  <Badge variant="outline">Font Library</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Creative Process */}
      <Card>
        <CardHeader>
          <CardTitle>Creative Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-pink-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Ideate</h4>
              <p className="text-sm text-muted-foreground">Brainstorm concepts and gather inspiration for your creative project</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Design</h4>
              <p className="text-sm text-muted-foreground">Use color palettes and typography to create your visual foundation</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Create</h4>
              <p className="text-sm text-muted-foreground">Build your designs with the design studio and record content</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Share</h4>
              <p className="text-sm text-muted-foreground">Export and distribute your creative work across platforms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creative Applications */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5 text-red-500" />
              Content Creation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Perfect for YouTube creators, educators, and marketers who need to create 
              professional video content and tutorials with high-quality screen recordings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="w-5 h-5 text-blue-500" />
              Brand Design
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Develop cohesive brand identities with carefully chosen color palettes and 
              typography that communicates your brand's personality and values effectively.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Visual Marketing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create eye-catching marketing materials, social media graphics, and promotional 
              content that stands out and drives engagement across all your channels.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Professional Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Achieve professional-quality results without expensive software or extensive training. 
              Our tools are designed for both beginners and experienced creatives.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="w-5 h-5 text-green-500" />
              Integrated Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All creative tools work together seamlessly. Use color palettes in your designs, 
              match fonts for consistency, and record your creative process effortlessly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5 text-blue-500" />
              Content Ready
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Export your creations in the right formats for any platform - from high-resolution 
              prints to web-optimized graphics and shareable video content.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Creative Tools</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Explore Color & Typography</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Start by creating a color palette and finding fonts that match your style. 
                This foundation will guide all your creative projects.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Create Your First Design</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use the design studio to create a simple graphic or try screen recording 
                to capture a tutorial. Experiment with the tools to discover their capabilities.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('ColorPalette')}>Create Color Palette</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('DesignStudio')}>Open Design Studio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
