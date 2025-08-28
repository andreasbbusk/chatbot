import express from "express"; // Import express framework
import responses from "./responses.js";

const app = express();
const PORT = 3000;
const messages = [];

// Middleware setup
app.set("view engine", "ejs"); // Set EJS as the templating engine
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use("/public", express.static("public"));

// Input sanitization function
function sanitizeInput(input) {
  if (typeof input !== "string") return "";

  return input
    .replace(/[<>]/g, "") // Remove < and > (prevents HTML tags)
    .replace(/javascript:/gi, "") // Remove javascript: links
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .trim(); // Remove whitespace at start and end
}

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

    // First priority with if else statements
    if (
      lowerMessage === "godmorgen bot" ||
      lowerMessage === "godmorgen chatbot"
    ) {
      botReply = "Godmorgen! Hvad kan jeg hjælpe dig med i dag?";
      foundResponse = true;
    } else if (
      lowerMessage.includes("tusind tak") ||
      lowerMessage.includes("mange mange tak")
    ) {
      botReply = "Du er meget velkommen!";
      foundResponse = true;
    }
    // More complex conditions with if/else
    if (!foundResponse) {

      // Emotional conditions
      if (
        lowerMessage.includes("jeg er") &&
        (lowerMessage.includes("trist") || lowerMessage.includes("ked af det"))
      ) {
        botReply =
          "Det lyder som om du har det svært lige nu. Vil du fortælle mig hvad der er galt? 💙";
        foundResponse = true;
      } else if (
        lowerMessage.includes("jeg er") &&
        (lowerMessage.includes("glad") || lowerMessage.includes("lykkelig"))
      ) {
        botReply =
          "Hvor dejligt at høre! Jeg bliver også glad af at høre du har det godt! 😊 Hvad gør dig så glad?";
        foundResponse = true;
      }
      // Questions vs statements
      else if (lowerMessage.includes("kan du") && lowerMessage.includes("?")) {
        botReply = "Jeg kan prøve! Hvad vil du gerne have hjælp til?";
        foundResponse = true;
      }
    }

    // Swtich statements for more complex, exact conditions
    if (!foundResponse) {
      switch (lowerMessage) {
        case "hej bot":
        case "hej chatbot":
          botReply =
            "Hej! Dejligt at du bruger mit navn! Hvordan kan jeg hjælpe dig?";
          foundResponse = true;
          break;

        case "hvem er du":
        case "hvad er du":
          botReply =
            "Jeg er din personlige chatbot-assistent! Jeg er her for at chatte og hjælpe dig! 🤖";
          foundResponse = true;
          break;

        case "hvor kommer du fra":
          botReply =
            "Jeg kommer fra kode og kreativitet! Jeg blev skabt for at hjælpe dig! 💻";
          foundResponse = true;
          break;
      }
    }

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

    if (!foundResponse) {
      // Fallback if no keyword matches 
      if (lowerMessage.includes("?")) {
        botReply = `Interessant spørgsmål! Jeg er ikke sikker på svaret til "${userMessage}". Prøv at spørge om noget andet eller skriv "hjælp"! 🤔`;
      }
      else if (lowerMessage.length > 100) {
        botReply = `Det var en lang besked! Jeg forstod ikke alt, men prøv at spørge mere enkelt. Skriv "hjælp" for ideer! 📝`;
      }
      else {
        botReply = `Hmm, "${userMessage}" er nyt for mig. Prøv "hej", "hjælp" eller stil et spørgsmål! 💭`;
      }
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
