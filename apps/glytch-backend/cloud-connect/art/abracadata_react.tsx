import React, { useState, useEffect } from 'react';

const AbracadataAIArt = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [quality, setQuality] = useState('standard');
  const [creativity, setCreativity] = useState(7);
  const [batchSize, setBatchSize] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationQueue, setGenerationQueue] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [stats, setStats] = useState({
    totalGenerated: 0,
    favoritesCount: 0,
    avgTime: 0,
    creditsRemaining: 100
  });

  const styles = [
    { id: 'realistic', icon: '📸', name: 'Realistic' },
    { id: 'anime', icon: '🎌', name: 'Anime' },
    { id: 'digital', icon: '💻', name: 'Digital Art' },
    { id: 'oil', icon: '🖼️', name: 'Oil Painting' },
    { id: 'watercolor', icon: '🎨', name: 'Watercolor' },
    { id: 'sketch', icon: '✏️', name: 'Sketch' }
  ];

  const inspirations = [
    "A mystical forest with glowing mushrooms, ethereal lighting",
    "Cyberpunk cityscape at night, neon lights, rain",
    "Majestic mountain landscape, golden hour, mist",
    "Portrait of a wise old wizard, magical aura",
    "Underwater palace with coral gardens, tropical fish"
  ];

  const generateArt = async () => {
    if (!prompt.trim()) {
      alert('Please enter a prompt to generate art!');
      return;
    }

    if (stats.creditsRemaining <= 0) {
      alert('No credits remaining! Please upgrade your plan.');
      return;
    }

    const queueItem = {
      id: Date.now(),
      prompt: prompt,
      style: selectedStyle || 'digital',
      aspectRatio,
      quality,
      creativity,
      batchSize: parseInt(batchSize),
      status: 'generating'
    };

    setGenerationQueue(prev => [...prev, queueItem]);
    setIsGenerating(true);
    setProgress(0);

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          completeGeneration(queueItem);
          return 100;
        }
        return newProgress;
      });
    }, 500);

    // Send to GHL for tracking
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ghl-ai-art-generation',
        prompt: prompt,
        style: selectedStyle,
        batchSize: batchSize,
        timestamp: new Date().toISOString()
      }, '*');
    }
  };

  const completeGeneration = (queueItem) => {
    // Update queue item status
    setGenerationQueue(prev => 
      prev.map(item => 
        item.id === queueItem.id ? { ...item, status: 'complete' } : item
      )
    );

    // Add to gallery
    const newGalleryItems = [];
    for (let i = 0; i < queueItem.batchSize; i++) {
      newGalleryItems.push({
        id: Date.now() + i,
        prompt: queueItem.prompt,
        style: queueItem.style,
        timestamp: new Date().toISOString()
      });
    }

    setGalleryItems(prev => [...newGalleryItems, ...prev]);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalGenerated: prev.totalGenerated + queueItem.batchSize,
      creditsRemaining: Math.max(0, prev.creditsRemaining - queueItem.batchSize),
      avgTime: 15 + Math.random() * 10
    }));

    // Reset generation state
    setTimeout(() => {
      setIsGenerating(false);
      setProgress(0);
    }, 1000);

    // Remove from queue after delay
    setTimeout(() => {
      setGenerationQueue(prev => prev.filter(item => item.id !== queueItem.id));
    }, 3000);
  };

  const useInspiration = (inspirationText) => {
    setPrompt(inspirationText);
  };

  const viewImage = (imageId) => {
    alert(`Opening full-size view for image ${imageId}`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-500/30 text-gray-400';
      case 'generating': return 'bg-yellow-500/30 text-yellow-400 animate-pulse';
      case 'complete': return 'bg-green-500/30 text-green-400';
      default: return 'bg-gray-500/30 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white">
      <div className="max-w-7xl mx-auto px-5 py-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-3xl flex items-center justify-center text-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-spin"></div>
              🎨
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Abracadata AI Art
            </h1>
          </div>
          <p className="text-xl opacity-90">Generate Stunning AI Artwork with Advanced Stable Diffusion</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Prompt Section */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 text-center text-pink-400">✨ Create Your Masterpiece</h2>
              
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vision... e.g., 'A majestic dragon soaring over a mystical forest at sunset, digital art, highly detailed, trending on artstation'"
                className="w-full h-32 p-4 bg-white/10 border border-white/30 rounded-2xl text-white placeholder-white/60 resize-none focus:border-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400/30 mb-6"
              />

              {/* Style Selector */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {styles.map((style) => (
                  <div
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-xl text-center cursor-pointer transition-all duration-300 border ${
                      selectedStyle === style.id
                        ? 'bg-pink-500/30 border-pink-400 transform -translate-y-1 shadow-lg'
                        : 'bg-white/10 border-white/20 hover:bg-white/20 hover:transform hover:-translate-y-1'
                    }`}
                  >
                    <div className="text-2xl mb-2">{style.icon}</div>
                    <div className="text-sm font-medium">{style.name}</div>
                  </div>
                ))}
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">Aspect Ratio</label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-xl text-white focus:border-pink-400 focus:outline-none"
                  >
                    <option value="1:1" className="bg-gray-800">Square (1:1)</option>
                    <option value="16:9" className="bg-gray-800">Landscape (16:9)</option>
                    <option value="9:16" className="bg-gray-800">Portrait (9:16)</option>
                    <option value="4:3" className="bg-gray-800">Standard (4:3)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Quality</label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-xl text-white focus:border-pink-400 focus:outline-none"
                  >
                    <option value="standard" className="bg-gray-800">Standard</option>
                    <option value="high" className="bg-gray-800">High Quality</option>
                    <option value="ultra" className="bg-gray-800">Ultra HD</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Creativity: {creativity}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={creativity}
                    onChange={(e) => setCreativity(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Batch Size</label>
                  <select
                    value={batchSize}
                    onChange={(e) => setBatchSize(parseInt(e.target.value))}
                    className="w-full p-3 bg-white/10 border border-white/30 rounded-xl text-white focus:border-pink-400 focus:outline-none"
                  >
                    <option value={1} className="bg-gray-800">1 Image</option>
                    <option value={2} className="bg-gray-800">2 Images</option>
                    <option value={4} className="bg-gray-800">4 Images</option>
                    <option value={8} className="bg-gray-800">8 Images</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateArt}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-full transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-6"
              >
                {isGenerating ? '🎨 Generating...' : '🎨 Generate Art'}
              </button>

              {/* Progress Bar */}
              {isGenerating && (
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Gallery */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-semibold mb-6 text-center text-pink-400">🖼️ Your Art Gallery</h2>
              
              {galleryItems.length === 0 ? (
                <div className="text-center py-16 opacity-70">
                  <div className="text-6xl mb-4">🎨</div>
                  <div>Your generated artwork will appear here</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => viewImage(item.id)}
                      className="bg-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-2 hover:shadow-xl"
                    >
                      <div className="h-48 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-4xl">
                        🖼️
                      </div>
                      <div className="p-4">
                        <div className="font-medium text-sm mb-2 truncate">{item.prompt}</div>
                        <div className="text-xs opacity-70">{item.style} style</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Generation Queue */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-pink-400">🎯 Generation Queue</h3>
              {generationQueue.length === 0 ? (
                <div className="text-center opacity-70 py-8">No pending generations</div>
              ) : (
                <div className="space-y-3">
                  {generationQueue.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                      <div className="flex-1 text-sm truncate mr-3">
                        {item.prompt.substring(0, 30)}...
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusStyle(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prompt Inspiration */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-pink-400">💡 Prompt Inspiration</h3>
              <div className="space-y-2">
                {inspirations.map((inspiration, index) => (
                  <div
                    key={index}
                    onClick={() => useInspiration(inspiration)}
                    className="p-3 bg-white/5 rounded-xl cursor-pointer transition-all hover:bg-white/10 text-sm italic"
                  >
                    "{inspiration}"
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4 text-pink-400">📊 Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-white/5 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-pink-400">{stats.totalGenerated}</div>
                  <div className="text-xs opacity-70 mt-1">Total Generated</div>
                </div>
                <div className="text-center bg-white/5 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-pink-400">{stats.favoritesCount}</div>
                  <div className="text-xs opacity-70 mt-1">Favorites</div>
                </div>
                <div className="text-center bg-white/5 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-pink-400">{stats.avgTime.toFixed(1)}s</div>
                  <div className="text-xs opacity-70 mt-1">Avg Time</div>
                </div>
                <div className="text-center bg-white/5 p-4 rounded-xl">
                  <div className="text-2xl font-bold text-pink-400">{stats.creditsRemaining}</div>
                  <div className="text-xs opacity-70 mt-1">Credits Left</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbracadataAIArt;