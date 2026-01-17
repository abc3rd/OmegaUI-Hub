import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UCP_EXAMPLES, getExample } from "@/components/examples/ucpExamples";
import { Lightbulb } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

export default function IntentInput({ onInterpret, isProcessing }) {
  const [name, setName] = useState("");
  const [intent, setIntent] = useState("");
  const [description, setDescription] = useState("");
  const [selectedExample, setSelectedExample] = useState("");

  const handleExampleSelect = (exampleId) => {
    const example = getExample(exampleId);
    if (example) {
      setName(example.title || "");
      setIntent(example.intent || "");
      setDescription(example.description || "");
      setSelectedExample(exampleId);
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !intent.trim()) return;
    onInterpret({ name, intent, description });
  };

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        {/* Example Selector */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-[#ea00ea]" />
            <Label className="text-slate-300">Start with an Example</Label>
          </div>
          <Select value={selectedExample} onValueChange={handleExampleSelect}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Load a sample workflow to get started..." />
            </SelectTrigger>
            <SelectContent className="bg-[#16161c] border-white/10">
              {UCP_EXAMPLES.filter(ex => ex.intent).map((example) => (
                <SelectItem key={example.id} value={example.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{example.title}</span>
                    <span className="text-xs text-slate-400">{example.category}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-slate-300">Packet Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Customer Greeting Generator"
            className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2699fe]/50"
          />
        </div>

        <div>
          <Label className="text-slate-300">Natural Language Intent</Label>
          <Textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="Describe what you want this command to do... e.g., 'Generate a personalized welcome email for a new customer, using their name and company, with a professional but friendly tone.'"
            className="mt-1.5 min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2699fe]/50 resize-none"
          />
          <p className="mt-2 text-xs text-slate-500">
            Be specific about inputs, outputs, and any constraints. The AI will extract a parameter schema.
          </p>
        </div>

        <div>
          <Label className="text-slate-300">Description (optional)</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description for your packet library"
            className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#2699fe]/50"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || !intent.trim() || isProcessing}
          className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe] hover:opacity-90 text-white border-0 h-12"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Interpreting Intent...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Interpret & Generate Schema
            </>
          )}
        </Button>
      </div>
    </GlassCard>
  );
}