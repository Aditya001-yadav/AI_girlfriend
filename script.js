const API_KEY = "AIzaSyDvLf6lTEGqKjJEhG04EB8b3nywRN6V-s0"; // Replace with your Gemini API key

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");

function addMessage(message, sender, status = '') {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  
  // Add bot image for AI messages
  if (sender === "ai") {
    const botImage = document.createElement("img");
    botImage.src = "pic/bot.jpg"; // Ensure this path is correct and the image exists
    botImage.alt = "Bot"; // Alt text for the image
    botImage.className = "bot-image";
    msg.appendChild(botImage);
  }

  msg.innerText = message;

  // Add message status (single, double, or blue tick)
  if (status) {
    const statusDiv = document.createElement("span");
    statusDiv.classList.add("message-status", status);
    msg.appendChild(statusDiv);
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
}

// Simulate a delay for typing and adding tick marks (single, double, blue)
async function sendMessage() {
  const userMsg = input.value.trim();
  if (!userMsg) return;

  const language = document.getElementById("language").value;
  const gender = document.getElementById("gender").value;

  // Show user message with single tick
  addMessage(userMsg, "user", "single");
  input.value = ""; // Clear the input field

  // Simulate bot typing delay (0.5s)
  setTimeout(() => {
    addMessage("Sophia is typing... 💬", "ai", "single"); // Interesting name typing
  }, 500);

  // Fetch AI response after a delay (3s)
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
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      console.log(data); // Debugging to check the API response

      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Aww 🥺 I didn’t get that...";

      // Show bot response with blue tick after delay
      addMessage(aiText, "ai", "blue");
    } catch (err) {
      console.error(err);
      addMessage("Something went wrong 💔 Please try again.", "ai", "blue");
    }
  }, 3000); // 3s delay for the bot response
}

// Event listener for send button click
const sendButton = document.getElementById("send-btn");
sendButton.addEventListener("click", sendMessage);

// Optional: Allow user to press 'Enter' to send a message
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
