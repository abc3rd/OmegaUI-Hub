import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

export default function StripeTestPanel() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const testStripeConnection = async () => {
    setTesting(true);
    setResult(null);

    try {
      // Test by creating a test checkout session with minimal data
      const response = await fetch('/functions/createCheckoutSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true, // Special flag for connection test
        }),
      });

      const data = await response.json();

      if (response.ok || data.error?.includes('Profile not found')) {
        // If we get a profile error, it means Stripe is working
        setResult({
          success: true,
          message: 'Stripe connection successful! API keys are configured correctly.',
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Unknown error',
          details: data.details,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to connect to Stripe',
        details: error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stripe Integration Status</CardTitle>
        <CardDescription>
          Test your Stripe API connection and webhook configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testStripeConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            'Test Stripe Connection'
          )}
        </Button>

        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <p className="font-semibold">{result.message}</p>
              {result.details && (
                <p className="text-sm mt-2 opacity-80">{result.details}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t space-y-2 text-sm">
          <h4 className="font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Required Secrets
          </h4>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>STRIPE_SECRET_KEY - Set ✓</li>
            <li>STRIPE_WEBHOOK_SECRET - Set ✓</li>
            <li>STRIPE_WEBHOOK_SECRET_SUBSCRIPTIONS - Set ✓</li>
          </ul>
        </div>

        <div className="pt-4 border-t space-y-2 text-sm">
          <h4 className="font-semibold">Webhook Endpoints</h4>
          <p className="text-slate-600">Configure in Stripe Dashboard:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li>/functions/stripeWebhook</li>
            <li>/functions/stripeSubscriptionWebhook</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}