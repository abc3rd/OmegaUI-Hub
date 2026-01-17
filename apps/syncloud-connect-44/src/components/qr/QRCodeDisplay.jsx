import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function QRCodeDisplay({ qrDataUrl, qrUrl, label }) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${label || 'qr-code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label || 'QR Code'}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {qrDataUrl && (
          <>
            <img 
              src={qrDataUrl} 
              alt={label || 'QR Code'} 
              className="w-64 h-64 border-2 border-gray-200 rounded-lg"
            />
            <div className="text-sm text-gray-600 text-center break-all max-w-md">
              {qrUrl}
            </div>
            <Button onClick={handleDownload} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Download QR Code
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}