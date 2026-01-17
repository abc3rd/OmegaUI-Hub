import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, CheckCircle, AlertCircle } from 'lucide-react';

export default function ScanHandler() {
  const [status, setStatus] = useState('processing');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleScan = async () => {
      try {
        const pathParts = window.location.pathname.split('/');
        const qrId = pathParts[pathParts.length - 1];

        if (!qrId) {
          throw new Error('Invalid QR code');
        }

        const response = await base44.functions.invoke('handleScan', { qr_id: qrId });
        const data = response.data;

        setResult(data);
        setStatus('success');

        // Redirect if URL is provided
        if (data.redirect_url) {
          setTimeout(() => {
            window.location.href = data.redirect_url;
          }, 2000);
        }
      } catch (err) {
        setError(err.message || 'Failed to process scan');
        setStatus('error');
      }
    };

    handleScan();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#ea00ea] to-[#2699fe] flex items-center justify-center">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">QR Code Scan</CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea00ea] mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your scan...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Scan Successful!</h3>
                <p className="text-gray-600 mb-4">{result?.message}</p>
                
                {result?.command_payload && (
                  <div className="bg-gray-50 p-4 rounded-lg mt-4 text-left">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Command Payload:</p>
                    <code className="text-xs text-gray-600 break-all">{result.command_payload}</code>
                  </div>
                )}

                {result?.redirect_url && (
                  <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
                )}
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Scan Failed</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Powered by <span className="font-semibold text-[#ea00ea]">SynCloud Connect</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">We Beat the Cloud — UCP</p>
        </div>
      </div>
    </div>
  );
}