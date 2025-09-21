import { useState, useEffect, useCallback, useRef } from 'react';

export function useExamTimer(
  initialTimeInMinutes: number,
  onTimeUp?: () => void,
  opts?: { warningMinutes?: number; criticalMinutes?: number }
) {
  const [timeRemaining, setTimeRemaining] = useState(initialTimeInMinutes * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(true); // Start timer automatically
  const timeUpCallback = useRef(onTimeUp); // Use ref to hold the latest onTimeUp callback
  const warningSecs = Math.max(0, Math.floor((opts?.warningMinutes ?? 5) * 60));
  const criticalSecs = Math.max(0, Math.floor((opts?.criticalMinutes ?? 1) * 60));

  // Update the ref if the callback function changes
  useEffect(() => {
    timeUpCallback.current = onTimeUp;
  }, [onTimeUp]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setTimeRemaining(initialTimeInMinutes * 60);
    setIsRunning(false);
  }, [initialTimeInMinutes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(interval); // Stop interval immediately
            setIsRunning(false);
            if (timeUpCallback.current) {
              timeUpCallback.current();
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    isWarning: timeRemaining <= warningSecs && timeRemaining > criticalSecs,
    isCritical: timeRemaining <= criticalSecs
  };
}
