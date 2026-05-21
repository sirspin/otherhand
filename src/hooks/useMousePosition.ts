"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type State = {
  x: number; y: number;
  vx: number; vy: number;
  isOnScreen: boolean;
};

export function useMousePosition() {
  const [state, setState] = useState<State>({
    x: -1, y: -1, vx: 0, vy: 0, isOnScreen: false,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [gyroActive, setGyroActive] = useState(false);
  const neutralRef = useRef<{ beta: number; gamma: number } | null>(null);
  const gyroCleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    setIsMobile(navigator.maxTouchPoints > 0);
  }, []);

  // Mouse input (desktop only)
  useEffect(() => {
    if (isMobile) return;

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
  }, [isMobile]);

  const startGyro = useCallback(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;

      // Calibrate to the phone's angle at the moment gyro starts
      if (!neutralRef.current) {
        neutralRef.current = { beta, gamma };
      }

      const db = beta - neutralRef.current.beta;
      const dg = gamma - neutralRef.current.gamma;

      // ±30° gamma → full width, ±25° beta → full height
      const nx = Math.max(0, Math.min(1, 0.5 + dg / 60));
      const ny = Math.max(0, Math.min(1, 0.5 - db / 50));

      const x = nx * window.innerWidth;
      const y = ny * window.innerHeight;

      setState(s => ({ x, y, vx: x - s.x, vy: y - s.y, isOnScreen: true }));
    };

    window.addEventListener("deviceorientation", handler);
    setGyroActive(true);
    gyroCleanup.current = () => window.removeEventListener("deviceorientation", handler);
  }, []);

  const enableGyro = useCallback(async () => {
    type DOEI = typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<PermissionState>;
    };
    const DOE = DeviceOrientationEvent as DOEI;

    if (typeof DOE.requestPermission === "function") {
      const perm = await DOE.requestPermission();
      if (perm === "granted") startGyro();
    } else {
      startGyro();
    }
  }, [startGyro]);

  useEffect(() => () => { gyroCleanup.current?.(); }, []);

  return { ...state, isMobile, gyroActive, enableGyro };
}
