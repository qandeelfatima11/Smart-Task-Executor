import React, { useEffect, useMemo, useState } from "react";
import useTaskStore from "../store/useTaskStore";

const DEFAULT_SECONDS = 25 * 60;

function TaskDetail() {
  const { currentTask, startTask, completeTask, clearCurrentTask } = useTaskStore();
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const taskId = currentTask?.id;

  useEffect(() => {
    if (!taskId) {
      setIsRunning(false);
      return;
    }
    setSecondsLeft(DEFAULT_SECONDS);
    setIsRunning(false);
    setCheckedSteps([]);
  }, [taskId]);

  useEffect(() => {
    if (!isRunning) return undefined;

    const intervalId = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          setIsRunning(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  const timeLabel = useMemo(() => {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [secondsLeft]);

  const toggleStep = (stepIndex) => {
    setCheckedSteps((previous) =>
      previous.includes(stepIndex)
        ? previous.filter((index) => index !== stepIndex)
        : [...previous, stepIndex]
    );
  };

  if (!currentTask) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-slate-900/20"
        onClick={clearCurrentTask}
        aria-hidden="true"
      />
      <aside className="fixed right-0 top-0 z-40 h-full w-full max-w-md border-l border-slate-200 bg-white p-6 shadow-2xl md:w-1/3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Task Detail</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">{currentTask.task}</h3>
          </div>
          <button
            type="button"
            onClick={clearCurrentTask}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-900">Priority:</span> {currentTask.priority}
          </p>
          <p>
            <span className="font-medium text-slate-900">Estimated:</span>{" "}
            {currentTask.estimated_time} minutes
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-700">Pomodoro Timer</p>
          <p className="mt-2 text-4xl font-semibold text-slate-900">{timeLabel}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setIsRunning((running) => !running)}
              disabled={secondsLeft === 0}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRunning ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSecondsLeft(DEFAULT_SECONDS);
                setIsRunning(false);
              }}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-700">Subtasks</p>
          {currentTask.steps?.length ? (
            <ul className="mt-2 space-y-2">
              {currentTask.steps.map((step, index) => (
                <li key={`${step}-${index}`} className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={checkedSteps.includes(index)}
                    onChange={() => toggleStep(index)}
                    className="mt-1 h-4 w-4"
                  />
                  <span
                    className={`text-sm ${
                      checkedSteps.includes(index)
                        ? "text-slate-400 line-through"
                        : "text-slate-700"
                    }`}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">No subtasks provided.</p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => startTask(currentTask.id)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            Start Task
          </button>
          <button
            type="button"
            onClick={() => completeTask(currentTask.id)}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Mark Complete
          </button>
        </div>
      </aside>
    </>
  );
}

export default TaskDetail;
