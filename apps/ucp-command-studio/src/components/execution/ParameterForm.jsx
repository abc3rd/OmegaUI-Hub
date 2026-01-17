import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import GlassCard from "@/components/ui/GlassCard";

export default function ParameterForm({ schema, values, onChange }) {
  const properties = schema?.properties || {};
  const required = schema?.required || [];

  const handleChange = (key, value) => {
    onChange({ ...values, [key]: value });
  };

  const renderField = (key, prop) => {
    const isRequired = required.includes(key);
    const value = values[key] ?? "";

    switch (prop.type) {
      case "boolean":
        return (
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-slate-300">
                {key.replace(/_/g, " ")}
                {isRequired && <span className="text-red-400 ml-1">*</span>}
              </Label>
              {prop.description && (
                <p className="text-xs text-slate-500 mt-0.5">{prop.description}</p>
              )}
            </div>
            <Switch
              checked={value === true}
              onCheckedChange={(checked) => handleChange(key, checked)}
              className="data-[state=checked]:bg-[#4bce2a]"
            />
          </div>
        );

      case "number":
        return (
          <div>
            <Label className="text-slate-300">
              {key.replace(/_/g, " ")}
              {isRequired && <span className="text-red-400 ml-1">*</span>}
            </Label>
            {prop.description && (
              <p className="text-xs text-slate-500 mt-0.5 mb-1.5">{prop.description}</p>
            )}
            <Input
              type="number"
              value={value}
              onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
              placeholder={`Enter ${key}`}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
        );

      case "object":
      case "array":
        return (
          <div>
            <Label className="text-slate-300">
              {key.replace(/_/g, " ")}
              {isRequired && <span className="text-red-400 ml-1">*</span>}
            </Label>
            {prop.description && (
              <p className="text-xs text-slate-500 mt-0.5 mb-1.5">{prop.description}</p>
            )}
            <Textarea
              value={typeof value === "object" ? JSON.stringify(value, null, 2) : value}
              onChange={(e) => {
                try {
                  handleChange(key, JSON.parse(e.target.value));
                } catch {
                  handleChange(key, e.target.value);
                }
              }}
              placeholder={`Enter ${prop.type === "array" ? "JSON array" : "JSON object"}`}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 font-mono text-sm min-h-[100px]"
            />
          </div>
        );

      default: // string
        const isLongText = prop.description?.toLowerCase().includes("message") ||
          prop.description?.toLowerCase().includes("content") ||
          key.toLowerCase().includes("description");

        return (
          <div>
            <Label className="text-slate-300">
              {key.replace(/_/g, " ")}
              {isRequired && <span className="text-red-400 ml-1">*</span>}
            </Label>
            {prop.description && (
              <p className="text-xs text-slate-500 mt-0.5 mb-1.5">{prop.description}</p>
            )}
            {isLongText ? (
              <Textarea
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={`Enter ${key}`}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[100px]"
              />
            ) : (
              <Input
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={`Enter ${key}`}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            )}
          </div>
        );
    }
  };

  if (Object.keys(properties).length === 0) {
    return (
      <GlassCard className="p-6 text-center text-slate-500">
        This packet has no parameters.
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="font-medium text-white mb-4">Parameters</h3>
      <div className="space-y-5">
        {Object.entries(properties).map(([key, prop]) => (
          <div key={key}>
            {renderField(key, prop)}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}