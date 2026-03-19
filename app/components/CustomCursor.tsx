"use client";

import React, { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) {
      const onMouseMove = (e: MouseEvent) => {
        mouse.current = { x: e.clientX, y: e.clientY };
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${e.clientX - 4}px, ${e.clientY - 4}px, 0)`;
        }
      };
      window.addEventListener("mousemove", onMouseMove);

      let animationFrameId: number;
      const render = () => {
        ring.current.x += (mouse.current.x - ring.current.x) * 0.15;
        ring.current.y += (mouse.current.y - ring.current.y) * 0.15;
        if (ringRef.current) {
          ringRef.current.style.transform = `translate3d(${ring.current.x - 16}px, ${ring.current.y - 16}px, 0)`;
        }
        animationFrameId = requestAnimationFrame(render);
      };
      render();

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, []);

  return (
    <>
      {/* mix-blend-difference silindi, sadece saf siyah yapıldı */}
      <div ref={dotRef} className="fixed top-0 left-0 w-2 h-2 bg-black rounded-full pointer-events-none z-[99999] hide-on-mobile" />
      <div ref={ringRef} className="fixed top-0 left-0 w-8 h-8 border border-black rounded-full pointer-events-none z-[99998] hide-on-mobile" />
    </>
  );
}