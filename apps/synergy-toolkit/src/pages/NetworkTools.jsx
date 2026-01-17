
import React, { useState, useEffect } from 'react';
import { NetworkCheck } from '@/entities/NetworkCheck';
import { runNetworkTest } from '@/functions/runNetworkTest';
import { toast } from 'sonner';

import NetworkTester from '../components/network/NetworkTester';
import NetworkHistory from '../components/network/NetworkHistory';
import NetworkStats from '../components/network/NetworkStats';
import NetworkDiscovery from '../components/network/NetworkDiscovery';
import DiscoveredDevicesList from '../components/network/DiscoveredDevicesList';

export default function NetworkTools() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [lastScanTimestamp, setLastScanTimestamp] = useState(Date.now());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await NetworkCheck.list("-created_date", 20);
      setHistory(data);
    } catch (error) {
      console.error("Failed to load network check history:", error);
      toast.error("Failed to load test history.");
    }
    setIsLoading(false);
  };

  const handleRunTest = async ({ test_type, target }) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const { data: result } = await runNetworkTest({ test_type, target });
      setTestResult({ ...result, test_type, target });

      // Save the result to the database
      await NetworkCheck.create({
        test_type,
        target,
        result: result,
        status: result.success ? 'success' : 'failed',
        response_time: result.stats?.avg || null,
        location: 'Cloud',
      });
      
      toast.success(`Test "${test_type}" for ${target} completed.`);
      // Refresh history after a short delay
      setTimeout(loadHistory, 500);

    } catch (error) {
      console.error("Network test failed:", error);
      toast.error("An error occurred while running the test.");
      setTestResult({ success: false, error: error.message, test_type, target });
    } finally {
      setIsTesting(false);
    }
  };
  
  const handlePingDiscoveredDevice = (ip) => {
    // Set the target in the tester and run the ping test
    const testerInput = document.querySelector('input[placeholder="e.g., google.com or 8.8.8.8"]');
    if (testerInput) {
        // This is a bit of a hack to update the state controlled by another component
        // A better way would be to lift state up, but for this targeted action it's acceptable.
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(testerInput, ip);
        testerInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    handleRunTest({ test_type: 'ping', target: ip });
    toast.info(`Pinging ${ip}...`);
  }

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">Network Toolkit</h1>
        
        <NetworkStats history={history} isLoading={isLoading} />
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <NetworkTester 
              onRunTest={handleRunTest}
              isTesting={isTesting}
              result={testResult}
            />
            <NetworkDiscovery onScanComplete={() => setLastScanTimestamp(Date.now())} />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <NetworkHistory 
              history={history}
              isLoading={isLoading}
            />
             <DiscoveredDevicesList 
              onPingDevice={handlePingDiscoveredDevice}
              lastScanTimestamp={lastScanTimestamp}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
