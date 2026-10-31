import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTimerProps {
  totalDurationSeconds: number;
  onComplete?: () => void;
}

export interface TimerControls {
  timeRemaining: number;
  elapsedTime: number;
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: (newTotalSeconds?: number) => void;
}

/**
 * High-accuracy timer hook using Date.now() timestamps.
 * Immune to tab throttling, screen locks, and background drift.
 */
export function useTimer({ totalDurationSeconds, onComplete }: UseTimerProps): TimerControls {
  const [totalSeconds, setTotalSeconds] = useState(totalDurationSeconds);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // References to preserve state across intervals and renders
  const startTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const isRunningRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  const totalSecondsRef = useRef<number>(totalDurationSeconds);
  const onCompleteRef = useRef(onComplete);

  // Keep references synced
  useEffect(() => {
    totalSecondsRef.current = totalDurationSeconds;
    setTotalSeconds(totalDurationSeconds);
  }, [totalDurationSeconds]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Sync internal refs with state
  useEffect(() => {
    isRunningRef.current = isRunning;
    isPausedRef.current = isPaused;
  }, [isRunning, isPaused]);

  // Main tick function to calculate elapsed time using Date.now()
  const tick = useCallback(() => {
    if (!isRunningRef.current || isPausedRef.current || startTimeRef.current === null) {
      return;
    }

    const now = Date.now();
    const currentRunMs = now - startTimeRef.current;
    const totalElapsedMs = accumulatedMsRef.current + currentRunMs;
    const currentElapsedSec = totalElapsedMs / 1000;
    const remainingSec = Math.max(0, totalSecondsRef.current - currentElapsedSec);

    setElapsedTime(currentElapsedSec);

    if (remainingSec <= 0) {
      // Countdown reached zero
      isRunningRef.current = false;
      setIsRunning(false);
      setIsPaused(false);
      setElapsedTime(totalSecondsRef.current);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }
  }, []);

  // Set up interval and visibilitychange listener
  useEffect(() => {
    if (!isRunning || isPaused) {
      return;
    }

    // Run tick immediately
    tick();

    // Check every 100ms for smooth UI and tight synchronization
    const intervalId = window.setInterval(tick, 100);

    // When returning to tab or unlocking phone, immediately recalculate
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, isPaused, tick]);

  const start = useCallback(() => {
    accumulatedMsRef.current = 0;
    startTimeRef.current = Date.now();
    isRunningRef.current = true;
    isPausedRef.current = false;
    setIsRunning(true);
    setIsPaused(false);
    setElapsedTime(0);
  }, []);

  const pause = useCallback(() => {
    if (!isRunningRef.current || isPausedRef.current) return;
    
    // Add current session chunk to accumulated milliseconds
    if (startTimeRef.current !== null) {
      accumulatedMsRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
    
    isPausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!isRunningRef.current || !isPausedRef.current) return;
    
    startTimeRef.current = Date.now();
    isPausedRef.current = false;
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    isPausedRef.current = false;
    startTimeRef.current = null;
    accumulatedMsRef.current = 0;
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const reset = useCallback((newTotalSeconds?: number) => {
    stop();
    const targetTotal = newTotalSeconds ?? totalSecondsRef.current;
    totalSecondsRef.current = targetTotal;
    setTotalSeconds(targetTotal);
    setElapsedTime(0);
  }, [stop]);

  const timeRemaining = Math.max(0, totalSeconds - elapsedTime);

  return {
    timeRemaining,
    elapsedTime,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}

