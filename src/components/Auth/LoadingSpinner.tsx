import React from 'react';
import { Zap } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center relative overflow-hidden">
      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="text-center relative z-10">
        <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center neon-glow mx-auto mb-6 animate-pulse">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-orbitron font-semibold cyber-text-glow mb-4 glitch" data-text="NEXUS SYSTEM">
          NEXUS SYSTEM
        </h2>
        <p className="text-purple-400 font-rajdhani text-lg mb-6">INITIALIZING WORKSPACE...</p>
        <div className="flex justify-center">
          <div className="cyber-loading"></div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="text-sm text-cyan-400 font-rajdhani">LOADING MODULES...</div>
          <div className="w-64 cyber-progress h-2 rounded-full mx-auto">
            <div className="cyber-progress-bar h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-600" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};