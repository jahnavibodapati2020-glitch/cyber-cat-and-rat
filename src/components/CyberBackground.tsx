import React, { useEffect, useRef } from 'react';

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles/Noise
    const particles: { x: number, y: number, speed: number, size: number, color: string }[] = [];
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: Math.random() * 2 + 0.5,
        size: Math.random() * 2,
        color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff'
      });
    }

    // Lightning streaks
    const streaks: { x: number, y: number, length: number, speed: number, opacity: number, color: string }[] = [];
    for (let i = 0; i < 5; i++) {
      streaks.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 200 + 50,
        speed: Math.random() * 10 + 5,
        opacity: Math.random(),
        color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff'
      });
    }

    let frame = 0;
    let animationFrameId: number;

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)'; // Trail effect
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      
      // Perspective grid
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(1, 0.5); // Flatten
      ctx.translate(-width / 2, -height / 2);
      
      ctx.beginPath();
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.restore();

      // Digital Noise / Particles
      particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.random() * 0.5 + 0.1;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        p.y -= p.speed;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
      });
      ctx.globalAlpha = 1;

      // Lightning Streaks
      streaks.forEach(s => {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = s.opacity;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.length);
        ctx.stroke();
        
        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = s.color;
        ctx.stroke();
        ctx.shadowBlur = 0;

        s.y += s.speed;
        s.opacity -= 0.02;

        if (s.y > height || s.opacity <= 0) {
          s.y = -s.length;
          s.x = Math.random() * width;
          s.opacity = Math.random() * 0.5 + 0.5;
          s.speed = Math.random() * 15 + 10;
        }
      });
      ctx.globalAlpha = 1;

      // Glitch effect randomly
      if (Math.random() < 0.05) {
        const sliceY = Math.random() * height;
        const sliceHeight = Math.random() * 50 + 10;
        const offset = (Math.random() - 0.5) * 20;
        
        const imageData = ctx.getImageData(0, sliceY, width, sliceHeight);
        ctx.putImageData(imageData, offset, sliceY);
        
        // Add color aberration
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(0, 255, 255, 0.2)' : 'rgba(255, 0, 255, 0.2)';
        ctx.fillRect(0, sliceY, width, sliceHeight);
      }

      frame++;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050505]">
      {/* Base glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff00ff] rounded-full blur-[150px] opacity-20 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00ffff] rounded-full blur-[150px] opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Canvas for dynamic effects */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
      
      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] opacity-80" />
    </div>
  );
}
