import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Globe,
  Lock,
  Server,
  Copy,
  FileCode,
  AlertCircle,
  Shield,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DebugDomainPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState({});
  const [consoleErrors, setConsoleErrors] = useState([]);
  const [running, setRunning] = useState(false);

  // Verify admin access
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
          window.location.href = '/not-found';
          return;
        }
        setCurrentUser(user);
      } catch (error) {
        window.location.href = '/';
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Capture console errors
  useEffect(() => {
    const handleError = (event) => {
      const error = {
        timestamp: new Date().toISOString(),
        message: event.message || event.reason?.message || 'Unknown error',
        stack: event.error?.stack || event.reason?.stack || '',
        type: 'error'
      };
      setConsoleErrors(prev => [error, ...prev].slice(0, 20));
    };

    const handleUnhandledRejection = (event) => {
      const error = {
        timestamp: new Date().toISOString(),
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack || '',
        type: 'unhandledRejection'
      };
      setConsoleErrors(prev => [error, ...prev].slice(0, 20));
    };

    const handleSecurityViolation = (event) => {
      const error = {
        timestamp: new Date().toISOString(),
        message: `CSP Violation: ${event.violatedDirective}`,
        details: event.blockedURI,
        type: 'csp'
      };
      setConsoleErrors(prev => [error, ...prev].slice(0, 20));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('securitypolicyviolation', handleSecurityViolation);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('securitypolicyviolation', handleSecurityViolation);
    };
  }, []);

  // 1️⃣ Domain Reachability Check
  const checkReachability = async () => {
    const results = {};
    const origin = window.location.origin;
    const endpoints = [
      '/__health',
      '/__version',
      '/favicon.ico',
      '/manifest.json'
    ];

    for (const endpoint of endpoints) {
      const startTime = performance.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(origin + endpoint, {
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-cache'
        });
        
        clearTimeout(timeoutId);
        const rtt = Math.round(performance.now() - startTime);
        
        results[endpoint] = {
          status: response.status,
          ok: response.ok,
          rtt,
          passed: response.ok
        };
      } catch (error) {
        const rtt = Math.round(performance.now() - startTime);
        results[endpoint] = {
          error: error.name === 'AbortError' ? 'Timeout' : error.message,
          rtt,
          passed: false,
          classification: error.message.includes('Failed to fetch') ? 'DNS/TLS/Origin unreachable' : 'Unknown'
        };
      }
    }

    setChecks(prev => ({ ...prev, reachability: results }));
    return results;
  };

  // 2️⃣ TLS/HTTPS Check
  const checkTLS = async () => {
    const result = {
      protocol: window.location.protocol,
      isHTTPS: window.location.protocol === 'https:',
      isSecureContext: window.isSecureContext,
      isEmbedded: window.self !== window.top,
      passed: window.location.protocol === 'https:' && window.isSecureContext
    };

    // Check Service Worker support
    if ('serviceWorker' in navigator) {
      try {
        result.serviceWorkerSupported = true;
      } catch (error) {
        result.serviceWorkerSupported = false;
        result.serviceWorkerError = error.message;
      }
    } else {
      result.serviceWorkerSupported = false;
    }

    setChecks(prev => ({ ...prev, tls: result }));
    return result;
  };

  // 3️⃣ SPA Routing Health
  const checkSPARouting = async () => {
    const origin = window.location.origin;
    const testRoute = '/__spa-routing-test-route-that-does-not-exist';
    
    try {
      const response = await fetch(origin + testRoute);
      const contentType = response.headers.get('content-type');
      const isHTML = contentType && contentType.includes('text/html');
      
      const result = {
        testRoute,
        status: response.status,
        isHTML,
        spaFallbackWorking: response.status === 200 && isHTML,
        passed: response.status === 200 && isHTML,
        issue: response.status === 404 ? 'SPA fallback missing' : null
      };

      setChecks(prev => ({ ...prev, spaRouting: result }));
      return result;
    } catch (error) {
      const result = {
        error: error.message,
        passed: false,
        issue: 'Cannot test SPA routing'
      };
      setChecks(prev => ({ ...prev, spaRouting: result }));
      return result;
    }
  };

  // 4️⃣ Asset Path Check
  const checkAssets = async () => {
    const resources = performance.getEntriesByType('resource');
    const failedAssets = [];
    
    resources.forEach(resource => {
      if (
        (resource.initiatorType === 'script' || resource.initiatorType === 'link') &&
        (resource.duration === 0 || resource.transferSize === 0)
      ) {
        failedAssets.push({
          name: resource.name,
          type: resource.initiatorType,
          duration: resource.duration,
          transferSize: resource.transferSize
        });
      }
    });

    const result = {
      totalResources: resources.length,
      failedAssets: failedAssets.length,
      failed: failedAssets,
      passed: failedAssets.length === 0,
      issue: failedAssets.length > 0 ? 'Asset loading failures detected' : null
    };

    setChecks(prev => ({ ...prev, assets: result }));
    return result;
  };

  // 5️⃣ Environment Variables Check
  const checkEnvironment = async () => {
    const requiredVars = {
      'VITE_APP_NAME': import.meta.env.VITE_APP_NAME || 'Omega UI Connect',
      'VITE_SUPPORT_EMAIL': import.meta.env.VITE_SUPPORT_EMAIL || 'syncloud@omegaui.com',
      'MODE': import.meta.env.MODE || 'production'
    };

    const missing = [];
    const available = [];

    Object.entries(requiredVars).forEach(([key, value]) => {
      if (!value) {
        missing.push(key);
      } else {
        available.push({ key, hasValue: true });
      }
    });

    const result = {
      available,
      missing,
      passed: missing.length === 0
    };

    setChecks(prev => ({ ...prev, environment: result }));
    return result;
  };

  // Health Endpoint Check
  const checkHealthEndpoint = async () => {
    try {
      const response = await fetch(window.location.origin + '/__health');
      const data = await response.json();
      return { status: response.status, data, passed: response.ok };
    } catch (error) {
      return { error: error.message, passed: false };
    }
  };

  // Version Endpoint Check
  const checkVersionEndpoint = async () => {
    try {
      const response = await fetch(window.location.origin + '/__version');
      const data = await response.json();
      return { status: response.status, data, passed: response.ok };
    } catch (error) {
      return { error: error.message, passed: false };
    }
  };

  // Run All Checks
  const runAllChecks = async () => {
    setRunning(true);
    setChecks({});
    
    try {
      await Promise.all([
        checkReachability(),
        checkTLS(),
        checkSPARouting(),
        checkAssets(),
        checkEnvironment()
      ]);
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setRunning(false);
    }
  };

  // Generate Diagnostic Report
  const generateReport = () => {
    const report = {
      domain: window.location.origin,
      timestamp: new Date().toISOString(),
      protocol: window.location.protocol,
      secureContext: window.isSecureContext,
      checks,
      consoleErrors: consoleErrors.slice(0, 10),
      userAgent: navigator.userAgent
    };

    const reportText = `
=== Omega UI Diagnostic Report ===
Domain: ${report.domain}
Timestamp: ${report.timestamp}
Protocol: ${report.protocol}
Secure Context: ${report.secureContext}

=== Reachability ===
${Object.entries(checks.reachability || {}).map(([endpoint, result]) => 
  `${endpoint}: ${result.passed ? '✓' : '✗'} ${result.error || result.status || ''} (${result.rtt}ms)`
).join('\n')}

=== TLS/HTTPS ===
HTTPS: ${checks.tls?.isHTTPS ? '✓' : '✗'}
Secure Context: ${checks.tls?.isSecureContext ? '✓' : '✗'}
Embedded: ${checks.tls?.isEmbedded ? '✗' : '✓'}

=== SPA Routing ===
Status: ${checks.spaRouting?.passed ? '✓' : '✗'}
Issue: ${checks.spaRouting?.issue || 'None'}

=== Assets ===
Total: ${checks.assets?.totalResources || 0}
Failed: ${checks.assets?.failedAssets || 0}
${checks.assets?.failed?.map(a => `  - ${a.name}`).join('\n') || ''}

=== Environment ===
Missing Vars: ${checks.environment?.missing?.join(', ') || 'None'}

=== Console Errors (Top 10) ===
${consoleErrors.slice(0, 10).map(e => `[${e.type}] ${e.message}`).join('\n')}

=== User Agent ===
${navigator.userAgent}
    `.trim();

    navigator.clipboard.writeText(reportText);
    toast.success('Diagnostic report copied to clipboard');
  };

  // Auto-run on load
  useEffect(() => {
    if (currentUser) {
      runAllChecks();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin omega-text-primary" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="w-8 h-8 omega-text-primary" />
              Domain Diagnostics
            </h1>
            <p className="text-gray-600 mt-1">
              syncloud-sphere.omegaui.com
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generateReport} 
              variant="outline"
              className="gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Report
            </Button>
            <Button 
              onClick={runAllChecks} 
              disabled={running}
              className="omega-primary text-white gap-2"
            >
              {running ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Run All Checks
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Reachability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Domain Reachability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checks.reachability ? (
                Object.entries(checks.reachability).map(([endpoint, result]) => (
                  <div key={endpoint} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 truncate">{endpoint}</span>
                    <div className="flex items-center gap-2">
                      {result.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-xs">{result.rtt}ms</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">Run checks to see results</div>
              )}
            </CardContent>
          </Card>

          {/* TLS/HTTPS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                TLS / HTTPS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checks.tls ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Protocol</span>
                    <Badge variant={checks.tls.isHTTPS ? "default" : "destructive"}>
                      {checks.tls.protocol}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Secure Context</span>
                    {checks.tls.isSecureContext ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Embedded</span>
                    {checks.tls.isEmbedded ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Run checks to see results</div>
              )}
            </CardContent>
          </Card>

          {/* SPA Routing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5" />
                SPA Routing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checks.spaRouting ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fallback Active</span>
                    {checks.spaRouting.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  {checks.spaRouting.issue && (
                    <div className="text-sm text-red-600 mt-2">
                      ⚠️ {checks.spaRouting.issue}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500">Run checks to see results</div>
              )}
            </CardContent>
          </Card>

          {/* Assets */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Asset Loading
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checks.assets ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Resources</span>
                    <Badge variant="outline">{checks.assets.totalResources}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Failed</span>
                    <Badge variant={checks.assets.failedAssets === 0 ? "default" : "destructive"}>
                      {checks.assets.failedAssets}
                    </Badge>
                  </div>
                  {checks.assets.issue && (
                    <div className="text-sm text-red-600 mt-2">
                      ⚠️ {checks.assets.issue}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500">Run checks to see results</div>
              )}
            </CardContent>
          </Card>

          {/* Environment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checks.environment ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Available Vars</span>
                    <Badge variant="outline">{checks.environment.available?.length || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Missing Vars</span>
                    <Badge variant={checks.environment.missing?.length === 0 ? "default" : "destructive"}>
                      {checks.environment.missing?.length || 0}
                    </Badge>
                  </div>
                  {checks.environment.missing?.length > 0 && (
                    <div className="text-xs text-red-600 mt-2">
                      Missing: {checks.environment.missing.join(', ')}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500">Run checks to see results</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Console Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Live Console Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {consoleErrors.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No errors captured yet
                  </div>
                ) : (
                  consoleErrors.map((error, idx) => (
                    <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <Badge variant="destructive" className="mt-0.5 text-xs">
                          {error.type}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium text-red-900">{error.message}</div>
                          {error.stack && (
                            <pre className="text-xs text-red-600 mt-1 overflow-x-auto">
                              {error.stack.split('\n').slice(0, 3).join('\n')}
                            </pre>
                          )}
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}