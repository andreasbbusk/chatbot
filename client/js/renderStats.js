const API_BASE_URL = "http://localhost:3000";

async function loadStats() {
  try {
    const messagesResponse = await fetch(`${API_BASE_URL}/api/messages`);
    const messagesData = await messagesResponse.json();

    const statsResponse = await fetch(`${API_BASE_URL}/api/stats`);
    const statsData = await statsResponse.json();

    displayGeneralStats(messagesData);
    displayCategoryStats(statsData.categoryStats);
  } catch (error) {
    console.error("Kunne ikke indlæse statistik:", error);
  }
}

function displayGeneralStats(data) {
  const messages = data.data || [];
  const totalMessages = data.pagination ? data.pagination.totalMessages : 0;
  const userMessages = messages.filter((msg) => msg.sender === "Bruger").length;
  const botMessages = messages.filter((msg) => msg.sender === "Bot").length;

  document.getElementById("total-messages").textContent = totalMessages;
  document.getElementById("user-messages").textContent = userMessages;
  document.getElementById("bot-messages").textContent = botMessages;
}

function displayCategoryStats(categoryStats) {
  const statsElement = document.getElementById("category-stats");

  if (Object.keys(categoryStats).length === 0) {
    statsElement.textContent = "Ingen kategori-data endnu";
    return;
  }

  const sortedCategories = Object.keys(categoryStats).sort(
    (a, b) => categoryStats[b] - categoryStats[a]
  );
  
  const totalCategoryMessages = Object.values(categoryStats).reduce(
    (sum, count) => sum + count,
    0
  );

  // Function to display category names properly
  const getCategoryDisplayName = (category) => {
    const displayNames = {
      hilsen: "Hilsner",
      mad: "Mad & drikke",
      følelser: "Følelser",
      spørgsmål: "Spørgsmål",
      komplimenter: "Komplimenter",
      vejr: "Vejr",
      hobbyer: "Hobbyer",
      høflighed: "Høflighed",
      afskeder: "Afskeder",
      ukategoriseret: "Ukategoriseret",
      "bruger-lært": "Bruger-lært",
    };
    return displayNames[category] || category;
  };

  statsElement.innerHTML = "";

  sortedCategories.forEach((category) => {
    const count = categoryStats[category];
    const percentage = ((count / totalCategoryMessages) * 100).toFixed(1);

    const item = document.createElement("div");
    item.className = "flex justify-between p-2 border-b";
    item.innerHTML = `
      <span>${getCategoryDisplayName(category)}</span>
      <span>${count} (${percentage}%)</span>
    `;
    statsElement.appendChild(item);
  });
}

loadStats();
