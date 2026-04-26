import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useTaskStore from "../store/useTaskStore";
import {
  generateInterviewQuestions,
  generatePersonalizedPlan,
  requestPlanAdjustments,
} from "../utils/api";

function Dashboard() {
  const navigate = useNavigate();
  const {
    goal,
    plan,
    tasks,
    interviewQuestions,
    interviewAnswers,
    currentQuestionIndex,
    adjustments,
    metricsHistory,
    setGoal,
    setInterviewQuestions,
    setInterviewAnswer,
    nextQuestion,
    previousQuestion,
    setPlan,
    resetInterview,
    setAdjustments,
    logFeedback,
    getCompletionProgress,
    completeTask,
    currentTask,
  } = useTaskStore();
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [error, setError] = useState("");
  const [feedbackForm, setFeedbackForm] = useState({
    completion: "",
    metricName: "",
    metricValue: "",
    notes: "",
  });

  const completionPercent = getCompletionProgress();
  const goalMetricProgress = useMemo(() => {
    if (metricsHistory.length < 2) return null;
    const latest = metricsHistory[0]?.value || 0;
    const previous = metricsHistory[1]?.value || 0;
    return Number((latest - previous).toFixed(2));
  }, [metricsHistory]);

  const onStartInterview = async () => {
    if (!goal.trim()) {
      setError("Enter a concrete goal first.");
      return;
    }

    setError("");
    setIsLoadingQuestions(true);

    try {
      const questions = await generateInterviewQuestions(goal.trim());
      setInterviewQuestions(questions);
    } catch (err) {
      setError(err.message || "Failed to create interview questions.");
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const onGeneratePersonalizedPlan = async () => {
    setError("");
    setIsLoadingPlan(true);

    try {
      const answersPayload = interviewQuestions.map((question, index) => ({
        question,
        answer: interviewAnswers[index] || "",
      }));
      const nextPlan = await generatePersonalizedPlan(goal.trim(), answersPayload);
      setPlan(nextPlan);
    } catch (err) {
      setError(err.message || "Failed to generate personalized plan.");
    } finally {
      setIsLoadingPlan(false);
    }
  };

  const onSubmitFeedback = async () => {
    if (!plan) return;

    const entry = {
      completion: feedbackForm.completion || "unknown",
      metricName: feedbackForm.metricName.trim(),
      metricValue: feedbackForm.metricValue.trim(),
      notes: feedbackForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    logFeedback(entry);
    setFeedbackForm({ completion: "", metricName: "", metricValue: "", notes: "" });
    setIsLoadingFeedback(true);
    setError("");

    try {
      const suggestions = await requestPlanAdjustments(goal, plan, entry);
      setAdjustments(suggestions);
    } catch (err) {
      setError(err.message || "Feedback submitted, but AI suggestions failed.");
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const inInterview = interviewQuestions.length > 0 && !plan;
  const activeQuestion = interviewQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === interviewQuestions.length - 1;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Daily AI Productivity Coach</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter your goal. The coach interviews you, then builds an adaptive plan.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            placeholder="Example: Lose 5kg in 3 months while preserving muscle"
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-slate-300 placeholder:text-slate-400 focus:ring-2"
          />
          <button
            type="button"
            onClick={onStartInterview}
            disabled={isLoadingQuestions}
            className="rounded-md bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingQuestions ? "Preparing..." : "Start AI Interview"}
          </button>
        </div>
        {plan ? (
          <button
            type="button"
            onClick={resetInterview}
            className="mt-3 rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
          >
            Reset Goal & Start Over
          </button>
        ) : null}
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </div>

      {inInterview ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Question {currentQuestionIndex + 1} of {interviewQuestions.length}
          </p>
          <p className="mt-2 text-lg font-medium text-slate-900">{activeQuestion}</p>
          <textarea
            value={interviewAnswers[currentQuestionIndex] || ""}
            onChange={(event) => setInterviewAnswer(currentQuestionIndex, event.target.value)}
            placeholder="Type your answer..."
            className="mt-4 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring-2"
          />
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={previousQuestion}
              disabled={currentQuestionIndex === 0}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 disabled:opacity-40"
            >
              Back
            </button>
            {isLastQuestion ? (
              <button
                type="button"
                onClick={onGeneratePersonalizedPlan}
                disabled={isLoadingPlan}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
              >
                {isLoadingPlan ? "Building..." : "Generate Personalized Plan"}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextQuestion}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      ) : null}

      {plan ? (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Today's Tasks</h3>
              <button
                type="button"
                onClick={() => navigate("/focus")}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Focus Mode
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">{plan.goal_breakdown}</p>
            {tasks.length === 0 ? (
              <p className="text-sm text-slate-500">No daily tasks yet.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <article
                    key={task.id}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`font-medium ${task.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                          {task.task}
                        </p>
                        <p className="text-sm text-slate-500">
                          {task.estimated_time} min • Why: {task.why_it_matters}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={task.completed}
                        onClick={() => completeTask(task.id)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-100 disabled:opacity-40"
                      >
                        {task.completed ? "Done" : "Complete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Progress Tracker</h3>
            <p className="mt-2 text-sm text-slate-600">Task completion: {completionPercent}%</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded bg-slate-200">
              <div className="h-full bg-slate-900" style={{ width: `${completionPercent}%` }} />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Goal metric trend:{" "}
              {goalMetricProgress === null
                ? "Need at least 2 metric logs"
                : `${goalMetricProgress >= 0 ? "+" : ""}${goalMetricProgress}`}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Daily Feedback</h3>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <input
                value={feedbackForm.completion}
                onChange={(event) =>
                  setFeedbackForm((previous) => ({ ...previous, completion: event.target.value }))
                }
                placeholder="Completion notes"
                className="rounded-md border border-slate-300 px-3 py-2"
              />
              <input
                value={feedbackForm.metricName}
                onChange={(event) =>
                  setFeedbackForm((previous) => ({ ...previous, metricName: event.target.value }))
                }
                placeholder="Metric name (e.g. weight)"
                className="rounded-md border border-slate-300 px-3 py-2"
              />
              <input
                value={feedbackForm.metricValue}
                onChange={(event) =>
                  setFeedbackForm((previous) => ({ ...previous, metricValue: event.target.value }))
                }
                placeholder="Metric value (e.g. 82.4)"
                className="rounded-md border border-slate-300 px-3 py-2"
              />
              <input
                value={feedbackForm.notes}
                onChange={(event) =>
                  setFeedbackForm((previous) => ({ ...previous, notes: event.target.value }))
                }
                placeholder="What blocked you today?"
                className="rounded-md border border-slate-300 px-3 py-2"
              />
            </div>
            <button
              type="button"
              onClick={onSubmitFeedback}
              disabled={isLoadingFeedback}
              className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {isLoadingFeedback ? "Analyzing..." : "Get AI Adjustments"}
            </button>
            {adjustments.length ? (
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {adjustments.map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`}>- {suggestion}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No adjustments yet.</p>
            )}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          {interviewQuestions.length === 0
            ? "Start by entering a goal, then run the AI interview."
            : "Answer the interview questions to unlock your personalized plan."}
        </div>
      )}

      {currentTask ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          Current focus recommendation: <span className="font-medium">{currentTask.task}</span>
        </div>
      ) : null}

      {plan ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Weekly Targets & Habits</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-medium text-slate-900">Weekly Targets</p>
              {plan.weekly_targets?.length ? (
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {plan.weekly_targets.map((target, index) => (
                    <li key={`${target}-${index}`}>- {target}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-slate-500">No weekly targets.</p>
              )}
            </div>
            <div>
              <p className="font-medium text-slate-900">Habits</p>
              {plan.habits?.length ? (
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {plan.habits.map((habit, index) => (
                    <li key={`${habit}-${index}`}>- {habit}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-slate-500">No habits defined.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Dashboard;
