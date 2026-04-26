const express = require("express");
const {
  generateClarifyingQuestions,
  generatePersonalizedPlan,
  generateAdjustments,
} = require("../services/aiService");

const router = express.Router();

router.post("/coach/questions", async (req, res) => {
  try {
    const { goal } = req.body;

    if (!goal || typeof goal !== "string") {
      return res.status(400).json({ error: "A valid goal is required." });
    }

    const questions = await generateClarifyingQuestions(goal);
    return res.json({ questions });
  } catch (error) {
    console.error("Question generation failed:", error);
    return res.status(500).json({ error: "Unable to generate interview questions." });
  }
});

router.post("/coach/plan", async (req, res) => {
  try {
    const { goal, answers } = req.body;

    if (!goal || typeof goal !== "string") {
      return res.status(400).json({ error: "A valid goal is required." });
    }

    const plan = await generatePersonalizedPlan(goal, answers || []);
    return res.json(plan);
  } catch (error) {
    console.error("Plan generation failed:", error);
    return res.status(500).json({ error: "Unable to generate personalized plan." });
  }
});

router.post("/coach/feedback", async (req, res) => {
  try {
    const { goal, plan, feedbackEntry } = req.body;

    if (!goal || typeof goal !== "string") {
      return res.status(400).json({ error: "A valid goal is required." });
    }

    const suggestions = await generateAdjustments(goal, plan || {}, feedbackEntry || {});
    return res.json({ suggestions });
  } catch (error) {
    console.error("Feedback adjustment failed:", error);
    return res.status(500).json({ error: "Unable to generate adjustments." });
  }
});

module.exports = router;
