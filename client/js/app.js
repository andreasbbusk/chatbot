const API_BASE_URL = "http://localhost:3000";

async function loadMessages() {
  const response = await fetch(`${API_BASE_URL}/api/messages`);
  if (!response.ok) {
    console.error(`Failed to load messages: ${response.status}`);
    return;
  }
  const data = await response.json();
  updateUI(data);
}

// This function is used to create the different message elements to populate HTML with API data ...
// ... This approach is used for seperation of concerns and to make the code more readable.
function createMessageElement(
  sender,
  text,
  timestamp,
  categoryTag,
  category,
  isLatest
) {
  const template = document.getElementById("message-template");
  const messageElement = template.content.cloneNode(true);

  const messageDiv = messageElement.querySelector("div");
  messageDiv.className += ` category-${category}`;

  if (isLatest) {
    messageDiv.id = "latest-message";
  }

  const isUser = sender === "Bruger";
  const messageContainer = messageElement.querySelector(".message-container");
  const senderIcon = messageElement.querySelector(".sender-icon");

  // Add appropriate class based on sender
  if (isUser) {
    messageContainer.classList.add("user-message");
    senderIcon.textContent = "👤";
  } else {
    messageContainer.classList.add("bot-message");
    senderIcon.textContent = "🤖";
  }

  messageElement.querySelector(".sender").textContent = sender;
  messageElement.querySelector(".category-tag").innerHTML = categoryTag;
  messageElement.querySelector(".timestamp").textContent = timestamp;
  messageElement.querySelector(".message-text").textContent = text;

  return messageElement;
}

// Function to update the UI with the API data...
function updateUI(data) {
  const chatMessages = document.getElementById("chat-messages");
  const welcomeSection = document.getElementById("welcome-section");
  const chatArea = document.getElementById("chat-area");

  const messages = data.data || [];
  const totalMessages = data.pagination ? data.pagination.totalMessages : 0;

  // Show/hide welcome section based on messages
  if (messages.length === 0) {
    welcomeSection.classList.remove("hidden");
    chatArea.classList.add("hidden");
  } else {
    welcomeSection.classList.add("hidden");
    chatArea.classList.remove("hidden");

    chatMessages.innerHTML = "";

    messages.forEach((message, index) => {
      const isLatest = index === messages.length - 1;
      const categoryTag =
        message.category && message.sender === "Bot"
          ? `<span class="px-2 py-1 text-xs text-blue-800 bg-blue-200 rounded-full">${message.category}</span>`
          : "";

      const timestamp = new Date(message.date).toLocaleTimeString("da-DK");

      // Create the message element to populate HTML with API data...
      const messageElement = createMessageElement(
        message.sender,
        message.text,
        timestamp,
        categoryTag,
        message.category || "ukategoriseret",
        isLatest
      );

      chatMessages.appendChild(messageElement);
    });

    document
      .getElementById("latest-message")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Update stats in welcome section
  const totalMessagesWelcome = document.getElementById(
    "total-messages-welcome"
  );
  if (totalMessagesWelcome) {
    totalMessagesWelcome.textContent = totalMessages;
  }
}

// Function to show the messages...
function showMessage(type, text) {
  const element = document.getElementById(`${type}-message`);
  const textElement = document.getElementById(`${type}-text`);
  textElement.textContent = text;
  element.classList.remove("hidden");
  setTimeout(() => element.classList.add("hidden"), 3000);
}
// Post request to the API to send a message...
const chatForm = document.getElementById("chat-form");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (!message) return;

  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    showMessage("error", `Server fejl: ${response.status}`);
    return;
  }

  const data = await response.json();

  if (data.error) {
    showMessage(
      "error",
      data.error === "empty_fields"
        ? "Både nøgleord og svar skal udfyldes!"
        : data.error
    );
  } else {
    // Reload messages using the GET endpoint to get the new format
    messageInput.value = "";
    await loadMessages();
  }
});

// Response form functionality moved to admin.html

// Delete request to the API to clear the messages...
const clearMessages = async () => {
  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: "DELETE",
  });
  if (!response.ok) {
    showMessage("error", `Fejl ved sletning: ${response.status}`);
    return;
  }
  loadMessages();
};

// Handle both desktop and mobile clear buttons
document
  .getElementById("clear-button")
  .addEventListener("click", clearMessages);
const clearButtonMobile = document.getElementById("clear-button-mobile");
if (clearButtonMobile) {
  clearButtonMobile.addEventListener("click", clearMessages);
}

// Add click handlers for suggestion cards
document.addEventListener("DOMContentLoaded", function () {
  const suggestionCards = document.querySelectorAll(".suggestion-card");
  const messageInput = document.getElementById("message-input");

  suggestionCards.forEach((card) => {
    card.addEventListener("click", function () {
      const title = this.querySelector(".font-medium").textContent;
      let suggestedMessage = "";

      switch (title) {
        case "Sig hej":
          suggestedMessage = "Hej!";
          break;
        case "Spørg om mad":
          suggestedMessage = "Hvad kan du anbefale at spise?";
          break;
        case "Vejret":
          suggestedMessage = "Hvordan er vejret?";
          break;
        case "Stil spørgsmål":
          suggestedMessage = "Hvad kan du hjælpe mig med?";
          break;
      }

      messageInput.value = suggestedMessage;
      messageInput.focus();
    });
  });
});

document.getElementById("message-input").focus();

loadMessages();
