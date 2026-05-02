'use client';
import { useEffect, useRef } from 'react';

export default function DashboardBackground() {
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

    const colors = ['#6366f1', '#8b5cf6', '#06b6d4'];

    class OrbitalNode {
      radius: number;
      angle: number;
      speed: number;
      size: number;
      color: string;
      orbitThickness: number;

      constructor() {
        const maxRadius = Math.max(width, height) * 0.8;
        this.radius = Math.random() * maxRadius + 150;
        this.angle = Math.random() * Math.PI * 2;
        // Exceptionally slow, peaceful orbiting motion
        this.speed = (Math.random() * 0.001 + 0.0002) * (Math.random() > 0.5 ? 1 : -1);
        this.size = Math.random() * 1.5 + 0.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.orbitThickness = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.angle += this.speed;
      }

      draw() {
        if (!ctx) return;
        const centerX = width / 2;
        const centerY = height / 2;
        const x = centerX + Math.cos(this.angle) * this.radius;
        const y = centerY + Math.sin(this.angle) * this.radius;

        // Draw faint orbital ring
        ctx.beginPath();
        // Very subtle ring
        ctx.strokeStyle = `rgba(99, 102, 241, 0.04)`; 
        ctx.lineWidth = this.orbitThickness;
        ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw glowing orbiting node
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    let nodes: OrbitalNode[] = [];
    const init = () => {
      nodes = [];
      const numberOfNodes = Math.floor((width * height) / 15000); // Kept very sparse
      for (let i = 0; i < numberOfNodes; i++) {
        nodes.push(new OrbitalNode());
      }
    };

    let animationFrameId: number;
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      nodes.forEach(node => {
        node.update();
        node.draw();
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
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', background: 'var(--bg-dark)' }}>
      {/* Gentle center glow to give depth */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', opacity: 0.8 }} />
    </div>
  );
}
