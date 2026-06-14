import { useState, useEffect, useCallback } from "react";

interface UseOtpTimerOptions {
  initialSeconds?: number;
  onExpire?: () => void;
}

export function useOtpTimer({ initialSeconds = 60, onExpire }: UseOtpTimerOptions = {}) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            onExpire?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, seconds, onExpire]);

  const start = useCallback((customSeconds?: number) => {
    setSeconds(customSeconds ?? initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const reset = useCallback(() => {
    setIsActive(false);
    setSeconds(0);
  }, []);

  const canResend = !isActive && seconds === 0;

  return {
    seconds,
    isActive,
    canResend,
    start,
    reset,
    formattedTime: `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`,
  };
}
