import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRForm from '@/components/qr/QRForm';
import { toast } from 'sonner';

export default function QREdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qrId, setQrId] = useState(null);
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQrId(params.get('id'));
  }, []);

  const { isLoading } = useQuery({
    queryKey: ['qrcode', qrId],
    queryFn: async () => {
      const codes = await base44.entities.QRCode.filter({ id: qrId });
      const code = codes[0];
      setQrCode(code);
      return code;
    },
    enabled: !!qrId
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.QRCode.update(qrId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrcode', qrId] });
      queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
      toast.success('QR code updated successfully!');
      navigate(createPageUrl('QRView') + `?id=${qrId}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update QR code');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(qrCode);
  };

  if (isLoading || !qrCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ea00ea]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('QRView') + `?id=${qrId}`)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to QR Code
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit QR Code</CardTitle>
            <p className="text-gray-600">Update your dynamic QR code configuration</p>
          </CardHeader>
          <CardContent>
            <QRForm
              qrCode={qrCode}
              onChange={setQrCode}
              onSubmit={handleSubmit}
              onCancel={() => navigate(createPageUrl('QRView') + `?id=${qrId}`)}
              isEdit={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}