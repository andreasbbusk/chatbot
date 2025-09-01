import express from "express"; // Import express framework
import responses from "./src/data/responses.js";
import { generateBotResponse } from "./src/utilities/chatLogic.js";
import {
  sanitizeInput,
  validateChatMessage,
} from "./src/utilities/inputHelpers.js";

const app = express();
const PORT = 3000;
const messages = [];

// Middleware setup
app.set("view engine", "ejs"); // Set EJS as the templating engine
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use("/public", express.static("public"));

// GET - render the index page
app.get("/", (req, res) => {
  let error = "";
  let success = "";

  // Handle query parameters for feedback
  if (req.query.error === "empty_fields") {
    error = "Både nøgleord og svar skal udfyldes!";
  }
  if (req.query.success === "response_added") {
    success = "Nyt svar tilføjet! Prøv at skrive nøgleordet i chatten.";
  }

  // Calculate statistics
  const totalMessages = messages.length;
  const userCount = messages.filter((msg) => msg.sender === "Bruger").length;
  const botCount = messages.filter((msg) => msg.sender === "Bot").length;

  res.render("index", {
    messages,
    botReply: "",
    error,
    success,
    totalMessages,
    userCount,
    botCount,
  });
});

// POST-request - handle chat messages
app.post("/chat", (req, res) => {
  let userMessage = req.body.message;
  const userTimestamp = Date.now();
  const botTimestamp = Date.now();

  // Sanitize input FIRST
  userMessage = sanitizeInput(userMessage);

  // Validate input
  const validation = validateChatMessage(userMessage);
  let { error, botReply } = validation;

  let matchedCategory = "ukategoriseret"; // Default category: uncategorized

  if (validation.isValid) {
    // Normal chat logic here - now returns object with botReply and matchedCategory
    const responseData = generateBotResponse(userMessage);
    botReply = responseData.botReply;
    matchedCategory = responseData.matchedCategory;
  }

  // Save messages only if there's no error (now includes category info)
  if (!error) {
    messages.push({
      sender: "Bruger",
      text: userMessage,
      timestamp: userTimestamp,
      category: "bruger-input", // Category: user-input
    });
    messages.push({
      sender: "Bot",
      text: botReply,
      timestamp: botTimestamp,
      category: matchedCategory, // Use the matched category from response
    });

    // Restrict to maximum 10 messages - remove oldest if there are too many
    while (messages.length > 10) {
      messages.shift(); // Remove the oldest message
    }
  }

  // Calculate statistics
  const totalMessages = messages.length;
  const userCount = messages.filter((msg) => msg.sender === "Bruger").length;
  const botCount = messages.filter((msg) => msg.sender === "Bot").length;

  // Send data to template
  res.render("index", {
    messages,
    botReply,
    error,
    totalMessages,
    userCount,
    botCount,
  });
});

app.post("/add-response", (req, res) => {
  const { keyword, answer } = req.body;

  // Validate input
  if (!keyword || !answer || !keyword.trim() || !answer.trim()) {
    console.log("Error: Missing or empty fields");
    return res.redirect("/?error=empty_fields");
  }

  // Clean input
  const cleanKeyword = keyword.trim().toLowerCase();
  const cleanAnswer = answer.trim();

  // Find existing response or create new one
  const existingResponse = responses.find((resp) =>
    resp.keywords.some((kw) => kw === cleanKeyword)
  );

  if (existingResponse) {
    existingResponse.answers.push(cleanAnswer);
    console.log(`Added answer to existing keyword: ${cleanKeyword}`);
  } else {
    responses.push({
      keywords: [cleanKeyword],
      answers: [cleanAnswer],
      category: "bruger-lært",
    });
    console.log(`Created new keyword: ${cleanKeyword}`);
  }

  // Track user-learned responses
  global.userLearnedResponses = global.userLearnedResponses || [];
  global.userLearnedResponses.push({
    keyword: cleanKeyword,
    answer: cleanAnswer,
    timestamp: new Date(),
  });

  res.redirect("/?success=response_added");
});

// Statistics route - simplified approach
app.get("/stats", (req, res) => {
  // Count messages per category (only bot messages)
  const categoryStats = {};
  messages.forEach((msg) => {
    if (msg.category && msg.sender === "Bot") {
      categoryStats[msg.category] = (categoryStats[msg.category] || 0) + 1;
    }
  });

  res.render("stats", { categoryStats, messages });
});

app.post("/clear", (req, res) => {
  messages.length = 0;
  res.redirect("/");
});

// Listen on port 3000
app.listen(PORT, () => console.log("Server running at" + PORT));
