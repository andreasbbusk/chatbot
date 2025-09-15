const API_BASE_URL = "http://localhost:3000";

async function loadMessages() {
  const response = await fetch(`${API_BASE_URL}/api/messages`);
  const data = await response.json();
  updateUI(data);
}

function updateUI(data) {
  const chatMessages = document.getElementById("chat-messages");
  if (data.messages.length === 0) {
    chatMessages.innerHTML = '<p class="text-center text-gray-500">Ingen beskeder endnu. Start en samtale!</p>';
  } else {
    chatMessages.innerHTML = data.messages
      .map((message, index) => {
        const isUser = message.sender === "Bruger";
        const senderClass = isUser ? "bg-blue-100 ml-4" : "bg-gray-100 mr-4";
        const isLatest = index === data.messages.length - 1;
        const categoryTag = message.category && message.sender === "Bot" 
          ? `<span class="px-2 py-1 text-xs text-blue-800 bg-blue-200 rounded-lg">${message.category}</span>` 
          : "";
        const timestamp = new Date(message.timestamp).toLocaleTimeString("da-DK");
        
        return `
          <article class="max-w-full mb-3 p-3 rounded-lg ${senderClass} category-${message.category || "ukategoriseret"}" ${isLatest ? 'id="latest-message"' : ""}>
            <div class="flex flex-row justify-between items-center mb-2">
              <div class="flex flex-row gap-2 items-center">
                <strong>${message.sender}:</strong>
                ${categoryTag}
              </div>
              <span class="flex-shrink-0 text-xs text-gray-500">${timestamp}</span>
            </div>
            <div>${message.text}</div>
          </article>
        `;
      })
      .join("");

    document.getElementById("latest-message")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  document.getElementById("total-messages").textContent = data.totalMessages;
  document.getElementById("user-count").textContent = data.userCount;
  document.getElementById("bot-count").textContent = data.botCount;
}

function showMessage(type, text) {
  const element = document.getElementById(`${type}-message`);
  const textElement = document.getElementById(`${type}-text`);
  textElement.textContent = text;
  element.classList.remove("hidden");
  setTimeout(() => element.classList.add("hidden"), 3000);
}

document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById("message-input");
  const message = messageInput.value.trim();

  if (!message) return;

  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
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

document
  .getElementById("response-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const keyword = document.getElementById("keyword").value.trim();
    const answer = document.getElementById("answer").value.trim();

    const response = await fetch(`${API_BASE_URL}/api/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, answer }),
    });
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

document.getElementById("clear-button").addEventListener("click", async () => {
  await fetch(`${API_BASE_URL}/api/messages`, { method: "DELETE" });
  loadMessages();
});

document.getElementById("message-input").focus();
loadMessages();
