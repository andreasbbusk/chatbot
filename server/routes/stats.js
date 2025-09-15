import express from "express";
const router = express.Router();

let messages = [];

router.get("/stats", (req, res) => {
  try {
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