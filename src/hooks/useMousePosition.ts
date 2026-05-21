"use client";

import { useState, useEffect } from "react";

export function useMousePosition() {
  const [state, setState] = useState({
    x: -1, y: -1,
    vx: 0, vy: 0,
    isOnScreen: false,
  });

  useEffect(() => {
    let prevX = -1, prevY = -1;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const vx = prevX >= 0 ? e.clientX - prevX : 0;
        const vy = prevY >= 0 ? e.clientY - prevY : 0;
        prevX = e.clientX;
        prevY = e.clientY;
        setState({ x: e.clientX, y: e.clientY, vx, vy, isOnScreen: true });
      });
    };

    const onLeave = () => setState(s => ({ ...s, isOnScreen: false }));

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return state;
}
