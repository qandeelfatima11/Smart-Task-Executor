import React from "react";

const priorityStyles = {
  High: "bg-rose-100 text-rose-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

function TaskCard({ task, onOpen, onQuickComplete, isActive = false }) {
  return (
    <article
      onClick={() => onOpen && onOpen(task)}
      className={`relative cursor-pointer rounded-xl border bg-white p-4 shadow-sm transition ${
        isActive
          ? "border-slate-900 ring-1 ring-slate-300"
          : "border-slate-200 hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3
            className={`font-medium ${task.completed ? "text-slate-400 line-through" : "text-slate-900"}`}
          >
            {task.task}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {task.estimated_time} min estimate
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            priorityStyles[task.priority] || "bg-slate-100 text-slate-600"
          }`}
        >
          {task.priority}
        </span>
      </div>
      {!task.completed && onQuickComplete ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onQuickComplete(task.id);
          }}
          className="absolute right-6 top-6 rounded-full border border-slate-300 bg-white p-2 text-slate-700 transition hover:bg-slate-100"
          aria-label={`Quick complete ${task.task}`}
          title="Quick complete"
        >
          <span className="text-xs">✓</span>
        </button>
      ) : null}
    </article>
  );
}

export default TaskCard;
