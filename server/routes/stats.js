import express from "express";
import fs from "fs/promises";

const router = express.Router();

// Helper function to read messages from JSON file
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

router.get("/stats", async (req, res) => {
  try {
    const messages = await readMessages();
    const categoryStats = {};

    messages.forEach((msg) => {
      if (msg.category && msg.sender === "Bot") {
        categoryStats[msg.category] = (categoryStats[msg.category] || 0) + 1;
      }
    });

    res.status(200).json({ categoryStats, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;