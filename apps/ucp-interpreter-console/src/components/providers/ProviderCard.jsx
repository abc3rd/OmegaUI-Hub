import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  Server, 
  Settings, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Star,
  TestTube,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProviderCard({
  provider,
  onEdit,
  onDelete,
  onTest,
  onSetDefault,
  isTesting = false,
  testResult = null,
  className
}) {
  const providerTypeLabels = {
    'OPENAI_COMPAT': 'OpenAI Compatible',
    'LM_STUDIO': 'LM Studio'
  };

  return (
    <Card className={cn(
      "relative transition-all duration-200",
      provider.is_default && "ring-2 ring-blue-500",
      !provider.is_active && "opacity-60",
      className
    )}>
      {provider.is_default && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-blue-500 text-white rounded-full p-1">
            <Star className="w-3 h-3 fill-current" />
          </div>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              provider.is_active ? "bg-emerald-100" : "bg-slate-100"
            )}>
              <Server className={cn(
                "w-5 h-5",
                provider.is_active ? "text-emerald-600" : "text-slate-400"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">{provider.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="text-xs">
                  {providerTypeLabels[provider.provider_type] || provider.provider_type}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Base URL</span>
            <span className="font-mono text-xs text-slate-700 truncate max-w-[200px]">
              {provider.base_url}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Model</span>
            <span className="font-medium text-slate-700">{provider.default_model || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Context Window</span>
            <span className="font-mono text-slate-700">{(provider.context_window || 4096).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">API Key</span>
            <span className="font-mono text-xs text-slate-700">
              {provider.has_api_key ? provider.api_key_masked || '****' : 'Not set'}
            </span>
          </div>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={cn(
            "p-3 rounded-lg text-sm",
            testResult.connected ? "bg-emerald-50" : "bg-red-50"
          )}>
            <div className="flex items-center gap-2">
              {testResult.connected ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Connected</span>
                  <span className="text-emerald-600 text-xs ml-auto">
                    {testResult.latency_ms}ms
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700 truncate">{testResult.error}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTest(provider)}
            disabled={isTesting}
            className="flex-1"
          >
            {isTesting ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <TestTube className="w-3.5 h-3.5 mr-1.5" />
            )}
            Test
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(provider)}
            className="flex-1"
          >
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>

          {!provider.is_default && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSetDefault(provider)}
              className="flex-1"
            >
              <Star className="w-3.5 h-3.5 mr-1.5" />
              Default
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Provider</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{provider.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(provider)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}