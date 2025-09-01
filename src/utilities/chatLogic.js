import responses from "../data/responses.js";

// Chat logic functions - now returns both response and category
export function generateBotResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();
  let foundResponse = false;
  let botReply = "";
  let matchedCategory = "ukategoriseret"; // Default category: uncategorized

  // First priority with if else statements (with manual categories)
  if (
    lowerMessage === "godmorgen bot" ||
    lowerMessage === "godmorgen chatbot"
  ) {
    botReply = "Godmorgen! Hvad kan jeg hjælpe dig med i dag?";
    matchedCategory = "hilsen"; // Category: greeting
    foundResponse = true;
  } else if (
    lowerMessage.includes("tusind tak") ||
    lowerMessage.includes("mange mange tak")
  ) {
    botReply = "Du er meget velkommen!";
    matchedCategory = "høflighed"; // Category: politeness
    foundResponse = true;
  }

  // More complex conditions with if/else (with manual categories)
  if (!foundResponse) {
    // Emotional conditions
    if (
      lowerMessage.includes("jeg er") &&
      (lowerMessage.includes("trist") || lowerMessage.includes("ked af det"))
    ) {
      botReply =
        "Det lyder som om du har det svært lige nu. Vil du fortælle mig hvad der er galt? 💙";
      matchedCategory = "følelser"; // Category: emotions
      foundResponse = true;
    } else if (
      lowerMessage.includes("jeg er") &&
      (lowerMessage.includes("glad") || lowerMessage.includes("lykkelig"))
    ) {
      botReply =
        "Hvor dejligt at høre! Jeg bliver også glad af at høre du har det godt! 😊 Hvad gør dig så glad?";
      matchedCategory = "følelser"; // Category: emotions
      foundResponse = true;
    }
    // Questions vs statements
    else if (lowerMessage.includes("kan du") && lowerMessage.includes("?")) {
      botReply = "Jeg kan prøve! Hvad vil du gerne have hjælp til?";
      matchedCategory = "spørgsmål"; // Category: questions
      foundResponse = true;
    }
  }

  // Switch statements for more complex, exact conditions (with manual categories)
  if (!foundResponse) {
    switch (lowerMessage) {
      case "hej bot":
      case "hej chatbot":
        botReply =
          "Hej! Dejligt at du bruger mit navn! Hvordan kan jeg hjælpe dig?";
        matchedCategory = "hilsen"; // Category: greeting
        foundResponse = true;
        break;

      case "hvem er du":
      case "hvad er du":
        botReply =
          "Jeg er din personlige chatbot-assistent! Jeg er her for at chatte og hjælpe dig! 🤖";
        matchedCategory = "spørgsmål"; // Category: questions
        foundResponse = true;
        break;

      case "hvor kommer du fra":
        botReply =
          "Jeg kommer fra kode og kreativitet! Jeg blev skabt for at hjælpe dig! 💻";
        matchedCategory = "spørgsmål"; // Category: questions
        foundResponse = true;
        break;
    }
  }

  // Loop through all response objects and get category from matched response
  for (const response of responses) {
    // Check if any keywords match
    for (const keyword of response.keywords) {
      if (lowerMessage.includes(keyword)) {
        // Choose a random answer from answers array
        const randomIndex = Math.floor(Math.random() * response.answers.length);
        botReply = response.answers[randomIndex];
        matchedCategory = response.category || "ukategoriseret"; // Use response category or default
        foundResponse = true;
        break;
      }
    }
    if (foundResponse) break;
  }

  if (!foundResponse) {
    // Fallback if no keyword matches (with appropriate categories)
    if (lowerMessage.includes("?")) {
      botReply = `Interessant spørgsmål! Jeg er ikke sikker på svaret til "${userMessage}". Prøv at spørge om noget andet eller skriv "hjælp"! 🤔`;
      matchedCategory = "spørgsmål"; // Category: questions
    } else if (lowerMessage.length > 100) {
      botReply = `Det var en lang besked! Jeg forstod ikke alt, men prøv at spørge mere enkelt. Skriv "hjælp" for ideer! 📝`;
      matchedCategory = "ukategoriseret"; // Category: uncategorized
    } else {
      botReply = `Hmm, "${userMessage}" er nyt for mig. Prøv "hej", "hjælp" eller stil et spørgsmål! 💭`;
      matchedCategory = "ukategoriseret"; // Category: uncategorized
    }
  }

  // Special category-based logic
  if (matchedCategory === "følelser") {
    botReply += " Vil du fortælle mig mere om hvordan du har det?";
  } else if (matchedCategory === "spørgsmål") {
    botReply += " Spørg endelig igen hvis du vil vide mere!";
  }

  return { botReply, matchedCategory }; // Return both response and category
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
    // Create new response with default category for user-learned responses
    responses.push({
      keywords: [cleanKeyword],
      answers: [cleanAnswer],
      category: "bruger-lært", // Category: user-learned
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
