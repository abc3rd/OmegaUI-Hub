import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Printer, RotateCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function QRCodeDisplay({ profile, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (isOpen && profile) {
      generateSignpostImage();
    }
    return () => {
      // Clean up the object URL when the component unmounts or re-renders
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isOpen, profile]);

  const generateSignpostImage = async () => {
    setLoading(true);
    try {
      // Call the function and get the raw response
      const response = await fetch(`/api/functions/generateQRCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileId: profile.id }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      // Get the image as a blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

    } catch (error) {
      console.error('QR code generation error:', error);
      toast.error('Failed to generate your QR code.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `cloud-collect-${profile.publicName.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('QR code downloaded!');
  };

  const handlePrint = () => {
    if (!imageUrl) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code - ${profile.publicName}</title>
          <style>
            body { 
              margin: 0; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
            }
            img { 
              max-width: 100%; 
              height: auto;
            }
            @media print {
              body { margin: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="QR Code for ${profile.publicName}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const rotateQRMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Profile.update(profile.id, {
        qrCodeVersion: (profile.qrCodeVersion || 1) + 1,
        qrCodeLastRotatedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myProfiles']);
      setImageUrl(null);
      generateSignpostImage();
      toast.success("QR code rotated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to rotate QR code");
    }
  });

  const disableQRMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Profile.update(profile.id, {
        qrCodeStatus: 'disabled',
        isActive: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myProfiles']);
      toast.success("QR code disabled. Your profile is now inactive.");
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to disable QR code");
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Your Cloud Collect QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="ml-4 text-slate-600">Generating your QR code...</p>
            </div>
          ) : imageUrl ? (
            <>
              <div className="bg-slate-100 rounded-xl p-4 text-center">
                <img 
                  src={imageUrl} 
                  alt="Printable QR Code" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleDownload}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download
                </Button>
                
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  size="lg"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Print
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  onClick={() => rotateQRMutation.mutate()}
                  variant="outline"
                  size="lg"
                  disabled={rotateQRMutation.isPending}
                >
                  {rotateQRMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <RotateCw className="w-5 h-5 mr-2" />
                  )}
                  Rotate QR
                </Button>
                
                <Button
                  onClick={() => {
                    if (confirm("This will disable your QR code and deactivate your profile. Are you sure?")) {
                      disableQRMutation.mutate();
                    }
                  }}
                  variant="destructive"
                  size="lg"
                  disabled={disableQRMutation.isPending}
                >
                  {disableQRMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="w-5 h-5 mr-2" />
                  )}
                  Disable
                </Button>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Best Results</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Print on standard letter-size (8.5" x 11") paper.</li>
                  <li>• Laminate or use a sheet protector for durability.</li>
                  <li>• Place in high-visibility areas where allowed.</li>
                  <li>• Test the QR code with your phone camera before displaying.</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-red-500">Could not generate the QR code. Please try again.</p>
              <Button onClick={generateSignpostImage} className="mt-4">
                Retry
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}