import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  PenTool,
  FileText,
  Palette,
  Image,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Globe
} from 'lucide-react';

export default function ContentOverview() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
          <PenTool className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">Content Creation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create professional content that engages your audience with AI-powered writing tools, 
            stunning visual design, and social media management - all in one integrated suite.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">AI-Powered</Badge>
          <Badge className="bg-pink-100 text-pink-800">Professional Quality</Badge>
          <Badge className="bg-blue-100 text-blue-800">Multi-Platform</Badge>
        </div>
      </div>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            What is Content Creation?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Content Creation empowers you to produce high-quality, engaging content across all your marketing channels. 
            From AI-generated copy that converts to professional logos that brand your business, these tools provide 
            everything you need to create content that stands out and drives results.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Content Types:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Blog posts and articles</li>
                <li>• Social media content</li>
                <li>• Email campaigns and newsletters</li>
                <li>• Product descriptions</li>
                <li>• Marketing copy and ads</li>
                <li>• Professional logos and branding</li>
                <li>• Website copy and landing pages</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Marketing professionals</li>
                <li>• Small business owners</li>
                <li>• Content creators and bloggers</li>
                <li>• Social media managers</li>
                <li>• Freelancers and consultants</li>
                <li>• Startups building their brand</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Content Creation Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to={createPageUrl('ContentWriter')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    AI Content Writer
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Generate high-quality marketing copy, blog posts, product descriptions, and more with AI. 
                  Choose your tone, audience, and format for perfectly tailored content.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">AI Writing</Badge>
                  <Badge variant="outline">SEO Optimized</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('LogoGenerator')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Logo Generator
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Create professional logos and graphics with AI. Generate multiple design variations, 
                  export in various formats, and build your brand identity.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">AI Design</Badge>
                  <Badge variant="outline">Multi-Format</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('LogoMaker')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-green-500" />
                    Logo Maker
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Design custom logos with an interactive editor. Add text, shapes, and icons 
                  to create unique branding that represents your business perfectly.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Interactive Design</Badge>
                  <Badge variant="outline">Custom Creation</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('SocialPosts')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-500" />
                    Social Media Posts
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Create, schedule, and manage social media content across multiple platforms. 
                  Plan your content calendar and maintain consistent online presence.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Multi-Platform</Badge>
                  <Badge variant="outline">Scheduling</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('RedditIntegration')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-500" />
                    Reddit Manager
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Manage your Reddit presence, post to relevant subreddits, monitor mentions, 
                  and engage with communities that matter to your business.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Community Engagement</Badge>
                  <Badge variant="outline">Content Distribution</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Content Creation Process */}
      <Card>
        <CardHeader>
          <CardTitle>Content Creation Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h4 className="font-medium mb-2">Plan</h4>
              <p className="text-sm text-muted-foreground">Define your content goals, target audience, and key messages</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <h4 className="font-medium mb-2">Create</h4>
              <p className="text-sm text-muted-foreground">Use AI tools to generate high-quality written and visual content</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <h4 className="font-medium mb-2">Optimize</h4>
              <p className="text-sm text-muted-foreground">Refine content for SEO, platform requirements, and audience preferences</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 font-bold">4</span>
              </div>
              <h4 className="font-medium mb-2">Distribute</h4>
              <p className="text-sm text-muted-foreground">Publish and schedule across your marketing channels and platforms</p>
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
              Speed & Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create professional content in minutes instead of hours. AI-powered tools accelerate your 
              content production while maintaining high quality and consistency.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-green-500" />
              Audience Targeting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tailor your content for specific audiences, platforms, and goals. Choose the right tone, 
              style, and messaging to maximize engagement and conversions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Professional Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Produce content that looks and reads professionally, regardless of your design or writing 
              experience. AI ensures consistency and quality across all your materials.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with Content Creation</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Start with AI Content Writer</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Begin by creating written content like blog posts, social media captions, or marketing copy. 
                Experiment with different tones and styles to find your voice.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Create Visual Brand Assets</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use the logo generator to create professional branding materials. Having consistent visual 
                identity will enhance all your other content efforts.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('ContentWriter')}>Start Writing with AI</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('LogoGenerator')}>Create Logo</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}