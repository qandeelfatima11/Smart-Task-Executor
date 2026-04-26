const dotenv = require("dotenv");

dotenv.config();

const PROVIDER = (process.env.AI_PROVIDER || "groq").toLowerCase();
const API_KEY = process.env.AI_API_KEY || process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY;

function getProviderConfig() {
  if (PROVIDER === "openrouter") {
    return {
      url: "https://openrouter.ai/api/v1/chat/completions",
      model: process.env.AI_MODEL || "openai/gpt-4o-mini",
      extraHeaders: {
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
        "X-Title": process.env.OPENROUTER_APP_NAME || "Daily AI Productivity Coach",
      },
    };
  }

  return {
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: process.env.AI_MODEL || "llama-3.1-8b-instant",
    extraHeaders: {},
  };
}

async function chatJson(messages, fallbackPayload) {
  if (!API_KEY) return fallbackPayload;

  const { url, model, extraHeaders } = getProviderConfig();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`AI provider request failed: ${details}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "{}";
  return JSON.parse(text);
}

async function generateClarifyingQuestions(goal) {
  const fallback = {
    questions: [
      "What exact outcome do you want by the end of this week?",
      "How much time can you consistently commit each day?",
      "What is your current baseline metric for this goal?",
      "What usually blocks your consistency?",
    ],
  };

  const payload = await chatJson(
    [
      {
        role: "system",
        content:
          "You are a practical productivity coach. Ask only specific, decision-driving questions. Avoid vague prompts.",
      },
      {
        role: "user",
        content: `Goal: ${goal}
Return JSON with this shape only:
{
  "questions": ["...", "...", "..."]
}
Rules:
- 3 to 5 questions
- Each question must help personalize daily execution
- Never ask generic questions`,
      },
    ],
    fallback
  );

  const normalized = Array.isArray(payload.questions)
    ? payload.questions
        .map((question) => String(question || "").trim())
        .filter(Boolean)
        .slice(0, 5)
    : fallback.questions;

  return normalized.length >= 3 ? normalized : fallback.questions;
}

async function generatePersonalizedPlan(goal, answers) {
  const fallback = {
    goal_breakdown: `Focused execution plan for: ${goal}`,
    daily_tasks: [
      {
        id: "daily-1",
        task: "Complete the highest leverage action for your goal",
        why_it_matters: "It creates visible progress every day.",
        estimated_time: 45,
      },
      {
        id: "daily-2",
        task: "Track your key metric and update progress",
        why_it_matters: "Metrics keep the plan adaptive and honest.",
        estimated_time: 15,
      },
    ],
    weekly_targets: ["Hit at least 5 focused work sessions", "Improve your key metric by a measurable amount"],
    habits: ["Plan tomorrow before ending today", "Run one distraction-free focus block daily"],
  };

  const payload = await chatJson(
    [
      {
        role: "system",
        content:
          "You are a daily productivity coach. Build concrete plans with specific actions, measurable outputs, and no generic task wording.",
      },
      {
        role: "user",
        content: `Goal: ${goal}
Interview answers: ${JSON.stringify(answers)}

Return JSON with this exact top-level shape:
{
  "goal_breakdown": "string",
  "daily_tasks": [
    {
      "id": "string",
      "task": "string",
      "why_it_matters": "string",
      "estimated_time": 30
    }
  ],
  "weekly_targets": ["string"],
  "habits": ["string"]
}

Rules:
- daily_tasks must be actionable today
- avoid vague language like "clarify scope" or "execute milestone"
- include 3 to 6 daily tasks`,
      },
    ],
    fallback
  );

  return {
    goal_breakdown: String(payload.goal_breakdown || fallback.goal_breakdown),
    daily_tasks: Array.isArray(payload.daily_tasks) && payload.daily_tasks.length
      ? payload.daily_tasks.map((item, index) => ({
          id: item.id || `daily-${index + 1}`,
          task: String(item.task || "").trim(),
          why_it_matters: String(item.why_it_matters || "This task moves your goal forward."),
          estimated_time: Number(item.estimated_time) || 30,
        })).filter((item) => item.task)
      : fallback.daily_tasks,
    weekly_targets: Array.isArray(payload.weekly_targets) && payload.weekly_targets.length
      ? payload.weekly_targets.map((item) => String(item || "").trim()).filter(Boolean)
      : fallback.weekly_targets,
    habits: Array.isArray(payload.habits) && payload.habits.length
      ? payload.habits.map((item) => String(item || "").trim()).filter(Boolean)
      : fallback.habits,
  };
}

async function generateAdjustments(goal, plan, feedbackEntry) {
  const fallback = {
    suggestions: [
      "Reduce the first task scope by 20% so completion is guaranteed today.",
      "Keep the same plan for 2 days before introducing bigger changes.",
    ],
  };

  const payload = await chatJson(
    [
      {
        role: "system",
        content:
          "You are a strict but supportive productivity coach. Suggest small, concrete plan adjustments based on latest feedback and metrics.",
      },
      {
        role: "user",
        content: `Goal: ${goal}
Current plan: ${JSON.stringify(plan)}
Latest feedback: ${JSON.stringify(feedbackEntry)}

Return JSON:
{
  "suggestions": ["...", "..."]
}
Rules:
- 2 to 4 suggestions
- each suggestion must be immediately actionable`,
      },
    ],
    fallback
  );

  const suggestions = Array.isArray(payload.suggestions)
    ? payload.suggestions.map((item) => String(item || "").trim()).filter(Boolean)
    : fallback.suggestions;

  return suggestions.length ? suggestions.slice(0, 4) : fallback.suggestions;
}

module.exports = {
  generateClarifyingQuestions,
  generatePersonalizedPlan,
  generateAdjustments,
};
