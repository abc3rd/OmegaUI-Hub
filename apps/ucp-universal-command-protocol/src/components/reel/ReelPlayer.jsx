import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

import Scene1Hook from './scenes/Scene1Hook';
import Scene2Problem from './scenes/Scene2Problem';
import Scene3Breakthrough from './scenes/Scene3Breakthrough';
import Scene4Speed from './scenes/Scene4Speed';
import Scene5Packet from './scenes/Scene5Packet';
import Scene6MultiAI from './scenes/Scene6MultiAI';
import Scene7Offline from './scenes/Scene7Offline';
import Scene8ROI from './scenes/Scene8ROI';
import Scene9CTA from './scenes/Scene9CTA';

const scenes = [
  { id: 1, component: Scene1Hook, duration: 2000, label: 'Hook' },
  { id: 2, component: Scene2Problem, duration: 3000, label: 'Problem' },
  { id: 3, component: Scene3Breakthrough, duration: 3000, label: 'Breakthrough' },
  { id: 4, component: Scene4Speed, duration: 5000, label: 'Speed & Cost' },
  { id: 5, component: Scene5Packet, duration: 4000, label: 'The Packet' },
  { id: 6, component: Scene6MultiAI, duration: 5000, label: 'Multi-AI' },
  { id: 7, component: Scene7Offline, duration: 4000, label: 'Offline' },
  { id: 8, component: Scene8ROI, duration: 4000, label: 'ROI' },
  { id: 9, component: Scene9CTA, duration: 5000, label: 'CTA' },
];

export default function ReelPlayer() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const goToScene = useCallback((index) => {
    setCurrentScene(Math.max(0, Math.min(index, scenes.length - 1)));
    setProgress(0);
  }, []);

  const nextScene = useCallback(() => {
    if (currentScene < scenes.length - 1) {
      goToScene(currentScene + 1);
    } else {
      goToScene(0);
    }
  }, [currentScene, goToScene]);

  const prevScene = useCallback(() => {
    goToScene(currentScene - 1);
  }, [currentScene, goToScene]);

  useEffect(() => {
    if (!isPlaying) return;

    const scene = scenes[currentScene];
    const interval = 50;
    const steps = scene.duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setProgress((step / steps) * 100);
      
      if (step >= steps) {
        nextScene();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentScene, isPlaying, nextScene]);

  const CurrentSceneComponent = scenes[currentScene].component;

  return (
    <div className="relative w-full max-w-[390px] mx-auto">
      {/* Phone frame */}
      <div 
        className="relative rounded-[3rem] overflow-hidden"
        style={{
          aspectRatio: '9/16',
          background: 'linear-gradient(145deg, #0a0a0f, #12121a)',
          boxShadow: '0 0 60px rgba(234, 0, 234, 0.15), 0 0 120px rgba(38, 153, 254, 0.1)',
          border: '3px solid #1a1a2e',
        }}
      >
        {/* Notch */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 rounded-b-2xl z-20"
          style={{ background: '#0a0a0f' }}
        />

        {/* Scene container */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <CurrentSceneComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
          <motion.div
            className="h-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #ea00ea, #2699fe)',
            }}
          />
        </div>

        {/* Scene indicators */}
        <div className="absolute top-10 left-0 right-0 flex justify-center gap-1 px-4 z-20">
          {scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => goToScene(i)}
              className="flex-1 h-1 rounded-full transition-all"
              style={{
                background: i === currentScene 
                  ? 'linear-gradient(90deg, #ea00ea, #2699fe)'
                  : i < currentScene 
                    ? '#ea00ea' 
                    : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={prevScene}
          className="rounded-full border-white/20 hover:bg-white/10"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsPlaying(!isPlaying)}
          className="rounded-full w-14 h-14 border-[#ea00ea] hover:bg-[#ea00ea]/20"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-[#ea00ea]" />
          ) : (
            <Play className="w-6 h-6 text-[#ea00ea] ml-1" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={nextScene}
          className="rounded-full border-white/20 hover:bg-white/10"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => goToScene(0)}
          className="rounded-full border-white/20 hover:bg-white/10"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </Button>
      </div>

      {/* Scene label */}
      <div className="mt-4 text-center">
        <span className="text-white/40 text-sm">
          Scene {currentScene + 1}: {scenes[currentScene].label}
        </span>
      </div>
    </div>
  );
}