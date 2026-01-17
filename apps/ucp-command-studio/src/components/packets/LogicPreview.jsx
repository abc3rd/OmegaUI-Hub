import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, Code, Edit2, Check } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function LogicPreview({ logic, onChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLogic, setEditedLogic] = useState(JSON.stringify(logic, null, 2));

  const handleSave = () => {
    try {
      onChange(JSON.parse(editedLogic));
      setIsEditing(false);
    } catch {
      // Invalid JSON
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Cached Logic</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="border-white/20 text-slate-300 hover:text-white hover:bg-white/10"
        >
          {isEditing ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save
            </>
          ) : (
            <>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="formatted" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="formatted" className="data-[state=active]:bg-white/10">
            <Eye className="mr-2 h-4 w-4" />
            Formatted
          </TabsTrigger>
          <TabsTrigger value="raw" className="data-[state=active]:bg-white/10">
            <Code className="mr-2 h-4 w-4" />
            Raw JSON
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formatted" className="mt-4">
          <div className="space-y-4">
            {logic?.system_prompt && (
              <div>
                <Label className="text-xs text-slate-400">System Prompt</Label>
                <div className="mt-1 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{logic.system_prompt}</p>
                </div>
              </div>
            )}
            
            {logic?.template && (
              <div>
                <Label className="text-xs text-slate-400">Execution Template</Label>
                <div className="mt-1 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap font-mono">{logic.template}</p>
                </div>
              </div>
            )}

            {logic?.output_format && (
              <div>
                <Label className="text-xs text-slate-400">Output Format</Label>
                <div className="mt-1 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-slate-300">{logic.output_format}</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="raw" className="mt-4">
          {isEditing ? (
            <Textarea
              value={editedLogic}
              onChange={(e) => setEditedLogic(e.target.value)}
              className="min-h-[300px] font-mono text-sm bg-white/5 border-white/10 text-slate-300"
            />
          ) : (
            <pre className="p-4 rounded-lg bg-white/5 border border-white/10 overflow-auto max-h-[400px]">
              <code className="text-sm text-slate-300">
                {JSON.stringify(logic, null, 2)}
              </code>
            </pre>
          )}
        </TabsContent>
      </Tabs>
    </GlassCard>
  );
}