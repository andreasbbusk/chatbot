const API_BASE_URL = "http://localhost:3000";

// Function to show messages
function showMessage(type, text) {
  const element = document.getElementById(`${type}-message`);
  const textElement = document.getElementById(`${type}-text`);
  textElement.textContent = text;
  element.classList.remove("hidden");
  setTimeout(() => element.classList.add("hidden"), 3000);
}

// Post request to the API to add a new response
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
      "Nyt svar tilføjet! Gå tilbage til chatten og prøv at skrive nøgleordet."
    );
    document.getElementById("keyword").value = "";
    document.getElementById("answer").value = "";
  }
});

// Focus on first input
document.getElementById("keyword").focus();
