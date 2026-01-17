import React from 'react';
import { motion } from 'framer-motion';
import NeonText from '../NeonText';
import UCPPacket from '../UCPPacket';
import { Smartphone, Wifi, WifiOff, QrCode, Radio, Volume2 } from 'lucide-react';

export default function Scene7Offline() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Compression animation */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Original packet compressing */}
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute"
        >
          <UCPPacket scale={0.6} />
        </motion.div>

        {/* Compression particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{ background: ['#ea00ea', '#2699fe', '#4bce2a'][i % 3] }}
            initial={{
              x: Math.cos(i * 45 * Math.PI / 180) * 50,
              y: Math.sin(i * 45 * Math.PI / 180) * 50,
              opacity: 1,
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          />
        ))}

        {/* QR Code appears */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="relative"
        >
          <div 
            className="w-24 h-24 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ea00ea20, #2699fe20)',
              border: '2px solid #ea00ea',
              boxShadow: '0 0 30px rgba(234, 0, 234, 0.3)',
            }}
          >
            <QrCode className="w-14 h-14 text-white" />
          </div>

          {/* Scan lines */}
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-[#4bce2a]"
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ boxShadow: '0 0 10px #4bce2a' }}
          />
        </motion.div>

        {/* Arrow to phone */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="mx-4"
        >
          <motion.div
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-[#4bce2a] text-2xl"
          >
            →
          </motion.div>
        </motion.div>

        {/* Phone with offline execution */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          className="relative"
        >
          <div 
            className="w-16 h-28 rounded-2xl flex flex-col items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, #1a1a2e, #16162a)',
              border: '2px solid #2699fe40',
              boxShadow: '0 0 20px rgba(38, 153, 254, 0.2)',
            }}
          >
            <WifiOff className="w-5 h-5 text-[#c4653a] mb-1" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Smartphone className="w-6 h-6 text-[#4bce2a]" />
            </motion.div>
            <span className="text-[8px] text-[#4bce2a] mt-1">EXEC</span>
          </div>

          {/* Success indicator */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.3 }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#4bce2a] flex items-center justify-center"
          >
            <span className="text-black text-xs">✓</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Transfer methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="flex gap-6 mb-6"
      >
        {[
          { icon: QrCode, label: 'QR', color: '#ea00ea' },
          { icon: Radio, label: 'NFC', color: '#2699fe' },
          { icon: Volume2, label: 'Acoustic', color: '#4bce2a' },
        ].map((method, i) => (
          <motion.div
            key={method.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6 + i * 0.1 }}
            className="flex flex-col items-center"
          >
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-1"
              style={{
                background: `${method.color}20`,
                border: `1px solid ${method.color}40`,
              }}
            >
              <method.icon className="w-5 h-5" style={{ color: method.color }} />
            </div>
            <span className="text-xs text-white/60">{method.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="text-center"
      >
        <NeonText color="#4bce2a" size="text-xl">
          AI That Works Offline
        </NeonText>
      </motion.div>
    </div>
  );
}