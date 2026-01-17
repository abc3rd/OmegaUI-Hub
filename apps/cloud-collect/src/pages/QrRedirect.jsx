import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function QrRedirect() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function resolveToken() {
      try {
        const response = await base44.functions.invoke('resolveQrToken', { token });
        
        if (response.data.redirectUrl) {
          navigate(response.data.redirectUrl);
        } else {
          setError('Invalid QR code');
        }
      } catch (err) {
        console.error('QR resolution error:', err);
        setError(err.message || 'This QR code is invalid or has expired');
      }
    }

    if (token) {
      resolveToken();
    }
  }, [token, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-slate-600">Loading profile...</p>
      </div>
    </div>
  );
}