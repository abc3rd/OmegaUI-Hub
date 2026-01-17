import React from 'react';
import { motion } from 'framer-motion';
import NeonText from '../NeonText';
import UCPPacket from '../UCPPacket';

const aiModels = [
  { name: 'OpenAI', color: '#10a37f', icon: '◉' },
  { name: 'Anthropic', color: '#cc785c', icon: '◎' },
  { name: 'Llama', color: '#7c3aed', icon: '◈' },
  { name: 'Local', color: '#4bce2a', icon: '◆' },
];

export default function Scene6MultiAI() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Center packet */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="relative z-10"
      >
        <UCPPacket scale={0.8} />
      </motion.div>

      {/* Routing lines and model nodes */}
      <div className="absolute inset-0 flex items-center justify-center">
        {aiModels.map((model, i) => {
          const angle = (i * 90 - 45) * Math.PI / 180;
          const radius = 120;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <React.Fragment key={model.name}>
              {/* Connection line */}
              <motion.div
                className="absolute h-0.5 origin-left"
                style={{
                  background: `linear-gradient(90deg, #ea00ea, ${model.color})`,
                  width: radius,
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 90 - 45}deg)`,
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.15, duration: 0.3 }}
              />

              {/* Traveling packet indicator */}
              <motion.div
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: model.color,
                  boxShadow: `0 0 10px ${model.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{
                  x: [0, x],
                  y: [0, y],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 1,
                  delay: 0.8 + i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />

              {/* Model node */}
              <motion.div
                className="absolute flex flex-col items-center"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.15, type: 'spring' }}
              >
                <motion.div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    background: `${model.color}20`,
                    border: `2px solid ${model.color}`,
                    boxShadow: `0 0 20px ${model.color}40`,
                  }}
                  animate={{
                    boxShadow: [
                      `0 0 20px ${model.color}40`,
                      `0 0 30px ${model.color}60`,
                      `0 0 20px ${model.color}40`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span style={{ color: model.color }}>{model.icon}</span>
                </motion.div>
                <span 
                  className="mt-2 text-xs font-medium"
                  style={{ color: model.color }}
                >
                  {model.name}
                </span>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-24 text-center"
      >
        <NeonText color="#ea00ea" size="text-2xl">
          One Packet. Any Model.
        </NeonText>
      </motion.div>
    </div>
  );
}