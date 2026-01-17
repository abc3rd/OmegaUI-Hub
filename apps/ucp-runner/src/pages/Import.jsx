import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Upload, 
  FileJson, 
  AlertCircle, 
  CheckCircle,
  Clipboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PacketRepo, initDB } from '@/components/ucp/UCPDatabase';
import { validatePacket } from '@/components/ucp/UCPEngine';

export default function Import() {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleValidateAndImport = async () => {
    setError(null);
    setValidationResult(null);
    setImporting(true);

    try {
      // Parse JSON
      let packet;
      try {
        packet = JSON.parse(jsonInput);
      } catch (e) {
        throw new Error('Invalid JSON syntax: ' + e.message);
      }

      // Validate packet structure
      const validation = validatePacket(packet);
      if (!validation.valid) {
        setValidationResult({ valid: false, errors: validation.errors });
        setImporting(false);
        return;
      }

      // Save to database
      await initDB();
      await PacketRepo.insert(packet);

      setValidationResult({ valid: true });
      
      // Navigate to packet detail
      setTimeout(() => {
        navigate(createPageUrl(`PacketDetail?packetId=${packet.id}`));
      }, 500);

    } catch (e) {
      setError(e.message);
    }
    
    setImporting(false);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
      setError(null);
      setValidationResult(null);
    } catch (e) {
      setError('Failed to read clipboard');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJsonInput(event.target.result);
        setError(null);
        setValidationResult(null);
      };
      reader.readAsText(file);
    } else {
      setError('Please drop a JSON file');
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const samplePacket = {
    ucp_version: "0.1",
    id: "pkt_my_custom_001",
    ttl_seconds: 86400,
    required_drivers: ["http", "notify"],
    permissions: ["network", "notifications"],
    meta: { name: "My Custom Packet", owner: "Your Name" },
    ops: [
      {
        op: "notify.show",
        id: "greeting",
        args: { title: "Hello", body: "Packet executed!" }
      }
    ],
    signature: null
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Import Packet</h1>
              <p className="text-sm text-slate-400">Paste or drop UCP packet JSON</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Drop Zone / Input Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-xl border-2 border-dashed transition-all ${
            isDragging 
              ? 'border-cyan-400 bg-cyan-500/10' 
              : 'border-slate-700 bg-slate-800/30'
          }`}
        >
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-xl z-10">
              <div className="text-center">
                <Upload className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                <p className="text-cyan-400 font-medium">Drop JSON file here</p>
              </div>
            </div>
          )}

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileJson className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">Packet JSON</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePaste}
                className="text-slate-400 hover:text-white"
              >
                <Clipboard className="w-4 h-4 mr-1" />
                Paste
              </Button>
            </div>

            <Textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setError(null);
                setValidationResult(null);
              }}
              placeholder="Paste your UCP packet JSON here..."
              className="min-h-[300px] font-mono text-sm bg-slate-900 border-slate-700 text-slate-300 placeholder:text-slate-600 resize-none"
            />

            <p className="text-xs text-slate-500 mt-2">
              Drag and drop a .json file, or paste JSON directly
            </p>
          </div>
        </div>

        {/* Validation Result */}
        {validationResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border ${
              validationResult.valid 
                ? 'bg-emerald-500/10 border-emerald-500/30' 
                : 'bg-rose-500/10 border-rose-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              {validationResult.valid ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5" />
              )}
              <div>
                <h4 className={`font-medium ${validationResult.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {validationResult.valid ? 'Packet Valid!' : 'Validation Failed'}
                </h4>
                {validationResult.errors && (
                  <ul className="mt-2 space-y-1">
                    {validationResult.errors.map((err, i) => (
                      <li key={i} className="text-sm text-rose-300">• {err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-rose-400">Error</h4>
                <p className="text-sm text-rose-300 mt-1">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Import Button */}
        <Button
          onClick={handleValidateAndImport}
          disabled={!jsonInput.trim() || importing}
          className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-semibold py-6 text-lg"
        >
          {importing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              >
                <Upload className="w-5 h-5 mr-2" />
              </motion.div>
              Validating...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Validate & Import
            </>
          )}
        </Button>

        {/* Sample Packet */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Sample Packet Structure</h3>
          <pre className="text-xs text-slate-400 bg-slate-900 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(samplePacket, null, 2)}
          </pre>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setJsonInput(JSON.stringify(samplePacket, null, 2));
              setError(null);
              setValidationResult(null);
            }}
            className="mt-3 text-cyan-400 hover:text-cyan-300"
          >
            Use Sample
          </Button>
        </div>
      </main>
    </div>
  );
}