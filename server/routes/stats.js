import express from "express";
const router = express.Router();

let messages = [];

router.get("/stats", (req, res) => {
  const categoryStats = {};
  messages.forEach((msg) => {
    if (msg.category && msg.sender === "Bot") {
      categoryStats[msg.category] = (categoryStats[msg.category] || 0) + 1;
    }
  });

  res.json({ categoryStats, messages });
});

export default router;