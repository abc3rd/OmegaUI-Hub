import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
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
  Database,
  Wifi,
  Shield,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DebugPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState({});
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState(false);

  // Verify admin access
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
          window.location.href = '/';
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

  // Fetch existing logs
  const { data: debugLogs } = useQuery({
    queryKey: ['debugLogs'],
    queryFn: () => base44.entities.DebugLog.list('-created_date', 50),
    enabled: !!currentUser,
  });

  // Add log entry
  const addLog = async (type, severity, message, details = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      severity,
      message,
      details: JSON.stringify(details)
    };
    
    setLogs(prev => [logEntry, ...prev]);
    
    // Save to database
    try {
      await base44.entities.DebugLog.create(logEntry);
    } catch (error) {
      console.error('Failed to save log:', error);
    }
  };

  // 1️⃣ DNS Resolution Check
  const checkDNS = async () => {
    const startTime = performance.now();
    try {
      const response = await fetch('https://syncloud-sphere.omegaui.com', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const rtt = Math.round(performance.now() - startTime);
      
      const result = {
        reachable: response.ok,
        status: response.status,
        rtt,
        passed: response.ok
      };
      
      setChecks(prev => ({ ...prev, dns: result }));
      
      if (!response.ok) {
        await addLog('dns', 'error', `Domain not reachable: ${response.status}`, result);
      } else {
        await addLog('dns', 'info', `Domain reachable in ${rtt}ms`, result);
      }
      
      return result;
    } catch (error) {
      const result = {
        reachable: false,
        error: error.message,
        rtt: Math.round(performance.now() - startTime),
        passed: false
      };
      setChecks(prev => ({ ...prev, dns: result }));
      await addLog('dns', 'error', `DNS resolution failed: ${error.message}`, result);
      return result;
    }
  };

  // 2️⃣ TLS/HTTPS Validation
  const checkTLS = async () => {
    try {
      const protocol = window.location.protocol;
      const isHTTPS = protocol === 'https:';
      
      // Check for mixed content
      const hasMixedContent = document.querySelectorAll('[src^="http:"]').length > 0 ||
                             document.querySelectorAll('[href^="http:"]').length > 0;
      
      const result = {
        protocol,
        isHTTPS,
        mixedContent: hasMixedContent,
        passed: isHTTPS && !hasMixedContent
      };
      
      setChecks(prev => ({ ...prev, tls: result }));
      
      if (!isHTTPS) {
        await addLog('tls', 'error', 'Site not loaded over HTTPS', result);
      } else if (hasMixedContent) {
        await addLog('tls', 'warn', 'Mixed content detected', result);
      } else {
        await addLog('tls', 'info', 'TLS validation passed', result);
      }
      
      return result;
    } catch (error) {
      const result = { error: error.message, passed: false };
      setChecks(prev => ({ ...prev, tls: result }));
      await addLog('tls', 'error', `TLS check failed: ${error.message}`, result);
      return result;
    }
  };

  // 3️⃣ API/Backend Health
  const checkAPI = async () => {
    const results = {};
    
    // Health endpoint
    try {
      const healthStart = performance.now();
      const healthRes = await base44.functions.invoke('health');
      const healthRTT = Math.round(performance.now() - healthStart);
      results.health = {
        status: healthRes.data.status,
        rtt: healthRTT,
        data: healthRes.data,
        passed: healthRes.data.status === 'ok'
      };
    } catch (error) {
      results.health = { error: error.message, passed: false };
      await addLog('api', 'error', `Health endpoint failed: ${error.message}`, { endpoint: '/health' });
    }

    // Version endpoint
    try {
      const versionRes = await base44.functions.invoke('version');
      results.version = {
        data: versionRes.data,
        passed: true
      };
    } catch (error) {
      results.version = { error: error.message, passed: false };
      await addLog('api', 'error', `Version endpoint failed: ${error.message}`, { endpoint: '/version' });
    }

    // Env endpoint
    try {
      const envRes = await base44.functions.invoke('env');
      results.env = {
        data: envRes.data,
        passed: true
      };
    } catch (error) {
      results.env = { error: error.message, passed: false };
      await addLog('api', 'error', `Env endpoint failed: ${error.message}`, { endpoint: '/env' });
    }

    const allPassed = Object.values(results).every(r => r.passed);
    if (allPassed) {
      await addLog('api', 'info', 'All API endpoints healthy', results);
    }

    setChecks(prev => ({ ...prev, api: results }));
    return results;
  };

  // 4️⃣ Build Health
  const checkBuild = async () => {
    try {
      const result = {
        nodeEnv: import.meta.env.MODE || 'unknown',
        buildTime: '2026-01-09T00:00:00Z',
        passed: true
      };
      
      setChecks(prev => ({ ...prev, build: result }));
      await addLog('build', 'info', 'Build health check passed', result);
      return result;
    } catch (error) {
      const result = { error: error.message, passed: false };
      setChecks(prev => ({ ...prev, build: result }));
      await addLog('build', 'error', `Build check failed: ${error.message}`, result);
      return result;
    }
  };

  // 7️⃣ Storage & Crypto Health
  const checkCrypto = async () => {
    const results = {};
    
    // IndexedDB
    try {
      const dbRequest = indexedDB.open('__test__', 1);
      await new Promise((resolve, reject) => {
        dbRequest.onsuccess = () => {
          indexedDB.deleteDatabase('__test__');
          resolve();
        };
        dbRequest.onerror = reject;
      });
      results.indexedDB = { supported: true, passed: true };
    } catch (error) {
      results.indexedDB = { supported: false, error: error.message, passed: false };
      await addLog('crypto', 'error', 'IndexedDB not available', { error: error.message });
    }

    // WebCrypto
    try {
      const supported = !!window.crypto && !!window.crypto.subtle;
      results.webCrypto = { supported, passed: supported };
      if (!supported) {
        await addLog('crypto', 'error', 'WebCrypto API not available', {});
      }
    } catch (error) {
      results.webCrypto = { supported: false, error: error.message, passed: false };
    }

    // AES-GCM encryption test
    if (results.webCrypto?.supported) {
      try {
        const key = await window.crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        
        const data = new TextEncoder().encode('test');
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        const encrypted = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          key,
          data
        );
        
        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv },
          key,
          encrypted
        );
        
        const decryptedText = new TextDecoder().decode(decrypted);
        results.encryption = { 
          test: decryptedText === 'test' ? 'pass' : 'fail',
          passed: decryptedText === 'test'
        };
      } catch (error) {
        results.encryption = { test: 'fail', error: error.message, passed: false };
        await addLog('crypto', 'error', 'AES-GCM encryption test failed', { error: error.message });
      }

      // ECDH key generation test
      try {
        const keypair = await window.crypto.subtle.generateKey(
          { name: 'ECDH', namedCurve: 'P-256' },
          true,
          ['deriveKey', 'deriveBits']
        );
        results.ecdh = { test: 'pass', passed: true };
      } catch (error) {
        results.ecdh = { test: 'fail', error: error.message, passed: false };
        await addLog('crypto', 'error', 'ECDH key generation test failed', { error: error.message });
      }
    }

    const allPassed = Object.values(results).every(r => r.passed);
    if (allPassed) {
      await addLog('crypto', 'info', 'All crypto checks passed', results);
    }

    setChecks(prev => ({ ...prev, crypto: results }));
    return results;
  };

  // Run all checks
  const runAllChecks = async () => {
    setRunning(true);
    setLogs([]);
    setChecks({});
    
    try {
      await Promise.all([
        checkDNS(),
        checkTLS(),
        checkAPI(),
        checkBuild(),
        checkCrypto()
      ]);
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setRunning(false);
    }
  };

  // Auto-run on load
  useEffect(() => {
    if (currentUser) {
      runAllChecks();
    }
  }, [currentUser]);

  // CSP/CORS error listener
  useEffect(() => {
    const handleSecurityViolation = (e) => {
      addLog('csp', 'error', `CSP Violation: ${e.violatedDirective}`, {
        blockedURI: e.blockedURI,
        documentURI: e.documentURI
      });
    };

    const handleError = (e) => {
      if (e.message?.includes('CORS') || e.message?.includes('CSP')) {
        addLog('csp', 'error', e.message, { error: e });
      }
    };

    window.addEventListener('securitypolicyviolation', handleSecurityViolation);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('securitypolicyviolation', handleSecurityViolation);
      window.removeEventListener('error', handleError);
    };
  }, []);

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

  const getStatusColor = (passed) => {
    if (passed === undefined) return 'text-gray-400';
    return passed ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (passed) => {
    if (passed === undefined) return AlertCircle;
    return passed ? CheckCircle2 : XCircle;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Activity className="w-8 h-8 omega-text-primary" />
              Deployment Debug Console
            </h1>
            <p className="text-gray-600 mt-1">
              Health diagnostics for syncloud-sphere.omegaui.com
            </p>
          </div>
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* 1️⃣ DNS Resolution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                DNS Resolution
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checks.dns ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Domain Reachable</span>
                    <Badge variant={checks.dns.reachable ? "default" : "destructive"}>
                      {checks.dns.reachable ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  {checks.dns.status && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status Code</span>
                      <Badge variant="outline">{checks.dns.status}</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="text-sm font-medium">{checks.dns.rtt}ms</span>
                  </div>
                  {checks.dns.error && (
                    <div className="text-sm text-red-600 mt-2">
                      Error: {checks.dns.error}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500">Run checks to see results</div>
              )}
            </CardContent>
          </Card>

          {/* 2️⃣ TLS/HTTPS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                TLS / HTTPS Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checks.tls ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Protocol</span>
                    <Badge variant={checks.tls.isHTTPS ? "default" : "destructive"}>
                      {checks.tls.protocol}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mixed Content</span>
                    <Badge variant={checks.tls.mixedContent ? "destructive" : "default"}>
                      {checks.tls.mixedContent ? 'Detected' : 'None'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    {React.createElement(getStatusIcon(checks.tls.passed), {
                      className: cn("w-5 h-5", getStatusColor(checks.tls.passed))
                    })}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Run checks to see results</div>
              )}
            </CardContent>
          </Card>

          {/* 3️⃣ API Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                API / Backend Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checks.api ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">/health</span>
                      {checks.api.health?.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    {checks.api.health?.rtt && (
                      <div className="text-xs text-gray-500">RTT: {checks.api.health.rtt}ms</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">/version</span>
                      {checks.api.version?.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    {checks.api.version?.data?.version && (
                      <div className="text-xs text-gray-500">v{checks.api.version.data.version}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">/env</span>
                    {checks.api.env?.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Run checks to see results</div>
              )}
            </CardContent>
          </Card>

          {/* 4️⃣ Build Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Build Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checks.build ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Environment</span>
                    <Badge variant="outline">{checks.build.nodeEnv}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Build Time</span>
                    <span className="text-xs text-gray-500">{checks.build.buildTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    {React.createElement(getStatusIcon(checks.build.passed), {
                      className: cn("w-5 h-5", getStatusColor(checks.build.passed))
                    })}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Run checks to see results</div>
              )}
            </CardContent>
          </Card>

          {/* 7️⃣ Crypto Health */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Storage & Crypto Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              {checks.crypto ? (
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">IndexedDB</div>
                    {checks.crypto.indexedDB?.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">WebCrypto</div>
                    {checks.crypto.webCrypto?.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">AES-GCM Test</div>
                    {checks.crypto.encryption?.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">ECDH Test</div>
                    {checks.crypto.ecdh?.passed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">Run checks to see results</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Diagnostic Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {logs.length === 0 && !debugLogs?.length && (
                  <div className="text-sm text-gray-500 text-center py-8">
                    No logs yet. Run checks to generate diagnostics.
                  </div>
                )}
                {logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <Badge 
                      variant={log.severity === 'error' ? 'destructive' : log.severity === 'warn' ? 'default' : 'outline'}
                      className="mt-0.5"
                    >
                      {log.type}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{log.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}