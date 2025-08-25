import express from "express"; // Import express framework

const app = express();

const PORT = 3000;

app.set("view engine", "ejs"); // Set EJS as the templating engine
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use("/public", express.static("public"));

const messages = [];

// GET - render the index page
app.get("/", (req, res) => {
  res.render("index", { messages, botReply: "" });
});

// POST-request - handle chat messages
app.post("/chat", (req, res) => {
  const userMessage = req.body.message; // Get message from form
  let botReply = "";

  // Check if empty
  if (!userMessage || userMessage.trim() === "") {
    botReply = "Skriv en besked for at chatte!";
  } else {
    botReply = `Du skrev: ${userMessage}`;

    messages.push({ sender: "Bruger", text: userMessage });
    messages.push({ sender: "Bot", text: botReply });
  }

  // Send data to template
  res.render("index", { messages, botReply });
});

// Listen on port 3000
app.listen(PORT, () => console.log("Server running at" + PORT));
