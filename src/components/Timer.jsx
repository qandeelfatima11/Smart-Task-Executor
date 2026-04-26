import React, { useEffect, useMemo, useState } from "react";

const FOCUS_SECONDS = 25 * 60;

function Timer({ resetSignal = 0 }) {
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setSecondsLeft(FOCUS_SECONDS);
    setIsRunning(false);
  }, [resetSignal]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const timerId = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          setIsRunning(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRunning]);

  const formatted = useMemo(() => {
    const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const seconds = String(secondsLeft % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [secondsLeft]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm uppercase tracking-wide text-slate-500">Focus Timer</p>
      <p className="mt-3 text-6xl font-semibold text-slate-900">{formatted}</p>
      <div className="mt-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setIsRunning((previous) => !previous)}
          disabled={secondsLeft === 0}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSecondsLeft(FOCUS_SECONDS);
            setIsRunning(false);
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

export default Timer;
