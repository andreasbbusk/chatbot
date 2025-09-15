import express from "express";
import responses from "../data/responses.js";
import { generateBotResponse } from "../services/chatLogic.js";
import { sanitizeInput, validateChatMessage } from "../utilities/inputHelpers.js";

const router = express.Router();

let messages = [];

router.get("/messages", (req, res) => {
  try {
    const totalMessages = messages.length;
    const userCount = messages.filter((msg) => msg.sender === "Bruger").length;
    const botCount = messages.filter((msg) => msg.sender === "Bot").length;
    
    res.status(200).json({
      messages,
      totalMessages,
      userCount,
      botCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/messages", (req, res) => {
  try {
    if (!req.body.message) {
      return res.status(400).json({ error: "Message is required" });
    }

    let userMessage = req.body.message;
    const userTimestamp = Date.now();
    const botTimestamp = Date.now();

    userMessage = sanitizeInput(userMessage);
    const validation = validateChatMessage(userMessage);
    let { error, botReply } = validation;
    let matchedCategory = "ukategoriseret";

    if (error) {
      return res.status(400).json({ error });
    }

    if (validation.isValid) {
      const responseData = generateBotResponse(userMessage);
      botReply = responseData.botReply;
      matchedCategory = responseData.matchedCategory;
    }

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

    while (messages.length > 20) {
      messages.shift();
    }

    const totalMessages = messages.length;
    const userCount = messages.filter((msg) => msg.sender === "Bruger").length;
    const botCount = messages.filter((msg) => msg.sender === "Bot").length;

    res.status(201).json({
      messages,
      botReply,
      totalMessages,
      userCount,
      botCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/messages", (req, res) => {
  try {
    messages.length = 0;
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Post new responses
router.post("/responses", (req, res) => {
  try {
    const { keyword, answer } = req.body;

    if (!keyword || !answer || !keyword.trim() || !answer.trim()) {
      return res.status(400).json({ error: "Both 'keyword' and 'answer' must be provided" });
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