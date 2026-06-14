// =============================================================
//  EWN HLM — Firebase Initialization (compat SDK)
//  Loaded after config.js; exposes __EWN_DB__ and __EWN_AUTH__
// =============================================================
(function () {
  const cfg = window.__EWN_CONFIG__ || window.EWN_CONFIG || {};
  if (typeof firebase === 'undefined') {
    window.__EWN_FIREBASE_READY__ = false;
    return;
  }
  if (!cfg.firebaseApiKey) {
    window.__EWN_FIREBASE_READY__ = false;
    return;
  }
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: cfg.firebaseApiKey,
      authDomain: cfg.firebaseAuthDomain,
      databaseURL: cfg.firebaseDatabaseURL,
      projectId: cfg.firebaseProjectId,
      storageBucket: cfg.firebaseStorageBucket,
      messagingSenderId: cfg.firebaseMessagingSenderId,
      appId: cfg.firebaseAppId
    });
  }
  window.__EWN_DB__ = firebase.database();
  if (typeof firebase.auth === 'function') {
    window.__EWN_AUTH__ = firebase.auth();
  }
  window.__EWN_FIREBASE_READY__ = true;
})();
