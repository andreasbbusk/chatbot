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
  senderClass,
  category,
  isLatest
) {
  const template = document.getElementById("message-template");
  const messageElement = template.content.cloneNode(true);

  const article = messageElement.querySelector("article");
  article.className += ` ${senderClass} category-${category}`;

  if (isLatest) {
    article.id = "latest-message";
  }

  messageElement.querySelector(".sender").textContent = `${sender}:`;
  messageElement.querySelector(".category-tag").innerHTML = categoryTag;
  messageElement.querySelector(".timestamp").textContent = timestamp;
  messageElement.querySelector(".message-text").textContent = text;

  return messageElement;
}

// Function to update the UI with the API data...
function updateUI(data) {
  const chatMessages = document.getElementById("chat-messages");
  if (data.messages.length === 0) {
    chatMessages.innerHTML;
  } else {
    chatMessages.innerHTML = "";

    data.messages.forEach((message, index) => {
      const isUser = message.sender === "Bruger";
      const senderClass = isUser ? "bg-blue-100 ml-4" : "bg-gray-100 mr-4";
      const isLatest = index === data.messages.length - 1;
      const categoryTag =
        message.category && message.sender === "Bot"
          ? `<span class="px-2 py-1 text-xs text-blue-800 bg-blue-200 rounded-lg">${message.category}</span>`
          : "";
      const timestamp = new Date(message.timestamp).toLocaleTimeString("da-DK");
      // Create the message element to populate HTML with API data...
      const messageElement = createMessageElement(
        message.sender,
        message.text,
        timestamp,
        categoryTag,
        senderClass,
        message.category || "ukategoriseret",
        isLatest
      );

      chatMessages.appendChild(messageElement);
    });

    document
      .getElementById("latest-message")
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  document.getElementById("total-messages").textContent = data.totalMessages;
  document.getElementById("user-count").textContent = data.userCount;
  document.getElementById("bot-count").textContent = data.botCount;
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
    updateUI(data);
    messageInput.value = "";
  }
});

// Post request to the API to add a new response...
const responseForm = document.getElementById("response-form");

responseForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const keyword = document.getElementById("keyword").value.trim();
  const answer = document.getElementById("answer").value.trim();

  const response = await fetch(`${API_BASE_URL}/api/responses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keyword, answer }),
  });
  
  if (!response.ok) {
    showMessage("error", `Server fejl: ${response.status}`);
    return;
  }
  
  const data = await response.json();

  if (data.error) {
    showMessage("error", "Både nøgleord og svar skal udfyldes!");
  } else {
    showMessage(
      "success",
      "Nyt svar tilføjet! Prøv at skrive nøgleordet i chatten."
    );
    document.getElementById("keyword").value = "";
    document.getElementById("answer").value = "";
  }
});

// Delete request to the API to clear the messages...
document.getElementById("clear-button").addEventListener("click", async () => {
  const response = await fetch(`${API_BASE_URL}/api/messages`, { method: "DELETE" });
  if (!response.ok) {
    showMessage("error", `Fejl ved sletning: ${response.status}`);
    return;
  }
  loadMessages();
});

document.getElementById("message-input").focus();

loadMessages();