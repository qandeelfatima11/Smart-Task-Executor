export function generateSchedule(tasks = []) {
  const sortedTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));

  return sortedTasks.map((task, index) => ({
    blockId: `${task.id || task.task}-${index}`,
    taskId: task.id,
    task: task.task,
    why_it_matters: task.why_it_matters,
    estimated_time: task.estimated_time,
    timeOfDay: index < 2 ? "Morning" : index < 4 ? "Afternoon" : "Evening",
    completed: task.completed || false,
  }));
}
