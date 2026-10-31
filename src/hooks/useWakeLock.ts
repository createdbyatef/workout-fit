import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Screen Wake Lock API hook to keep display awake during workout
 */
export function useWakeLock(enabled: boolean = true) {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator) || !enabled) return;

    try {
      if (!wakeLockRef.current || wakeLockRef.current.released) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        setIsActive(true);

        wakeLockRef.current.addEventListener('release', () => {
          setIsActive(false);
        });
      }
    } catch (err) {
      console.warn('Screen Wake Lock request failed:', err);
      setIsActive(false);
    }
  }, [enabled]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.warn('Error releasing wake lock:', err);
      } finally {
        wakeLockRef.current = null;
        setIsActive(false);
      }
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      requestWakeLock();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible' && enabled) {
          requestWakeLock();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        releaseWakeLock();
      };
    } else {
      releaseWakeLock();
    }
  }, [enabled, requestWakeLock, releaseWakeLock]);

  return { isSupported, isActive, requestWakeLock, releaseWakeLock };
}

