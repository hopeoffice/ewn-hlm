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
  // --- Cloudinary (unsigned upload preset — safe for client-side) ---
  cloudinaryCloudName:   "dx0qryavd",
  cloudinaryUploadPreset: "my_shop_preset",

  // --- Firebase ---
  firebaseApiKey:            "AIzaSyCuossm_59sq5Ljg7xN084cbb0b9TDz6fw",
  firebaseAuthDomain:        "ewn-hlm.firebaseapp.com",
  firebaseDatabaseURL:       "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
  firebaseProjectId:         "ewn-hlm",
  firebaseStorageBucket:     "ewn-hlm.firebasestorage.app",
  firebaseMessagingSenderId: "770896835814",
  firebaseAppId:             "1:770896835814:web:ffdae308d2f34cbfaaf727",

  // --- Telegram Bot ---
  telegramBotToken: "YOUR_BOT_TOKEN",
  telegramChatId:   "YOUR_CHAT_ID",
};
