import React, { useState, useRef, useCallback } from 'react';

const OmniformProcessor = () => {
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  const [fileQueue, setFileQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({
    filesProcessed: 0,
    totalSavings: 0,
    avgTime: 0,
    successRate: 100
  });
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, icon: '📸', text: 'Background removed from image.jpg' },
    { id: 2, icon: '🎬', text: 'Video converted to MP4' },
    { id: 3, icon: '📝', text: 'Text extracted from document.pdf' }
  ]);

  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const capabilities = [
    { icon: '🖼️', title: 'Background Removal', desc: 'AI-powered background removal for images' },
    { icon: '🔄', title: 'Format Conversion', desc: 'Convert between 200+ file formats' },
    { icon: '🗜️', title: 'Compression', desc: 'Reduce file sizes without quality loss' },
    { icon: '📐', title: 'Vectorization', desc: 'Convert raster images to vectors' },
    { icon: '📝', title: 'OCR Text', desc: 'Extract text from images and PDFs' },
    { icon: '🎬', title: 'Video Processing', desc: 'Edit, convert, and compress videos' }
  ];

  const processingOptions = [
    { id: 'background', icon: '🖼️', label: 'Remove Background' },
    { id: 'compress', icon: '🗜️', label: 'Compress' },
    { id: 'convert', icon: '🔄', label: 'Convert Format' },
    { id: 'vectorize', icon: '📐', label: 'Vectorize' },
    { id: 'ocr', icon: '📝', label: 'Extract Text' },
    { id: 'enhance', icon: '✨', label: 'Enhance' }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addFilesToQueue(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      addFilesToQueue(e.target.files);
    }
  };

  const addFilesToQueue = (files) => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending'
    }));
    
    setFileQueue(prev => [...prev, ...newFiles]);
  };

  const toggleOption = (optionId) => {
    setSelectedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(optionId)) {
        newSet.delete(optionId);
      } else {
        newSet.add(optionId);
      }
      return newSet;
    });
  };

  const addToRecentActivity = (fileObj, options) => {
    const optionIcons = {
      background: '🖼️',
      compress: '🗜️',
      convert: '🔄',
      vectorize: '📐',
      ocr: '📝',
      enhance: '✨'
    };
    
    let actionText = 'File processed';
    if (options.has('background')) actionText = 'Background removed';
    else if (options.has('compress')) actionText = 'File compressed';
    else if (options.has('convert')) actionText = 'Format converted';
    else if (options.has('vectorize')) actionText = 'Image vectorized';
    else if (options.has('ocr')) actionText = 'Text extracted';
    else if (options.has('enhance')) actionText = 'Image enhanced';
    
    const icon = Array.from(options)[0] ? optionIcons[Array.from(options)[0]] : '📁';
    
    const newActivity = {
      id: Date.now(),
      icon,
      text: `${actionText} - ${fileObj.name}`
    };
    
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 4)]);
  };

  const processFiles = async () => {
    if (fileQueue.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const totalFiles = fileQueue.length;
    
    for (let i = 0; i < fileQueue.length; i++) {
      const fileObj = fileQueue[i];
      
      // Update file status to processing
      setFileQueue(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: 'processing' } : f
      ));
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      // Random success/failure (95% success rate)
      const success = Math.random() > 0.05;
      const newStatus = success ? 'complete' : 'error';
      
      setFileQueue(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, status: newStatus } : f
      ));
      
      if (success) {
        setStats(prev => ({
          ...prev,
          filesProcessed: prev.filesProcessed + 1,
          totalSavings: prev.totalSavings + Math.random() * 5,
          avgTime: 2 + Math.random() * 3
        }));
        
        addToRecentActivity(fileObj, selectedOptions);
        
        // Send to GHL for tracking
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'ghl-file-processed',
            fileName: fileObj.name,
            options: Array.from(selectedOptions),
            timestamp: new Date().toISOString()
          }, '*');
        }
      }
      
      setProgress(((i + 1) / totalFiles) * 100);
    }
    
    // Reset after processing
    setTimeout(() => {
      setFileQueue([]);
      setSelectedOptions(new Set());
      setIsProcessing(false);
      setProgress(0);
    }, 2000);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/30 text-gray-400';
      case 'processing': return 'bg-yellow-500/30 text-yellow-400';
      case 'complete': return 'bg-green-500/30 text-green-400';
      case 'error': return 'bg-red-500/30 text-red-400';
      default: return 'bg-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white">
      <div className="max-w-7xl mx-auto px-5 py-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center text-3xl animate-pulse">
              ⚡
            </div>
            <h1 className="text-4xl font-bold">Omniform Processor</h1>
          </div>
          <p className="text-xl opacity-90 mb-8">Universal File Processing Service</p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {capabilities.map((capability, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/20 transition-all duration-300 hover:transform hover:-translate-y-2 hover:bg-white/15">
              <div className="text-3xl mb-4">{capability.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{capability.title}</h3>
              <p className="text-sm opacity-80">{capability.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Section */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-6 text-center">📁 Upload & Process Files</h2>
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-6 ${
                dragActive 
                  ? 'border-yellow-400 bg-yellow-400/20' 
                  : 'border-white/40 hover:border-yellow-400 hover:bg-yellow-400/10'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-5xl mb-4 opacity-70">📤</div>
              <div className="text-xl mb-2">Drop files here or click to browse</div>
              <div className="text-sm opacity-70">Supports images, videos, audio, documents, and more</div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            
            {/* Processing Options */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {processingOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-300 border ${
                    selectedOptions.has(option.id)
                      ? 'bg-yellow-400/30 border-yellow-400 transform -translate-y-1'
                      : 'bg-white/10 border-white/20 hover:bg-white/20 hover:transform hover:-translate-y-1'
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </div>
              ))}
            </div>
            
            {/* Process Button */}
            <button
              onClick={processFiles}
              disabled={fileQueue.length === 0 || isProcessing}
              className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold rounded-full transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? '🚀 Processing...' : '🚀 Process Files'}
            </button>
            
            {/* Progress Bar */}
            {isProcessing && (
              <div className="mt-6">
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* File Queue */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">📋 Processing Queue</h3>
              <div className="max-h-48 overflow-y-auto">
                {fileQueue.length === 0 ? (
                  <div className="text-center opacity-70 py-8">No files in queue</div>
                ) : (
                  fileQueue.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{file.name}</div>
                        <div className="text-xs opacity-70">{formatFileSize(file.size)}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(file.status)}`}>
                        {file.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Statistics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">📊 Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.filesProcessed}</div>
                  <div className="text-xs opacity-70 mt-1">Files Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.totalSavings.toFixed(1)}MB</div>
                  <div className="text-xs opacity-70 mt-1">Space Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.avgTime.toFixed(1)}s</div>
                  <div className="text-xs opacity-70 mt-1">Avg Process Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{stats.successRate}%</div>
                  <div className="text-xs opacity-70 mt-1">Success Rate</div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">🕐 Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                    <div className="text-lg">{activity.icon}</div>
                    <div className="text-sm">{activity.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmniformProcessor;