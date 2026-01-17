import React, { useState } from 'react';
import { generateAIContent } from '@/functions/generateAIContent';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIContentAssistant() {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt.");
      return;
    }
    setIsLoading(true);
    setGeneratedContent('');
    try {
      const { data } = await generateAIContent({ prompt });
      setGeneratedContent(data.content);
    } catch (error) {
      console.error("AI content generation failed:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="e.g., Write a tweet about the future of AI..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="bg-gray-900 border-gray-700 text-white min-h-[100px]"
      />
      <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-700">
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4 mr-2" />
        )}
        Generate Content
      </Button>
      {generatedContent && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-4 h-4" />
            Generated Content
          </h3>
          <p className="text-gray-300 whitespace-pre-wrap">{generatedContent}</p>
        </div>
      )}
    </div>
  );
}