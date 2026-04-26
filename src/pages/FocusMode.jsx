import React from "react";
import Timer from "../components/Timer";
import useTaskStore from "../store/useTaskStore";

function FocusMode() {
  const { tasks, timerResetKey, completeTask } = useTaskStore();
  const todaysTask = tasks.find((task) => !task.completed) || null;

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-8 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">Today's Single Focus</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">
          {todaysTask ? todaysTask.task : "No task left for today"}
        </h2>
        {todaysTask ? (
          <p className="mt-2 text-sm text-slate-600">Why this matters: {todaysTask.why_it_matters}</p>
        ) : null}
      </div>

      <Timer resetSignal={timerResetKey} />

      <button
        type="button"
        disabled={!todaysTask}
        onClick={() => todaysTask && completeTask(todaysTask.id)}
        className="rounded-md bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Complete Task
      </button>
    </section>
  );
}

export default FocusMode;
