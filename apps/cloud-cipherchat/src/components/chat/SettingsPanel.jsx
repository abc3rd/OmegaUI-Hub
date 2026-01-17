import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, Key, Shield, CheckCircle, Lock, Trash2 } from "lucide-react";
import { useAiProvider } from "./hooks/useAiProvider";
import { clearStore, STORES } from "./infrastructure/storage/indexedDB";
import { clearEncryptionKey } from "./infrastructure/encryption/crypto";

export default function SettingsPanel({ onPinChange, isPinEnabled, onTogglePinLock }) {
  const { config, setConfig, isConfigured } = useAiProvider();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleEraseAll = async () => {
    if (confirm("Erase all conversations from this device? This action cannot be undone.")) {
      await clearStore(STORES.CONVERSATIONS);
      await clearStore(STORES.MESSAGES);
      clearEncryptionKey();
      alert("All conversations have been erased");
      window.location.reload();
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              AI Provider Configuration
            </CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              Configure your AI endpoint for optimized communication
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="baseUrl">API Base URL</Label>
              <Input
                id="baseUrl"
                value={config.baseUrl}
                onChange={(e) => setConfig({ baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                OpenAI-compatible API endpoint
              </p>
            </div>

            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ apiKey: e.target.value })}
                placeholder="sk-..."
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Your API key is stored securely in your browser
              </p>
            </div>

            <div>
              <Label htmlFor="modelName">Model Name</Label>
              <Input
                id="modelName"
                value={config.modelName}
                onChange={(e) => setConfig({ modelName: e.target.value })}
                placeholder="gpt-4o-mini"
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Available models: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <Label htmlFor="useUcp">Enable UCP Translation</Label>
                <p className="text-xs text-slate-500 mt-1">
                  Translate between human and AI language for reduced tokens and better understanding
                </p>
              </div>
              <Switch
                id="useUcp"
                checked={config.useUcp}
                onCheckedChange={(checked) => setConfig({ useUcp: checked })}
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-slate-900 hover:bg-slate-800"
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>

            {isConfigured && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                AI provider configured successfully
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Storage
            </CardTitle>
            <p className="text-sm text-slate-500 mt-2">
              Your conversations are stored locally on your device
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Local Encryption</p>
                  <p className="text-slate-600 text-xs mt-1">
                    Messages encrypted with AES-256-GCM before local storage
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">Device-Only Storage</p>
                  <p className="text-slate-600 text-xs mt-1">
                    All conversation history stays on your device, not on remote servers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">HTTPS Only</p>
                  <p className="text-slate-600 text-xs mt-1">
                    All API communications over secure HTTPS
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pinLock" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Enable PIN Lock
                  </Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Require PIN to access your conversations
                  </p>
                </div>
                <Switch
                  id="pinLock"
                  checked={isPinEnabled}
                  onCheckedChange={onTogglePinLock}
                />
              </div>

              {isPinEnabled && (
                <Button
                  variant="outline"
                  onClick={onPinChange}
                  className="w-full"
                >
                  Change PIN
                </Button>
              )}

              <Button
                variant="destructive"
                onClick={handleEraseAll}
                className="w-full flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Erase All Conversations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}