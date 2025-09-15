import express from "express";
import responses from "../data/responses.js";
import { generateBotResponse } from "../services/chatLogic.js";
import { sanitizeInput, validateChatMessage } from "../utilities/inputHelpers.js";

const router = express.Router();

let messages = [];

router.get("/messages", (req, res) => {
  const totalMessages = messages.length;
  const userCount = messages.filter((msg) => msg.sender === "Bruger").length;
  const botCount = messages.filter((msg) => msg.sender === "Bot").length;
  
  res.json({
    messages,
    totalMessages,
    userCount,
    botCount
  });
});

router.post("/messages", (req, res) => {
  let userMessage = req.body.message;
  const userTimestamp = Date.now();
  const botTimestamp = Date.now();

  userMessage = sanitizeInput(userMessage);
  const validation = validateChatMessage(userMessage);
  let { error, botReply } = validation;
  let matchedCategory = "ukategoriseret";

  if (validation.isValid) {
    const responseData = generateBotResponse(userMessage);
    botReply = responseData.botReply;
    matchedCategory = responseData.matchedCategory;
  }

  if (!error) {
    messages.push({
      sender: "Bruger",
      text: userMessage,
      timestamp: userTimestamp,
      category: "bruger-input",
    });
    messages.push({
      sender: "Bot",
      text: botReply,
      timestamp: botTimestamp,
      category: matchedCategory,
    });

    while (messages.length > 10) {
      messages.shift();
    }
  }

  const totalMessages = messages.length;
  const userCount = messages.filter((msg) => msg.sender === "Bruger").length;
  const botCount = messages.filter((msg) => msg.sender === "Bot").length;

  res.json({
    messages,
    botReply,
    error,
    totalMessages,
    userCount,
    botCount
  });
});

router.delete("/messages", (req, res) => {
  messages.length = 0;
  res.json({ success: true });
});

// Post new responses
router.post("/responses", (req, res) => {
  const { keyword, answer } = req.body;

  if (!keyword || !answer || !keyword.trim() || !answer.trim()) {
    return res.status(400).json({ error: "empty_fields" });
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

  res.json({ success: "response_added" });
});

export default router;