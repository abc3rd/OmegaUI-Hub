import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function PromptInput({ onSubmit, isProcessing }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !isProcessing) {
      onSubmit(prompt);
      setPrompt('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl border border-[#3c3c3c] p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">GLYTCH AI Prompt</h3>
          <p className="text-sm text-gray-400">Test UCP efficiency with your own prompts</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt to test GLYTCH AI with UCP caching..."
          disabled={isProcessing}
          className="min-h-[100px] bg-[#1f1f1f] border-[#3c3c3c] text-white placeholder:text-gray-500 resize-none"
        />
        
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Building your personal dictionary • Fast indexing
          </p>
          <Button
            type="submit"
            disabled={!prompt.trim() || isProcessing}
            className="bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:from-[#ea00ea]/90 hover:to-[#2699fe]/90"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}