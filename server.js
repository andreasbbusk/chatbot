import express from "express"; // Import express framework
import { sanitizeInput } from "./src/utilities/inputHelpers.js";
import {
  validateChatMessage,
  validateAddResponse,
} from "./src/utilities/inputHelpers.js";
import {
  generateBotResponse,
  addNewResponse,
} from "./src/utilities/chatLogic.js";

const app = express();
const PORT = 3000;
const messages = [];

// Middleware setup
app.set("view engine", "ejs"); // Set EJS as the templating engine
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use("/public", express.static("public"));

// GET - render the index page
app.get("/", (req, res) => {
  res.render("index", { messages, botReply: "", error: "" });
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

  if (validation.isValid) {
    // Normal chat logic here...
    botReply = generateBotResponse(userMessage);
  }

  // Save messages only if there's no error
  if (!error) {
    messages.push({
      sender: "Bruger",
      text: userMessage,
      timestamp: userTimestamp,
    });
    messages.push({ sender: "Bot", text: botReply, timestamp: botTimestamp });
  }

  // Send data to template
  res.render("index", { messages, botReply, error });
});

app.post("/add-response", (req, res) => {
  const { keyword, answer } = req.body;

  // Sanitize and validate input
  const validation = validateAddResponse(keyword, answer);

  if (!validation.isValid) {
    console.log("Fejl: Tomme felter");
    return res.redirect("/?error=empty_fields");
  }

  const { cleanKeyword, cleanAnswer } = validation;
  addNewResponse(cleanKeyword, cleanAnswer);

  res.redirect("/?success=response_added");
});

// Listen on port 3000
app.listen(PORT, () => console.log("Server running at" + PORT));
