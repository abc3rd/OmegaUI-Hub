import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';

export default function AIStudioPage() {
  const [logoPrompt, setLogoPrompt] = useState('a lion wearing a crown for a finance company');
  const [generatedLogo, setGeneratedLogo] = useState(null);
  const [copyPrompt, setCopyPrompt] = useState('a catchy slogan for a new coffee shop');
  const [generatedCopy, setGeneratedCopy] = useState('');

  const handleGenerateLogo = () => {
    // Simulate API call to DALL-E/Imagen
    setGeneratedLogo('https://placehold.co/512x512/1e293b/94a3b8.png?text=Generated+Logo');
  };

  const handleGenerateCopy = () => {
    // Simulate API call to Gemini
    setGeneratedCopy('"Brewing Moments, One Cup at a Time."');
  };

  return (
    <Tabs defaultValue="logo" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-gray-800 text-white">
        <TabsTrigger value="logo">AI Logo Generator</TabsTrigger>
        <TabsTrigger value="copy">AI Content Writer</TabsTrigger>
      </TabsList>
      <TabsContent value="logo">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Generate a Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter a prompt..."
              value={logoPrompt}
              onChange={(e) => setLogoPrompt(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
            <Button onClick={handleGenerateLogo} className="w-full bg-cyan-500 hover:bg-cyan-600">
              <Sparkles className="mr-2 h-4 w-4" /> Generate
            </Button>
            {generatedLogo && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <img src={generatedLogo} alt="Generated Logo" className="rounded-md mx-auto" />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="copy">
        <Card className="bg-gray-800 border-gray-700 text-white">
          <CardHeader>
            <CardTitle>Generate Marketing Copy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter a prompt..."
              value={copyPrompt}
              onChange={(e) => setCopyPrompt(e.target.value)}
              className="bg-gray-700 border-gray-600"
            />
            <Button onClick={handleGenerateCopy} className="w-full bg-cyan-500 hover:bg-cyan-600">
              <Sparkles className="mr-2 h-4 w-4" /> Generate
            </Button>
            {generatedCopy && (
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <p className="text-center font-serif text-lg italic">"{generatedCopy}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}