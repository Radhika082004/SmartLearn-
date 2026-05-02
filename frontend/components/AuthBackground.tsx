'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Calm, slow-moving motes
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4'];
    
    class Mote {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        // EXTREMELY SLOW gently drifting motion
        this.speedX = (Math.random() - 0.5) * 0.15; 
        this.speedY = (Math.random() - 0.5) * 0.15; 
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.3 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around gracefully
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    let motes: Mote[] = [];
    const init = () => {
      motes = [];
      const numberOfMotes = Math.floor((width * height) / 8000);
      for (let i = 0; i < numberOfMotes; i++) {
        motes.push(new Mote());
      }
    };

    let animationFrameId: number;
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      motes.forEach(mote => {
        mote.update();
        mote.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', background: 'var(--bg-dark)', overflow: 'hidden' }}>
      
      {/* Calm Aurora Blobs using Framer Motion */}
      <motion.div
        animate={{ x: [0, 40, -40, 0], y: [0, -40, 40, 0], scale: [1, 1.05, 0.95, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 60%)', filter: 'blur(80px)' }}
      />
      <motion.div
        animate={{ x: [0, -60, 40, 0], y: [0, 60, -40, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '70vw', height: '70vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 60%)', filter: 'blur(90px)' }}
      />
      <motion.div
        animate={{ x: [0, 50, -50, 0], y: [0, 50, -50, 0], scale: [1, 1.1, 0.9, 1] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '20%', right: '20%', width: '50vw', height: '50vh', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 60%)', filter: 'blur(80px)' }}
      />

      {/* Very subtle canvas grid / motes overlay */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
      
      {/* Glass overlay fade to make it extremely soft and tranquil */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(10,10,26,0.4))' }} />
    </div>
  );
}
