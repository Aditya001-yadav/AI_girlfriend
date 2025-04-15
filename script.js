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
    addMessage("Aditi is typing... 💬", "ai", "single");
  }, 500);

  // Get AI response after 3 seconds
  setTimeout(async () => {
    try {
      const prompt = `You are an emotionally supportive best friend. Your replies should feel human, understanding, and comforting. 
- Adjust your tone to match the user's emotional state and language. 
- If the user is short or casual, respond briefly. 
- If the user is emotional, confused, or expressive, be more thoughtful and supportive.
- Use emojis naturally and only when they enhance emotional connection (e.g., 😊❤️🥺). 
- Never reveal you are an AI. Just be a real, caring friend who listens, understands, and responds genuinely. 

The user is ${gender} and prefers ${language}. Reply to: "${userMsg}"`;


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
// Your existing API_KEY and sendMessage function remains same above

const emojiToggle = document.getElementById("emoji-toggle");
const emojiPicker = document.getElementById("emoji-picker");

// Toggle emoji panel
emojiToggle.addEventListener("click", () => {
  emojiPicker.classList.toggle("hidden");
});

// Add emoji to input
emojiPicker.addEventListener("click", (e) => {
  if (e.target.tagName === "SPAN") {
    input.value += e.target.innerText;
    input.focus();
  }
});

