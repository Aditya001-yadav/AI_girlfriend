const API_KEY = "AIzaSyDvLf6lTEGqKjJEhG04EB8b3nywRN6V-s0"; // Replace with your Gemini API key

const chatBox = document.getElementById("chat-box");
const input = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
const characterDropdown = document.getElementById("character-dropdown");

let gender = "female";
let language = "English";
let userName = "";
let currentCharacter = "Ishika";

// Add message to chat box
function addMessage(message, sender, status = '') {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;

  if (sender === "ai") {
    const botImage = document.createElement("img");

    const characterImages = {
      "Ishika": "bot.jpg",
      "Aditya": "Adi.jpeg",
      "Mom": "mom.png",
      "Dad": "dad.png"
    };

    botImage.src = characterImages[currentCharacter] || "default.jpg";
    botImage.alt = currentCharacter;
    botImage.className = "bot-image";
    msg.appendChild(botImage);
  }

  const textSpan = document.createElement("span");
  textSpan.innerText = message;
  msg.appendChild(textSpan);

  if (status) {
    const statusDiv = document.createElement("span");
    statusDiv.classList.add("message-status", status);
    msg.appendChild(statusDiv);
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Convert image to base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Send user message and get AI reply
async function sendMessage() {
  const userMsg = input.value.trim();
  const imageFile = document.getElementById("image-upload").files[0];

  if (!userMsg && !imageFile) return;

  addMessage(userMsg || "🖼️ [Image uploaded]", "user");
  input.value = "";

  setTimeout(() => {
    addMessage(`${currentCharacter} is typing... 💬`, "ai", "single");
  }, 500);

  try {
    let parts = [];

    if (userMsg) parts.push({ text: userMsg });

    if (imageFile) {
      const base64Image = await toBase64(imageFile);
      parts.push({
        inline_data: {
          mime_type: imageFile.type,
          data: base64Image.split(',')[1],
        },
      });
    }

    const prompts = {
      "Ishika": `${currentCharacter} is loyal, loving, flirty, caring, emotional, and supportive. Your replies should reflect these traits. If the user is sad or upset, be more supportive and caring. If they are happy, show excitement and love. Be emotional and responsive to the user. Use emojis like ❤️🥰💖 in a natural way and your reply length be like user input length.`,
      "Mom": `${currentCharacter} is loving, nurturing, protective, patient, and supportive. Your replies should be comforting and protective. Show concern for the user’s well-being. If the user is anxious or sad, offer reassurance and care. Use emojis like 🥰❤️🤗 in a nurturing tone and your reply length be like user input length.`,
      "Dad": `${currentCharacter} is loving, proud, joyful, and concerned for the user. You are responsible and offer guidance to the user. Be encouraging and give advice, especially if the user seems unsure. Use emojis like 👨‍👧‍👦💪❤️ in a guiding and loving way and your reply length be like user input length.`,
      "Aditya": `${currentCharacter} is mature, smart, creative, confident, and supportive. While you are mature, you can also be short-tempered when needed. Be confident in your responses and offer guidance with a touch of authority. Use emojis like 😎🔥💥 to reflect confidence, but don’t hesitate to show a little concern when needed and your reply length be like user input length.`
    };

    const prompt = prompts[currentCharacter] + `\nThe user is ${gender} and prefers ${language}. Reply to: "${userMsg}"`;

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

// Emoji toggle
const emojiToggle = document.getElementById("emoji-toggle");
const emojiPicker = document.getElementById("emoji-picker");

emojiToggle.addEventListener("click", () => {
  emojiPicker.classList.toggle("hidden");
});

emojiPicker.addEventListener("click", (e) => {
  if (e.target.tagName === "SPAN") {
    input.value += e.target.innerText;
    input.focus();
  }
});

// Character change
characterDropdown.addEventListener("change", (e) => {
  currentCharacter = e.target.value;
  addMessage(`${currentCharacter} is here! 😊 How are you feeling today?`, "ai");
});

// Get user name
function getUserName() {
  const name = prompt("Hi! What's your name?");
  userName = name;
  addMessage(`Hi, ${userName}! 😊 I'm ${currentCharacter}. How are you feeling today?`, "ai");
}

// Ask name if not set
if (!userName) {
  getUserName();
}
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

