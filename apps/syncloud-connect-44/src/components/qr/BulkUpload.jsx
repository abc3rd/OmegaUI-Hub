import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function BulkUpload({ onSuccess }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResults(null);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const downloadTemplate = () => {
    const template = 'label,command_payload,redirect_url\n"Product Demo","UCP::COMMAND EXECUTE ID=demo","https://example.com/demo"\n"Event Check-in","UCP::EVENT CHECKIN ID=evt123","https://example.com/event"';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsProcessing(true);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract data using Base44 integration
      const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: file_url,
        json_schema: {
          type: 'object',
          properties: {
            records: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  command_payload: { type: 'string' },
                  redirect_url: { type: 'string' }
                },
                required: ['label', 'command_payload']
              }
            }
          }
        }
      });

      if (extractResult.status === 'error') {
        throw new Error(extractResult.details || 'Failed to parse CSV');
      }

      const records = extractResult.output?.records || extractResult.output;
      
      if (!Array.isArray(records) || records.length === 0) {
        throw new Error('No valid records found in CSV');
      }

      // Create QR codes in bulk
      const created = [];
      const failed = [];

      for (const record of records) {
        try {
          const qrCode = await base44.entities.QRCode.create({
            label: record.label,
            command_payload: record.command_payload,
            redirect_url: record.redirect_url || '',
            status: 'active'
          });
          created.push(qrCode);
        } catch (err) {
          failed.push({ record, error: err.message });
        }
      }

      setResults({ created, failed, total: records.length });
      
      if (created.length > 0) {
        toast.success(`Successfully created ${created.length} QR code${created.length > 1 ? 's' : ''}`);
        if (onSuccess) onSuccess();
      }
      
      if (failed.length > 0) {
        toast.error(`${failed.length} QR code${failed.length > 1 ? 's' : ''} failed to create`);
      }

    } catch (error) {
      toast.error(error.message || 'Failed to process CSV');
      console.error('Bulk upload error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Bulk Upload QR Codes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">CSV Format Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Must include columns: label, command_payload</li>
                <li>Optional column: redirect_url</li>
                <li>First row must be headers</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template
          </Button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>Select CSV File</span>
            </Button>
          </label>
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {file.name}
            </p>
          )}
        </div>

        {file && (
          <Button
            onClick={handleUpload}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-[#ea00ea] to-[#2699fe]"
          >
            {isProcessing ? 'Processing...' : 'Upload & Create QR Codes'}
          </Button>
        )}

        {results && (
          <div className="border rounded-lg p-4 space-y-2">
            <h4 className="font-semibold">Upload Results</h4>
            <div className="text-sm space-y-1">
              <p>Total records: {results.total}</p>
              <p className="text-green-600">✓ Successfully created: {results.created.length}</p>
              {results.failed.length > 0 && (
                <p className="text-red-600">✗ Failed: {results.failed.length}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}