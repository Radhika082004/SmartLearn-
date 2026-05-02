'use client';
import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject global styles to completely hide the default system cursor everywhere
    const style = document.createElement('style');
    style.innerHTML = `
      * { 
        cursor: none !important; 
      }
    `;
    document.head.appendChild(style);

    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Use translate3d for hardware-accelerated, zero-lag rendering
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    window.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 999999, // Ensure it's absolutely above everything
        pointerEvents: 'none', // Critical: ensures clicks pass through the cursor
        transform: 'translate3d(-100px, -100px, 0)', // Keep it hidden until the first mousemove
        willChange: 'transform',
      }}
    >
      <svg 
        width="32" 
        height="32" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ 
          filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.6))',
          // Slight negative margin if the SVG path doesn't start exactly at 0,0
          marginLeft: '-1px',
          marginTop: '-1px'
        }}
      >
        <path 
          d="M0 0L20.5 7.5L12 12L7.5 20.5L0 0Z" 
          fill="white" 
          stroke="#6366f1" 
          strokeWidth="1.2" 
          strokeLinejoin="round" 
        />
      </svg>
    </div>
  );
}
