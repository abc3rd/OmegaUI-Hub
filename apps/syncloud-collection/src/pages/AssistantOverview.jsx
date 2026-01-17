import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Bot,
  MessageSquare,
  Workflow,
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Settings
} from 'lucide-react';

const GLYTCH_ICON_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bdbae61875d59c7d61ef06/42f53f231_splash_with_glytch.png";

export default function AssistantOverview() {
  const [synergyScore, setSynergyScore] = useState(0);

  useEffect(() => {
    // Load saved conversation data
    const savedConversation = localStorage.getItem('glytch_last_conversation');
    if (savedConversation) {
      try {
        const messages = JSON.parse(savedConversation);
        // Calculate basic synergy score
        const score = Math.min(100, Math.max(0, messages.length * 10 + 30));
        setSynergyScore(score);
      } catch (e) {
        setSynergyScore(0);
      }
    }
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
          <img src={GLYTCH_ICON_URL} alt="GLYTCH" className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">GLYTCH Assistant</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent AI companion that understands your workflow, automates tasks, and helps you achieve maximum productivity through seamless tool integration.
          </p>
        </div>
        <div className="flex justify-center gap-2">
          <Badge className="bg-purple-100 text-purple-800">AI-Powered</Badge>
          <Badge className="bg-pink-100 text-pink-800">Smart Automation</Badge>
          <Badge className="bg-blue-100 text-blue-800">Context Aware</Badge>
        </div>
      </div>

      {/* AI Synergy Status */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Current AI Synergy Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">{synergyScore}%</div>
              <p className="text-sm text-muted-foreground">
                {synergyScore < 35 ? 'Getting Started' : 
                 synergyScore < 70 ? 'Building Momentum' : 'High Synergy Achieved'}
              </p>
            </div>
            <div className="text-right">
              <Button asChild>
                <Link to={createPageUrl('Assistant')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat with GLYTCH
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            What is GLYTCH Assistant?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            GLYTCH is not just another chatbot - it's your intelligent business partner that understands your unique workflow, 
            remembers your preferences, and actively helps you accomplish tasks across all your tools and systems. GLYTCH learns 
            from your interactions to provide increasingly personalized and effective assistance.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Core Capabilities:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Natural language task automation</li>
                <li>• Cross-tool workflow orchestration</li>
                <li>• Intelligent context awareness</li>
                <li>• Personalized recommendations</li>
                <li>• Learning from your patterns</li>
                <li>• Real-time problem solving</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Perfect For:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Busy professionals seeking efficiency</li>
                <li>• Teams needing workflow coordination</li>
                <li>• Anyone wanting AI-powered productivity</li>
                <li>• Users managing complex processes</li>
                <li>• People who value personalized assistance</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Available Tools</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Link to={createPageUrl('Assistant')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    Chat Assistant
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Have natural conversations with GLYTCH, ask questions, request help with tasks, and get intelligent assistance 
                  that understands your business context and goals.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Natural Language</Badge>
                  <Badge variant="outline">Context Aware</Badge>
                  <Badge variant="outline">Task Execution</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Automation')}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-5 h-5 text-blue-500" />
                    Task Automation
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Set up intelligent workflows and automation rules that trigger based on your activities, helping you 
                  maintain consistency and efficiency in your daily operations.
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">Smart Workflows</Badge>
                  <Badge variant="outline">Auto-Trigger</Badge>
                  <Badge variant="outline">Rule Builder</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Intelligent Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              GLYTCH learns from every interaction, understanding your preferences, work patterns, and goals to provide 
              increasingly personalized assistance over time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-orange-500" />
              Cross-Tool Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Seamlessly work across all your tools - from creating contacts to managing projects, posting to social media, 
              and analyzing data - all through natural conversation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-gray-500" />
              Customizable Behavior
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Adjust GLYTCH's personality, response style, and automation preferences to match your working style and 
              communication preferences perfectly.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-none">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold mb-3">Getting Started with GLYTCH Assistant</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">1. Start a Conversation</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Simply click "Chat with GLYTCH" and start talking naturally. Ask questions, request help, or describe what you want to accomplish.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">2. Set Up Automation</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create automated workflows to handle routine tasks, trigger actions based on events, and maintain consistency in your processes.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link to={createPageUrl('Assistant')}>
                <img src={GLYTCH_ICON_URL} alt="GLYTCH" className="w-4 h-4 mr-2" />
                Start Chatting with GLYTCH
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('Automation')}>Explore Automation</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}