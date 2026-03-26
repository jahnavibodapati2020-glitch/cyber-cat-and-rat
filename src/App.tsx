/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import CyberBackground from './components/CyberBackground';

export default function App() {
  return (
    <div className="min-h-screen bg-transparent text-gray-300 flex flex-col items-center justify-center p-4 lg:p-8 relative overflow-hidden font-mono">
      <CyberBackground />
      {/* CRT Scanlines Overlay */}
      <div className="absolute inset-0 scanlines z-50 pointer-events-none opacity-50" />
      
      {/* Random Glitch Artifacts */}
      <div className="absolute top-[15%] left-[5%] w-32 h-1 bg-glitch-cyan opacity-20 animate-pulse" />
      <div className="absolute bottom-[25%] right-[10%] w-64 h-2 bg-glitch-magenta opacity-20 screen-tear" />
      
      <header className="mb-8 text-center z-10 flex flex-col items-center border-b-4 border-glitch-cyan pb-4 w-full max-w-4xl screen-tear">
        <h1 
          className="text-4xl md:text-6xl font-bold glitch-text text-white tracking-widest uppercase" 
          data-text="CYBER CAT & NEON RATS"
        >
          CYBER CAT & NEON RATS
        </h1>
        <p className="text-glitch-magenta tracking-[0.5em] text-sm md:text-lg mt-2 font-bold">
          [ PROTOCOL: ACTIVE ]
        </p>
      </header>

      <main className="w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 lg:gap-16 z-10">
        <div className="flex-1 flex justify-center w-full">
          <SnakeGame />
        </div>
        
        <div className="w-full lg:w-96 flex justify-center">
          <MusicPlayer />
        </div>
      </main>
      
      <footer className="mt-12 text-glitch-cyan text-sm z-10 opacity-70">
        <p>CONNECTION ESTABLISHED // {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
