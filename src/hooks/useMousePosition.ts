"use client";

import { useState, useEffect } from "react";

export function useMousePosition() {
  const [pos, setPos] = useState({ x: -1, y: -1 });

  useEffect(() => {
    let rafId: number;
    const handler = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setPos({ x: e.clientX, y: e.clientY }));
    };
    window.addEventListener("mousemove", handler);
    return () => {
      window.removeEventListener("mousemove", handler);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return pos;
}
