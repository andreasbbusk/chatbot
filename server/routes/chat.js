import express from "express";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import responses from "../data/responses.js";
import { generateBotResponse } from "../services/chatLogic.js";
import {
  sanitizeInput,
  validateChatMessage,
} from "../utilities/inputHelpers.js";

const router = express.Router();

// Helper functions
async function readMessages() {
  try {
    const data = await fs.readFile("./data/messages.json", "utf-8");
    const messages = JSON.parse(data);
    return messages;
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
}

async function writeMessages(messages) {
  await fs.writeFile("./data/messages.json", JSON.stringify(messages, null, 2));
}

router.get("/messages", async (req, res) => {
  try {
    let messages = await readMessages();

    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      messages = messages.filter((message) =>
        message.text.toLowerCase().includes(searchTerm)
      );
    }

    if (req.query.sort === "date") {
      messages = messages.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (req.query.sort === "-date") {
      messages = messages.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || messages.length;

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedMessages = messages.slice(start, end);

    const totalMessages = messages.length;
    const totalPages = Math.ceil(totalMessages / limit);

    res.json({
      pagination: {
        currentpage: page,
        totalPages: totalPages,
        limit: limit,
        totalMessages: totalMessages,
      },
      data: paginatedMessages,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/messages", async (req, res) => {
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

    const messages = await readMessages();

    const userMessageObj = {
      id: randomUUID(),
      date: new Date().toISOString(),
      text: userMessage,
      sender: "Bruger",
      timestamp: userTimestamp,
      category: "bruger-input",
    };

    const botMessageObj = {
      id: randomUUID(),
      date: new Date().toISOString(),
      text: botReply,
      sender: "Bot",
      timestamp: botTimestamp,
      category: matchedCategory,
    };

    messages.push(userMessageObj, botMessageObj);

    await writeMessages(messages);

    const totalMessages = messages.length;
    const userCount = messages.filter((msg) => msg.sender === "Bruger").length;
    const botCount = messages.filter((msg) => msg.sender === "Bot").length;

    res.status(201).json({
      messages,
      botReply,
      totalMessages,
      userCount,
      botCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Clear all messages
router.delete("/messages", async (req, res) => {
  try {
    await writeMessages([]);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


// Individual message operations - kept for possible future implementation
// Currently not used in the chatbot

// Update individual message by ID
router.put("/messages/:id", async (req, res) => {
  try {
    const messages = await readMessages();
    const messageId = req.params.id;
    const message = messages.find((message) => message.id === messageId);

    if (!message) {
      return res.status(404).json({ error: "Besked ikke fundet." });
    }

    const { text, sender } = req.body;

    if (!text || !sender) {
      return res.status(400).json({ error: "Text og sender er påkrævet." });
    }

    message.text = text;
    message.sender = sender;
    await writeMessages(messages);
    res.json({
      success: "Besked opdateret succesfuldt",
      message,
    });
  } catch (error) {
    res.status(500).json({ error: "Server fejl" });
  }
});

// Delete individual message by ID
router.delete("/messages/:id", async (req, res) => {
  try {
    const messages = await readMessages();
    const messageId = req.params.id;
    const messageIndex = messages.findIndex((m) => m.id === messageId);

    if (messageIndex === -1) {
      return res.status(404).json({ error: "Besked ikke fundet." });
    }

    const deletedMessage = messages[messageIndex];
    messages.splice(messageIndex, 1);
    await writeMessages(messages);

    res.json({
      message: "Besked slettet succesfuldt",
      deletedMessage,
    });
  } catch (error) {
    res.status(500).json({ error: "Server fejl" });
  }
});

export default router;