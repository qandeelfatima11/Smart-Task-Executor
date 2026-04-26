import { create } from "zustand";
import { generateSchedule as buildSchedule } from "../utils/scheduler";

const normalizeDailyTask = (task, index) => ({
  id: task.id || `daily-${index + 1}`,
  task: task.task,
  why_it_matters: task.why_it_matters || "This directly contributes to your goal progress.",
  estimated_time: Number(task.estimated_time) || 30,
  completed: Boolean(task.completed),
  order: index + 1,
});

const findNextTask = (tasks) => tasks.find((task) => !task.completed) || null;
const progressPercent = (tasks) => {
  if (!tasks.length) return 0;
  const completed = tasks.filter((task) => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

const useTaskStore = create((set, get) => ({
  goal: "",
  plan: null,
  tasks: [],
  schedule: [],
  interviewQuestions: [],
  interviewAnswers: [],
  currentQuestionIndex: 0,
  feedbackLog: [],
  adjustments: [],
  metricsHistory: [],
  currentTask: null,
  timerResetKey: 0,
  setGoal: (goal) => set({ goal }),
  setInterviewQuestions: (questions) =>
    set({
      interviewQuestions: questions,
      interviewAnswers: new Array(questions.length).fill(""),
      currentQuestionIndex: 0,
      plan: null,
      tasks: [],
      schedule: [],
      currentTask: null,
      adjustments: [],
    }),
  setInterviewAnswer: (index, answer) =>
    set((state) => {
      const nextAnswers = [...state.interviewAnswers];
      nextAnswers[index] = answer;
      return { interviewAnswers: nextAnswers };
    }),
  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        Math.max(state.interviewQuestions.length - 1, 0)
      ),
    })),
  previousQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),
  resetInterview: () =>
    set({
      interviewQuestions: [],
      interviewAnswers: [],
      currentQuestionIndex: 0,
      plan: null,
      tasks: [],
      schedule: [],
      currentTask: null,
      adjustments: [],
      feedbackLog: [],
      metricsHistory: [],
    }),
  setPlan: (plan) => {
    const normalizedTasks = (plan?.daily_tasks || []).map(normalizeDailyTask);
    set({
      plan,
      tasks: normalizedTasks,
      currentTask: findNextTask(normalizedTasks),
      schedule: buildSchedule(normalizedTasks),
      adjustments: [],
    });
  },
  setCurrentTask: (task) => set({ currentTask: task || null }),
  completeTask: (taskId) => {
    const updatedTasks = get().tasks.map((task) =>
      task.id === taskId ? { ...task, completed: true } : task
    );
    const updatedSchedule = buildSchedule(updatedTasks);
    const nextTask = findNextTask(updatedTasks);

    set((state) => ({
      tasks: updatedTasks,
      schedule: updatedSchedule,
      currentTask: nextTask,
      timerResetKey: state.timerResetKey + 1,
    }));
  },
  setAdjustments: (suggestions) => set({ adjustments: suggestions }),
  logFeedback: (entry) =>
    set((state) => ({
      feedbackLog: [entry, ...state.feedbackLog].slice(0, 20),
      metricsHistory: entry.metricValue
        ? [{ value: Number(entry.metricValue), date: entry.createdAt }, ...state.metricsHistory].slice(0, 30)
        : state.metricsHistory,
    })),
  getCompletionProgress: () => progressPercent(get().tasks),
}));

export default useTaskStore;
