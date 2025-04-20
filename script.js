const API_KEY = "AIzaSyDvLf6lTEGqKjJEhG04EB8b3nywRN6V-s0"; // Replace with your Gemini API key

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");

let gender = "female";  // Example default, this can be dynamically set based on user preferences
let language = "English";  // Example default, this can also be dynamically set
let userName = ""; // The user's name will be stored once provided

// Add a message to the chat box
function addMessage(message, sender, status = '') {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;

  // Add bot image if sender is Ishika
  if (sender === "ai") {
    const botImage = document.createElement("img");
    botImage.src = "bot.jpg"; // Ensure this image exists in your project
    botImage.alt = "Ishika";
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

// Send a message (user + Ishika response)
async function sendMessage() {
  const userMsg = input.value.trim();
  const imageFile = document.getElementById("image-upload").files[0];

  if (!userMsg && !imageFile) return;

  // Show user message
  addMessage(userMsg || "🖼️ [Image uploaded]", "user");
  input.value = "";

  // Simulate Ishika is typing...
  setTimeout(() => {
    addMessage("Ishika is typing... 💬", "ai", "single");
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

    // Personalized prompt for Ishika based on user's preferences
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
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini response:", data);

    const aiText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Aww 🥺 I didn’t get that...";

    // Add emotional support message if needed
    if (aiText.includes("sad") || aiText.includes("hurt")) {
      addMessage("I'm so sorry you're feeling that way. 😔 I'm here for you. 💖", "ai", "blue");
    } else {
      addMessage(aiText, "ai", "blue");
    }
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

// Function to get the user's name
function getUserName() {
  const name = prompt("Hi! What's your name?");
  userName = name;
  addMessage(`Hi, ${userName}! 😊 I'm Ishika. How are you feeling today?`, "ai");
}

// Trigger for the user's name on first visit
if (!userName) {
  getUserName();
}
// Voice recognition setup
const micButton = document.getElementById("mic-btn");

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  micButton.addEventListener("click", () => {
    recognition.start();
    micButton.innerText = "🎙️"; // Active mic icon
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    sendMessage(); // Optional: send automatically
    micButton.innerText = "🎤";
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    micButton.innerText = "🎤";
    addMessage("Sorry 😢 I couldn't hear you. Please try again.", "ai");
  };

  recognition.onend = () => {
    micButton.innerText = "🎤";
  };
} else {
  micButton.disabled = true;
  micButton.title = "Speech Recognition not supported in this browser";
}

