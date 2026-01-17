import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { removeBackground } from '@/functions/removeBackground';
import ImageUpload from '../components/image_editor/ImageUpload';
import ToolPanel from '../components/image_editor/ToolPanel';

export default function ImageEditor() {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const [gradientState, setGradientState] = useState({
    color1: '#667eea',
    color2: '#764ba2',
    direction: '135deg',
  });

  const drawImageToCanvas = useCallback((image) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  }, []);

  useEffect(() => {
    if (processedImage) {
      drawImageToCanvas(processedImage);
    } else if (originalImage) {
      drawImageToCanvas(originalImage);
    }
  }, [originalImage, processedImage, drawImageToCanvas]);
  
  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setProcessedImage(null);
        toast.success('Image uploaded successfully!');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!originalImage) {
      toast.error('Please upload an image first.');
      return;
    }
    
    setIsProcessing(true);
    toast.info('Removing background... This may take a moment.');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(originalImage, 0, 0);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      
      const formData = new FormData();
      formData.append('image_file', blob, 'image.png');

      const response = await removeBackground(formData);
      
      if (response.data instanceof Blob) {
        const url = URL.createObjectURL(response.data);
        const img = new Image();
        img.onload = () => {
          setProcessedImage(img);
          toast.success('Background removed successfully!');
          URL.revokeObjectURL(url);
        };
        img.src = url;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Background removal error:', error);
      toast.error('Failed to remove background. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddGradient = () => {
    const canvas = canvasRef.current;
    const image = processedImage || originalImage;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    const { color1, color2, direction } = gradientState;
    
    // Create gradient background first
    let grad;
    if (direction === 'to right') {
      grad = ctx.createLinearGradient(0, 0, width, 0);
    } else if (direction === 'to bottom') {
      grad = ctx.createLinearGradient(0, 0, 0, height);
    } else if (direction === '45deg') {
      grad = ctx.createLinearGradient(0, height, width, 0);
    } else { // 135deg
      grad = ctx.createLinearGradient(0, 0, width, height);
    }
    
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    
    // Fill with gradient background
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    
    // Draw the image on top
    ctx.drawImage(image, 0, 0);
    toast.success('Gradient background applied!');
  };
  
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'edited-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Image downloaded successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Image Editor</h1>
            <p className="text-slate-600">Enhance your images with AI tools and creative effects</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {originalImage ? (
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                <div className="flex items-center justify-center">
                  <canvas 
                    ref={canvasRef} 
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <ImageUpload onImageUpload={handleImageUpload} isUploading={isProcessing} />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <ToolPanel
              onRemoveBackground={handleRemoveBackground}
              onAddGradient={handleAddGradient}
              onDownload={handleDownload}
              isProcessing={isProcessing}
              gradientState={gradientState}
              setGradientState={setGradientState}
              hasImage={!!originalImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}