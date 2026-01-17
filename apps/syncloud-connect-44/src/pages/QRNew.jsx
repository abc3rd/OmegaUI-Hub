import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QRForm from '@/components/qr/QRForm';
import { toast } from 'sonner';

export default function QRNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [qrCode, setQrCode] = useState({
    label: '',
    command_payload: '',
    redirect_url: '',
    status: 'active'
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.QRCode.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qrcodes'] });
      toast.success('QR code created successfully!');
      navigate(createPageUrl('QRDashboard'));
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create QR code');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(qrCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('QRDashboard'))}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New QR Code</CardTitle>
            <p className="text-gray-600">Generate a dynamic, UCP-enabled QR code</p>
          </CardHeader>
          <CardContent>
            <QRForm
              qrCode={qrCode}
              onChange={setQrCode}
              onSubmit={handleSubmit}
              onCancel={() => navigate(createPageUrl('QRDashboard'))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}