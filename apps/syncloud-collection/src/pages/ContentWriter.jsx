
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Wand2, 
  Copy, 
  Share, 
  Download,
  Sparkles,
  Target,
  Users,
  Megaphone
} from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";
import ReactMarkdown from 'react-markdown';
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ContentWriter() {
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState("blog_post");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("general");
  const [keywords, setKeywords] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const contentTypes = {
    blog_post: "Blog Post",
    social_media: "Social Media Post", 
    email_campaign: "Email Campaign",
    product_description: "Product Description",
    press_release: "Press Release",
    website_copy: "Website Copy",
    ad_copy: "Advertisement Copy",
    newsletter: "Newsletter"
  };

  const tones = {
    professional: "Professional",
    casual: "Casual",
    friendly: "Friendly",
    authoritative: "Authoritative",
    conversational: "Conversational",
    persuasive: "Persuasive",
    informative: "Informative"
  };

  const audiences = {
    general: "General Audience",
    business: "Business Professionals",
    consumers: "Consumers",
    technical: "Technical Audience",
    students: "Students",
    investors: "Investors",
    media: "Media/Press"
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await InvokeLLM({
        prompt: `You are a professional content writer. Create ${contentTypes[contentType].toLowerCase()} content based on the following requirements:

Topic/Prompt: ${prompt}
Tone: ${tones[tone]}
Target Audience: ${audiences[audience]}
${keywords ? `Keywords to include: ${keywords}` : ''}

Requirements:
- Write engaging, high-quality content
- Match the specified tone and audience
- Include relevant keywords naturally
- Make it actionable and valuable
- Format appropriately for the content type
${contentType === 'social_media' ? '- Keep it concise and engaging for social platforms' : ''}
${contentType === 'email_campaign' ? '- Include compelling subject line and call-to-action' : ''}
${contentType === 'ad_copy' ? '- Focus on benefits and include strong call-to-action' : ''}

Please provide the complete content:`,
        add_context_from_internet: true
      });

      setGeneratedContent(response);
    } catch (error) {
      console.error("Error generating content:", error);
      setGeneratedContent("Sorry, there was an error generating your content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
  };

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contentType}_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-6 w-full">
      {/* Header */}
      <div className="mb-6 w-full">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              AI Content Writer
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate high-quality content for your marketing needs
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
          <Badge variant="outline">
            SEO Optimized
          </Badge>
          <Badge variant="outline">
            Multi-Format
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 w-full">
        {/* Content Generation Form */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(contentTypes).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tone">Tone & Style</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tones).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(audiences).map(([key, value]) => (
                      <SelectItem key={key} value={key}>{value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="keywords">Keywords (optional)</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="SEO, marketing, growth..."
                />
              </div>

              <div>
                <Label htmlFor="prompt">Content Brief</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to write about..."
                  className="h-32"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Write a blog post about digital marketing trends",
                "Create a product launch announcement",
                "Generate social media content for brand awareness",
                "Write an email campaign for customer retention"
              ].map((template, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="w-full text-left justify-start h-auto p-2 text-xs"
                  onClick={() => setPrompt(template)}
                >
                  {template}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Generated Content */}
        <div className="lg:col-span-3">
          <Card className="h-full w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Generated Content
                </CardTitle>
                {generatedContent && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadContent}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="h-[600px] flex flex-col">
              {generatedContent ? (
                <div className="flex-1 overflow-auto prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{generatedContent}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="max-w-md">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Ready to create amazing content?
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Fill out the content brief and click "Generate Content" to get started with AI-powered writing.
                    </p>
                    <div className="flex justify-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        SEO Optimized
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Audience Focused
                      </div>
                      <div className="flex items-center gap-2">
                        <Megaphone className="w-4 h-4" />
                        Brand Voice
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
