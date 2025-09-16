import express from "express";
import responses from "../data/responses.js";

const router = express.Router();

router.post("/responses", (req, res) => {
  try {
    const { keyword, answer } = req.body;

    if (!keyword || !answer || !keyword.trim() || !answer.trim()) {
      return res
        .status(400)
        .json({ error: "Both 'keyword' and 'answer' must be provided" });
    }

    const cleanKeyword = keyword.trim().toLowerCase();
    const cleanAnswer = answer.trim();

    const existingResponse = responses.find((res) =>
      res.keywords.some((kw) => kw === cleanKeyword)
    );

    if (existingResponse) {
      existingResponse.answers.push(cleanAnswer);
    } else {
      responses.push({
        keywords: [cleanKeyword],
        answers: [cleanAnswer],
        category: "bruger-lært",
      });
    }

    global.userLearnedResponses = global.userLearnedResponses || [];
    global.userLearnedResponses.push({
      keyword: cleanKeyword,
      answer: cleanAnswer,
      timestamp: new Date(),
    });

    res.status(201).json({ success: "response_added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;