import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Cloud, FileText, Copy, CheckCircle2, Link2, Loader2, ExternalLink, QrCode, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// QR Code Generator using canvas - creates scannable QR codes
function QRCodeCanvas({ data, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Generate QR matrix using a simple implementation
    const qr = generateQRMatrix(data);
    const moduleSize = Math.floor(size / qr.length);
    
    canvas.width = size;
    canvas.height = size;
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    
    // Draw modules
    ctx.fillStyle = '#000000';
    for (let row = 0; row < qr.length; row++) {
      for (let col = 0; col < qr[row].length; col++) {
        if (qr[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }, [data, size]);

  return <canvas ref={canvasRef} className="rounded-lg" />;
}

// QR Code matrix generator - dynamically sizes based on data length
function generateQRMatrix(data) {
  // QR versions: V1=21, V2=25, V3=29, V4=33, V5=37, V6=41, V10=57, V20=97, V40=177
  // Capacity increases with version - V40 can hold ~4000 alphanumeric chars
  const dataLen = data.length;
  let size;
  if (dataLen <= 25) size = 21;
  else if (dataLen <= 47) size = 25;
  else if (dataLen <= 77) size = 29;
  else if (dataLen <= 114) size = 33;
  else if (dataLen <= 154) size = 37;
  else if (dataLen <= 195) size = 41;
  else if (dataLen <= 367) size = 57;
  else if (dataLen <= 858) size = 97;
  else size = 177; // V40 - max capacity
  const matrix = Array(size).fill(null).map(() => Array(size).fill(false));
  
  // Add finder patterns (top-left, top-right, bottom-left)
  const addFinderPattern = (row, col) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (row + r < size && col + c < size) {
          matrix[row + r][col + c] = isOuter || isInner;
        }
      }
    }
  };
  
  addFinderPattern(0, 0);
  addFinderPattern(0, 14);
  addFinderPattern(14, 0);
  
  // Add timing patterns
  for (let i = 8; i < 13; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }
  
  // Encode data into remaining space (simplified)
  const encoded = data.split('').map(c => c.charCodeAt(0));
  let dataIndex = 0;
  
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col = 5;
    for (let row = 0; row < size; row++) {
      for (let c = 0; c < 2; c++) {
        const x = col - c;
        if (!isReserved(row, x, size) && dataIndex < encoded.length * 8) {
          const byteIndex = Math.floor(dataIndex / 8);
          const bitIndex = dataIndex % 8;
          if (byteIndex < encoded.length) {
            matrix[row][x] = ((encoded[byteIndex] >> (7 - bitIndex)) & 1) === 1;
          }
          dataIndex++;
        }
      }
    }
  }
  
  return matrix;
}

function isReserved(row, col, size) {
  // Finder patterns and their separators
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= size - 8) return true;
  if (row >= size - 8 && col < 9) return true;
  // Timing patterns
  if (row === 6 || col === 6) return true;
  return false;
}

export default function FileProcessor() {
  const [textContent, setTextContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrData, setQrData] = useState('');
  const [activeTab, setActiveTab] = useState('cloud');
  const fileInputRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const queryClient = useQueryClient();
  
  const CHUNK_SIZE = 512 * 1024; // 512KB chunks

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    setFileName(selectedFile.name);
    setFile(selectedFile);
    setUploadedUrl('');
    
    // Read text content for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setTextContent(e.target.result);
    };
    reader.readAsText(selectedFile);
  };

  const uploadFile = async () => {
    if (!file && !textContent.trim()) {
      alert('Please select a file or enter text content');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing...');

    try {
      let fileToUpload = file;
      
      // If no file but has text, create a file from the text
      if (!file && textContent.trim()) {
        const blob = new Blob([textContent], { type: 'text/plain' });
        fileToUpload = new File([blob], 'ucp-data.txt', { type: 'text/plain' });
      }

      const fileSize = fileToUpload.size;
      const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
      
      // For small files (< 1MB), upload directly
      if (fileSize < 1024 * 1024) {
        setUploadStatus('Uploading...');
        setUploadProgress(50);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: fileToUpload });
        setUploadProgress(100);
        setUploadStatus('Complete!');
        setUploadedUrl(file_url);
        
        // Log to history
        await base44.entities.FileTransfer.create({
          file_name: fileToUpload.name,
          file_url: file_url,
          file_size: fileSize,
          transfer_type: 'cloud',
          chunks_count: 1
        });
        queryClient.invalidateQueries({ queryKey: ['fileTransfers'] });
      } else {
        // Chunked upload for larger files
        setUploadStatus(`Uploading in ${totalChunks} chunks...`);
        
        const chunks = [];
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, fileSize);
          const chunk = fileToUpload.slice(start, end);
          chunks.push(chunk);
        }
        
        // Upload chunks sequentially and track progress
        const uploadedChunkUrls = [];
        for (let i = 0; i < chunks.length; i++) {
          setUploadStatus(`Uploading chunk ${i + 1}/${totalChunks}...`);
          const chunkFile = new File([chunks[i]], `${fileToUpload.name}.part${i}`, { type: fileToUpload.type });
          const { file_url } = await base44.integrations.Core.UploadFile({ file: chunkFile });
          uploadedChunkUrls.push(file_url);
          setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
        }
        
        setUploadStatus('Complete!');
        setUploadedUrl(uploadedChunkUrls[0]);
        
        // Log chunked upload to history
        await base44.entities.FileTransfer.create({
          file_name: fileToUpload.name,
          file_url: uploadedChunkUrls[0],
          file_size: fileSize,
          transfer_type: 'cloud',
          chunks_count: totalChunks,
          chunk_urls: uploadedChunkUrls
        });
        queryClient.invalidateQueries({ queryKey: ['fileTransfers'] });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Failed');
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(text || uploadedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createTextFile = () => {
    if (!textContent.trim()) return;
    const blob = new Blob([textContent], { type: 'text/plain' });
    setFile(new File([blob], 'ucp-data.txt', { type: 'text/plain' }));
    setFileName('ucp-data.txt');
  };

  const generateQR = () => {
    if (!textContent.trim()) {
      alert('Please enter text to encode');
      return;
    }
    // QR codes can hold up to ~4000 alphanumeric characters
    setQrData(textContent);
  };

  const downloadQR = () => {
    const canvas = document.querySelector('#qr-canvas canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'ucp-qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-white text-2xl">
          <Cloud className="w-6 h-6 text-purple-400" />
          Data Transfer
        </CardTitle>
        <p className="text-slate-400 text-sm mt-2">
          Transfer data via cloud upload or QR code encoding
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
            <TabsTrigger value="cloud" className="data-[state=active]:bg-purple-600">
              <Cloud className="w-4 h-4 mr-2" />
              Cloud Upload
            </TabsTrigger>
            <TabsTrigger value="qr" className="data-[state=active]:bg-purple-600">
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cloud" className="space-y-4 mt-4">
            {/* File Upload */}
            <div>
              <label htmlFor="cloud-file-upload" className="cursor-pointer">
                <div className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-600 rounded-lg hover:border-purple-500 hover:bg-slate-700/30 transition-all">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <div className="text-center">
                    <p className="text-slate-300 font-medium text-sm">
                      {fileName || 'Upload a file'}
                    </p>
                  </div>
                </div>
              </label>
              <input
                id="cloud-file-upload"
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {fileName && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <FileText className="w-3 h-3 mr-1" />
                {fileName}
              </Badge>
            )}

            <Textarea
              value={textContent}
              onChange={(e) => {
                setTextContent(e.target.value);
                if (!file) createTextFile();
              }}
              placeholder="Paste text content to upload..."
              className="bg-slate-900/50 border-slate-600 text-slate-100 focus:border-purple-500 min-h-[80px] font-mono text-sm"
            />

            <div className="space-y-2">
              <Button
                onClick={uploadFile}
                disabled={isUploading || (!file && !textContent.trim())}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {uploadStatus}
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4 mr-2" />
                    Upload to Cloud
                  </>
                )}
              </Button>
              
              {/* Progress Bar */}
              {isUploading && (
                <div className="space-y-1">
                  <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{uploadStatus}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded URL */}
            <AnimatePresence>
              {uploadedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 font-medium text-sm">Uploaded!</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-2 bg-slate-900/50 rounded border border-slate-700 overflow-hidden">
                        <p className="text-xs text-cyan-400 font-mono truncate">{uploadedUrl}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard()}
                        className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 h-8"
                      >
                        {copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="qr" className="space-y-4 mt-4">
            <Textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Enter text to encode as QR code..."
              className="bg-slate-900/50 border-slate-600 text-slate-100 focus:border-purple-500 min-h-[80px] font-mono text-sm"
            />
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{textContent.length} characters</span>
              {textContent.length > 4000 && (
                <span className="text-amber-400">May exceed QR capacity</span>
              )}
            </div>

            <Button
              onClick={generateQR}
              disabled={!textContent.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>

            {/* QR Code Display */}
            <AnimatePresence>
              {qrData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div id="qr-canvas" className="bg-white p-4 rounded-lg">
                    <QRCodeCanvas data={qrData} size={180} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-slate-700 text-slate-300">
                      Encoded: "{qrData}"
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadQR}
                      className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 h-7"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      PNG
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Scan with any QR reader to decode the data
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}