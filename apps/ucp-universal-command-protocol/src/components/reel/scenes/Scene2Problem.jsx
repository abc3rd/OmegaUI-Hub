import React from 'react';
import { motion } from 'framer-motion';
import NeonText from '../NeonText';
import { Brain, Zap } from 'lucide-react';

export default function Scene2Problem() {
  const requestCounts = ['1', '1,000', '1,000,000'];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Giant brain */}
      <motion.div
        className="relative"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 30px rgba(38, 153, 254, 0.5)',
              '0 0 60px rgba(234, 0, 234, 0.5)',
              '0 0 30px rgba(38, 153, 254, 0.5)',
            ]
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-[#2699fe] to-[#ea00ea] flex items-center justify-center"
        >
          <Brain className="w-16 h-16 text-white" />
        </motion.div>

        {/* Incoming requests */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-[#c4653a]"
            style={{
              top: '50%',
              left: '50%',
            }}
            initial={{
              x: Math.cos(i * 30 * Math.PI / 180) * 150,
              y: Math.sin(i * 30 * Math.PI / 180) * 150,
              opacity: 0,
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.1,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          />
        ))}

        {/* Energy sparks */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`spark-${i}`}
            className="absolute"
            style={{
              top: '50%',
              left: '50%',
            }}
            initial={{ opacity: 0 }}
            animate={{
              x: [0, Math.cos(i * 45 * Math.PI / 180) * 60],
              y: [0, Math.sin(i * 45 * Math.PI / 180) * 60],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 0.5,
              delay: 0.8 + i * 0.05,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <Zap className="w-4 h-4 text-yellow-400" />
          </motion.div>
        ))}
      </motion.div>

      {/* Counter */}
      <div className="mt-8 text-center">
        <NeonText color="#2699fe" size="text-2xl" className="mb-2">
          1M Requests = 1M Interpretations
        </NeonText>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-4 justify-center mt-4"
        >
          {['Redundant', 'Slow', 'Expensive'].map((text, i) => (
            <motion.span
              key={text}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.2 }}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                background: 'rgba(196, 101, 58, 0.2)',
                color: '#c4653a',
                border: '1px solid rgba(196, 101, 58, 0.5)',
              }}
            >
              {text}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}