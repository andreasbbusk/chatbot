import express from "express"; // Import express framework
import responses from "./responses.js";

const app = express();

const PORT = 3000;

// Input sanitization function
function sanitizeInput(input) {
  if (typeof input !== "string") return "";

  return input
    .replace(/[<>]/g, "") // Remove < and > (prevents HTML tags)
    .replace(/javascript:/gi, "") // Remove javascript: links
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .trim(); // Remove whitespace at start and end
}

// Advanced sanitization version
function sanitizeInputAdvanced(input) {
  if (typeof input !== "string") return "";

  return input
    .replace(/[<>'"]/g, "") // Remove potentially dangerous characters
    .replace(/script/gi, "") // Remove "script" word
    .slice(0, 500) // Limit length to 500 characters
    .trim();
}

app.set("view engine", "ejs"); // Set EJS as the templating engine
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use("/public", express.static("public"));

const messages = [];

// GET - render the index page
app.get("/", (req, res) => {
  res.render("index", { messages, botReply: "", error: "" });
});

// POST-request - handle chat messages
app.post("/chat", (req, res) => {
  let userMessage = req.body.message;

  // Sanitize input FIRST
  userMessage = sanitizeInput(userMessage);

  let botReply = "";
  let error = "";

  // Validate input
  if (!userMessage || userMessage.trim() === "") {
    error = "Du skal skrive en besked!";
    botReply = "Skriv en besked for at chatte!";
  } else if (userMessage.length < 2) {
    error = "Beskeden skal være mindst 2 tegn lang!";
    botReply = "Din besked er for kort. Prøv igen!";
  } else if (userMessage.length > 500) {
    error = "Beskeden er for lang (max 500 tegn)!";
    botReply = "Din besked er for lang. Prøv at gøre den kortere!";
  } else {
    // Normal chat logic here...
    const lowerMessage = userMessage.toLowerCase();
    let foundResponse = false;

    // Loop through all response objects
    for (const response of responses) {
      // Check if any keywords match
      for (const keyword of response.keywords) {
        if (lowerMessage.includes(keyword)) {
          // Choose a random answer from answers array
          const randomIndex = Math.floor(
            Math.random() * response.answers.length
          );
          botReply = response.answers[randomIndex];
          foundResponse = true;
          break;
        }
      }
      if (foundResponse) break;
    }

    // Fallback if no keyword matches
    if (!foundResponse) {
      botReply = `Du skrev: "${userMessage}". Prøv at skrive "hej" eller "hjælp"!`;
    }
  }

  // Save messages only if there's no error
  if (!error) {
    messages.push({ sender: "Bruger", text: userMessage });
    messages.push({ sender: "Bot", text: botReply });
  }

  // Send data to template
  res.render("index", { messages, botReply, error });
});

// Listen on port 3000
app.listen(PORT, () => console.log("Server running at" + PORT));
