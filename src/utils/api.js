const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

async function request(url, body, fallbackError) {
  const response = await fetch(`${API_BASE}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(fallbackError);
  }

  return response.json();
}

export async function generateInterviewQuestions(goal) {
  const data = await request(
    "/api/coach/questions",
    { goal },
    "Failed to generate interview questions."
  );
  return data.questions || [];
}

export async function generatePersonalizedPlan(goal, answers) {
  return request(
    "/api/coach/plan",
    { goal, answers },
    "Failed to generate personalized plan."
  );
}

export async function requestPlanAdjustments(goal, plan, feedbackEntry) {
  const data = await request(
    "/api/coach/feedback",
    { goal, plan, feedbackEntry },
    "Failed to generate feedback adjustments."
  );
  return data.suggestions || [];
}
