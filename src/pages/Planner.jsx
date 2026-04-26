import React from "react";
import useTaskStore from "../store/useTaskStore";

function Planner() {
  const { plan, schedule } = useTaskStore();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Coach Planner</h2>
        <p className="text-sm text-slate-600">
          Structured view of your daily execution windows.
        </p>
      </div>

      <div className="space-y-3">
        {!plan ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            Create a goal and finish the AI interview first.
          </div>
        ) : null}
        {schedule.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            No schedule generated yet.
          </div>
        ) : (
          schedule.map((block, index) => (
            <article
              key={block.blockId}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{block.task}</p>
                  <p className="text-sm text-slate-500">
                    {block.timeOfDay} • {block.estimated_time} min
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{block.why_it_matters}</p>
                </div>
                <span className="text-xs text-slate-500">Block {index + 1}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default Planner;
