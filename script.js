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
    botImage.src = "bot.jpg"; // Ensure this image exists in your project
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

// Convert image file to base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Send a message (user + AI response)
async function sendMessage() {
  const userMsg = input.value.trim();
  const imageFile = document.getElementById("image-upload").files[0];

  if (!userMsg && !imageFile) return;

  // Show user message
  addMessage(userMsg || "🖼️ [Image uploaded]", "user");
  input.value = "";

  // Simulate AI is typing...
  setTimeout(() => {
    addMessage("Aditi is typing... 💬", "ai", "single");
  }, 500);

  try {
    let parts = [];

    if (userMsg) parts.push({ text: userMsg });

    if (imageFile) {
      const base64Image = await toBase64(imageFile);
      parts.push({
        inline_data: {
          mime_type: imageFile.type,
          data: base64Image.split(',')[1], // remove base64 header
        },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts }],
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
}

// Send button click
sendButton.addEventListener("click", sendMessage);

// Enter key press
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Emoji Picker functionality
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
