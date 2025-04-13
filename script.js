const API_KEY = "AIzaSyDvLf6lTEGqKjJEhG04EB8b3nywRN6V-s0"; // Replace with your Gemini API key

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");

// Add a message to the chat box
function addMessage(message, sender, status = '') {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;

  // Add bot image if sender is AI
  if (sender === "ai") {
    const botImage = document.createElement("img");
    botImage.src = "bot.jpg"; // Make sure this image exists in the 'pic' folder
    botImage.alt = "Bot";
    botImage.className = "bot-image";
    msg.appendChild(botImage);
  }

  // Add the message text
  const textSpan = document.createElement("span");
  textSpan.innerText = message;
  msg.appendChild(textSpan);

  // Add tick/status if available
  if (status) {
    const statusDiv = document.createElement("span");
    statusDiv.classList.add("message-status", status);
    msg.appendChild(statusDiv);
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send a message (user + AI response)
async function sendMessage() {
  const userMsg = input.value.trim();
  if (!userMsg) return;

  const language = document.getElementById("language")?.value || "English";
  const gender = document.getElementById("gender")?.value || "boy";

  // Show user message
  addMessage(userMsg, "user", "single");
  input.value = "";

  // Simulate AI is typing...
  setTimeout(() => {
    addMessage("Ishika is typing... 💬", "ai", "single");
  }, 500);

  // Get AI response after 3 seconds
  setTimeout(async () => {
    try {
      const prompt = `You are an AI girlfriend. Reply in a sweet, emotional way like an Instagram girl using emojis 💖🥺💕. The user is ${gender} and prefers ${language}. Reply to: "${userMsg}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      const data = await response.json();
      console.log("Gemini response:", data);

      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Aww 🥺 I didn’t get that...";

      addMessage(aiText, "ai", "blue");
    } catch (err) {
      console.error("Error from Gemini API:", err);
      addMessage("Something went wrong 💔 Please try again.", "ai", "blue");
    }
  }, 3000);
}

// Send button click
sendButton.addEventListener("click", sendMessage);

// Enter key press
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
