// Input sanitization function
export function sanitizeInput(input) {
  if (typeof input !== "string") return "";

  return input
    .replace(/[<>]/g, "") // Remove < and > (prevents HTML tags)
    .replace(/javascript:/gi, "") // Remove javascript: links
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .trim(); // Remove whitespace at start and end
}

// Input validation functions
export function validateChatMessage(userMessage) {
  let error = "";
  let botReply = "";

  if (!userMessage || userMessage.trim() === "") {
    error = "Du skal skrive en besked!";
    botReply = "Skriv en besked for at chatte!";
  } else if (userMessage.length < 2) {
    error = "Beskeden skal være mindst 2 tegn lang!";
    botReply = "Din besked er for kort. Prøv igen!";
  } else if (userMessage.length > 500) {
    error = "Beskeden er for lang (max 500 tegn)!";
    botReply = "Din besked er for lang. Prøv at gøre den kortere!";
  }

  return { error, botReply, isValid: !error };
}

export function validateAddResponse(keyword, answer) {
  const cleanKeyword = keyword?.trim().toLowerCase();
  const cleanAnswer = answer?.trim();

  if (!cleanKeyword || !cleanAnswer) {
    return { isValid: false, error: "empty_fields" };
  }

  return {
    isValid: true,
    cleanKeyword,
    cleanAnswer,
  };
}
