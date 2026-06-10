// =============================================================
//  EWN HLM — Runtime Configuration
//  ⚠️  ADD THIS FILE TO .gitignore — NEVER COMMIT REAL SECRETS
//
//  Copy this file, fill in your real values, and load it in
//  index.html BEFORE main.js:
//    <script src="config.js"></script>
//    <script src="main.js"></script>
// =============================================================

window.__EWN_CONFIG__ = {
  // --- Firebase ---
  firebaseApiKey:            "YOUR_API_KEY",
  firebaseAuthDomain:        "YOUR_PROJECT.firebaseapp.com",
  firebaseDatabaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  firebaseProjectId:         "YOUR_PROJECT_ID",
  firebaseStorageBucket:     "YOUR_PROJECT.appspot.com",
  firebaseMessagingSenderId: "YOUR_SENDER_ID",
  firebaseAppId:             "YOUR_APP_ID",

  // --- Telegram Bot ---
  telegramBotToken: "YOUR_BOT_TOKEN",
  telegramChatId:   "YOUR_CHAT_ID",
};
