import responses from "../data/responses.js";

// Chat logic functions
export function generateBotResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  let foundResponse = false;
  let botReply = "";

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

  // Switch statements for more complex, exact conditions
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
        const randomIndex = Math.floor(Math.random() * response.answers.length);
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
    } else if (lowerMessage.length > 100) {
      botReply = `Det var en lang besked! Jeg forstod ikke alt, men prøv at spørge mere enkelt. Skriv "hjælp" for ideer! 📝`;
    } else {
      botReply = `Hmm, "${userMessage}" er nyt for mig. Prøv "hej", "hjælp" eller stil et spørgsmål! 💭`;
    }
  }

  return botReply;
}

export function addNewResponse(cleanKeyword, cleanAnswer) {
  // Find existing response or create new one
  const existingResponse = responses.find((resp) =>
    resp.keywords.includes(cleanKeyword)
  );

  if (existingResponse) {
    existingResponse.answers.push(cleanAnswer);
    console.log(`Tilføjet nyt svar til eksisterende keyword: ${cleanKeyword}`);
  } else {
    responses.push({
      keywords: [cleanKeyword],
      answers: [cleanAnswer],
    });
    console.log(`Oprettet nyt keyword: ${cleanKeyword}`);
  }

  // Track user-learned responses
  global.userLearnedResponses = global.userLearnedResponses || [];
  global.userLearnedResponses.push({
    keyword: cleanKeyword,
    answer: cleanAnswer,
    timestamp: new Date(),
  });
}
