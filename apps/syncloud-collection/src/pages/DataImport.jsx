import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Database, FileCheck2, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { UploadFile, ExtractDataFromUploadedFile } from '@/integrations/Core';
import { Contact } from '@/entities/Contact';

const BATCH_SIZE = 100;

export default function DataImport() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, parsing, inserting, complete, error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'text/csv') {
          toast.error("Invalid file type. Please upload a CSV file.");
          return;
      }
      setFile(selectedFile);
      setStatus('idle');
      setProgress(0);
      setError(null);
      setProcessedCount(0);
      setTotalCount(0);
    }
  };

  const resetState = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setProcessedCount(0);
    setTotalCount(0);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file to import.");
      return;
    }

    setStatus('uploading');
    setProgress(10);
    toast.info("Starting file upload...");

    try {
      // Step 1: Upload the file to a staging area
      const { file_url } = await UploadFile({ file });
      setStatus('parsing');
      setProgress(30);
      toast.info("File uploaded successfully. Extracting data...");

      // Step 2: Use the backend to extract structured data from the file
      const contactSchema = Contact.schema();
      const extractionResult = await ExtractDataFromUploadedFile({
        file_url: file_url,
        json_schema: {
          type: "object",
          properties: {
            contacts: {
              type: "array",
              items: contactSchema,
            }
          }
        },
      });

      if (extractionResult.status !== 'success' || !extractionResult.output?.contacts) {
        throw new Error(extractionResult.details || "Failed to parse data from file. Please check the CSV format and column headers.");
      }
      
      const data = extractionResult.output.contacts;
      setTotalCount(data.length);
      setStatus('inserting');
      toast.info(`Found ${data.length} records. Starting database import...`);

      // Step 3: Insert the data in manageable batches
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        await Contact.bulkCreate(batch);
        
        const newProcessedCount = Math.min(i + BATCH_SIZE, data.length);
        setProcessedCount(newProcessedCount);
        setProgress(30 + Math.round((newProcessedCount / data.length) * 70));
      }

      setStatus('complete');
      setProgress(100);
      toast.success("Import completed successfully!");

    } catch (err) {
      console.error("Import failed:", err);
      setError(err.message);
      setStatus('error');
      toast.error("An error occurred during the import.");
    }
  };

  return (
    <div className="p-4 md:p-6 w-full flex justify-center items-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">CSV Data Import</CardTitle>
              <p className="text-muted-foreground text-sm">Upload and import contacts from a CSV file.</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'idle' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="csv-file" className="text-base font-medium">Select a CSV file</Label>
                <p className="text-sm text-muted-foreground mb-2">Ensure your CSV has columns: `full_name`, `email`, `phone`, `company`.</p>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
              </div>
              {file && (
                <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground flex items-center justify-between">
                  <span>Selected: <strong>{file.name}</strong></span>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Clear</Button>
                </div>
              )}
              <Button onClick={handleImport} disabled={!file} className="w-full" size="lg">
                <Upload className="mr-2 h-4 w-4" />
                Start Import
              </Button>
            </div>
          )}

          {status !== 'idle' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <div className="flex items-center gap-2">
                  {status === 'uploading' && <><Loader2 className="animate-spin h-4 w-4" /><span>Uploading file...</span></>}
                  {status === 'parsing' && <><Loader2 className="animate-spin h-4 w-4" /><span>Parsing data...</span></>}
                  {status === 'inserting' && <><Loader2 className="animate-spin h-4 w-4" /><span>Inserting records...</span></>}
                  {status === 'complete' && <><CheckCircle className="h-4 w-4 text-green-500" /><span>Import Complete!</span></>}
                  {status === 'error' && <><AlertCircle className="h-4 w-4 text-red-500" /><span>Import Failed</span></>}
                </div>
                {totalCount > 0 && <span>{processedCount} / {totalCount}</span>}
              </div>
              <Progress value={progress} className="w-full" />

              {status === 'error' && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}
              
              {(status === 'complete' || status === 'error') && (
                <Button onClick={resetState} variant="outline" className="w-full">
                  <FileCheck2 className="mr-2 h-4 w-4" />
                  Import Another File
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}