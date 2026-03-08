import { useState, useEffect, useRef, useCallback } from "react";

import { formatDurationFromSeconds } from "src/utils/dateUtil.ts";

interface ElapsedTimeProps {
  startedAt: Date;
}
function ElapsedTime({ startedAt }: ElapsedTimeProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(() =>
    Math.trunc((Date.now() - startedAt.getTime()) / 1000),
  );
  const timeoutRef = useRef<number | null>(null);

  const stopWatchTick = useCallback(() => {
    setSecondsElapsed((prevSecondsElapsed) => prevSecondsElapsed + 1);
    timeoutRef.current = setTimeout(stopWatchTick, 1_000);
  }, [setSecondsElapsed]);

  useEffect(() => {
    timeoutRef.current = setTimeout(stopWatchTick, 1_000);
    return () => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stopWatchTick]);

  return formatDurationFromSeconds(secondsElapsed);
}

export { ElapsedTime };
