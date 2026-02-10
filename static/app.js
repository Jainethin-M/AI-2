(() => {
  const chatEl = document.getElementById("chat");
  const inputEl = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const clearBtn = document.getElementById("clearBtn");
  const themeToggle = document.getElementById("themeToggle");
  const toastEl = document.getElementById("toast");
  const voiceBtn = document.getElementById("voiceBtn");
  const voiceLangEl = document.getElementById("voiceLang");

  const composerHintEl = document.getElementById("composerHint");
  const defaultComposerHint = composerHintEl ? composerHintEl.textContent : "";


  const convoList = document.getElementById("convoList");
  const newChatBtn = document.getElementById("newChatBtn");
  const searchInput = document.getElementById("searchInput");

  const chatTitle = document.getElementById("chatTitle");
  const chatSubtitle = document.getElementById("chatSubtitle");
  const netStatus = document.getElementById("netStatus");

  const toggleSidebarBtn = document.getElementById("toggleSidebar");
  const sidebarEl = document.querySelector(".sidebar");

  // --- Theme ---
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.dataset.theme = savedTheme;

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme || "dark";
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    toast(`Theme: ${next}`);
  });

  // --- Sidebar toggle (mobile) ---
  toggleSidebarBtn.addEventListener("click", () => {
    sidebarEl.classList.toggle("sidebar--open");
  });

  // --- Conversations (frontend-only mock) ---
  let convos = [
    { id: "general", title: "General", last: "POSTs to /api/messages", time: "Now", avatar: "G" },
    { id: "ideas", title: "Ideas", last: "UI-first chat app design", time: "Today", avatar: "I" },
    { id: "support", title: "Support", last: "No backend replies yet", time: "Today", avatar: "S" },
  ];

  let activeConvoId = "general";

  function renderConvos(filter = "") {
    const f = filter.trim().toLowerCase();
    convoList.innerHTML = "";

    convos
      .filter(c => !f || c.title.toLowerCase().includes(f) || c.last.toLowerCase().includes(f))
      .forEach(c => {
        const item = document.createElement("div");
        item.className = "convo" + (c.id === activeConvoId ? " convo--active" : "");
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.innerHTML = `
          <div class="convo__avatar" aria-hidden="true">${escapeHtml(c.avatar)}</div>
          <div class="convo__meta">
            <div class="convo__title">${escapeHtml(c.title)}</div>
            <div class="convo__last">${escapeHtml(c.last)}</div>
          </div>
          <div class="convo__time">${escapeHtml(c.time)}</div>
        `;

        const activate = () => {
          activeConvoId = c.id;
          chatTitle.textContent = c.title;
          chatSubtitle.innerHTML = `Messages will POST to <code>/api/messages</code>`;
          renderConvos(searchInput.value);

          // For demo: clear message area on convo switch (frontend-only behavior)
          clearMessages(false);
          addSystemMessage(`You are now chatting in “${c.title}”.`);
          sidebarEl.classList.remove("sidebar--open");
        };

        item.addEventListener("click", activate);
        item.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") activate();
        });

        convoList.appendChild(item);
      });
  }

  searchInput.addEventListener("input", () => renderConvos(searchInput.value));

  newChatBtn.addEventListener("click", () => {
    const id = "chat_" + Math.random().toString(16).slice(2);
    const title = "New Chat";
    convos = [{ id, title, last: "Say hello 👋", time: "Now", avatar: "N" }, ...convos];
    activeConvoId = id;
    renderConvos(searchInput.value);
    clearMessages(false);
    chatTitle.textContent = title;
    addSystemMessage("New chat created. Your messages will be sent to the backend endpoint.");
    sidebarEl.classList.remove("sidebar--open");
  });

  // --- Message rendering ---
  function nowTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function addMessage({ role = "user", text = "", status = "Sending…" } = {}) {
    const msg = document.createElement("div");
    msg.className = "msg " + (role === "user" ? "msg--user" : "msg--other");

    const avatar = role === "user" ? "U" : role === "system" ? "•" : "A";

    const metaStatusClass =
      status === "Sent" ? "status status--ok"
      : status === "Failed" ? "status status--bad"
      : "status";

    msg.innerHTML = `
      ${role === "user" ? "" : `<div class="msg__avatar" aria-hidden="true">${escapeHtml(avatar)}</div>`}
      <div class="bubble" role="group" aria-label="${role} message">
        <div class="bubble__text">${escapeHtml(text)}</div>
        <div class="bubble__meta">
          <span class="time">${escapeHtml(nowTime())}</span>
          ${role === "user" ? `<span class="${metaStatusClass}" data-status>${escapeHtml(status)}</span>` : ""}
        </div>
      </div>
      ${role === "user" ? `<div class="msg__avatar" aria-hidden="true">${escapeHtml(avatar)}</div>` : ""}
    `;

    chatEl.appendChild(msg);
    chatEl.scrollTop = chatEl.scrollHeight;

    return msg;
  }

  function addSystemMessage(text) {
    // Render as "other" bubble, but labeled system-ish.
    const el = addMessage({ role: "other", text });
    el.querySelector(".msg__avatar").textContent = "•";
  }

  // --- Clear ---
  function clearMessages(showToast = true) {
    chatEl.innerHTML = "";
    const notice = document.createElement("div");
    notice.className = "notice";
    notice.innerHTML = `
      <div class="notice__title">Conversation cleared</div>
      <div class="notice__text">This is frontend-only for now. Your next message will still POST to <code>/api/messages</code>.</div>
    `;
    chatEl.appendChild(notice);
    if (showToast) toast("Cleared");
  }

  clearBtn.addEventListener("click", () => clearMessages(true));

  // --- Toast ---
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("toast--show"), 2200);
  }


  // --- Voice typing (Speech-to-Text via Web Speech API) ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition = null;
  let voiceShouldBeOn = false; // user intent (toggled by button)
  let voiceIsActive = false;   // actual recognition session state

  // We insert dictation at the caret position captured when starting
  let voiceBaseBefore = "";
  let voiceBaseAfter = "";
  let voiceFinalTranscript = "";

  function appendWithSpace(a, b) {
    const A = (a || "").trim();
    const B = (b || "").trim();
    if (!A) return B;
    if (!B) return A;
    return A + " " + B;
  }

  function setVoiceUI(listening) {
    if (!voiceBtn) return;

    voiceBtn.classList.toggle("chipbtn--active", listening);
    voiceBtn.setAttribute("aria-pressed", listening ? "true" : "false");

    const label = voiceBtn.querySelector("span");
    if (label) label.textContent = listening ? "Listening…" : "Voice";

    voiceBtn.title = listening ? "Click to stop voice typing" : "Voice typing";
  }

  function startVoiceTyping() {
    if (!recognition) return;

    // Capture insert position once at start
    const start =
      typeof inputEl.selectionStart === "number" ? inputEl.selectionStart : inputEl.value.length;
    const end =
      typeof inputEl.selectionEnd === "number" ? inputEl.selectionEnd : start;

    voiceBaseBefore = inputEl.value.slice(0, start);
    voiceBaseAfter = inputEl.value.slice(end);
    voiceFinalTranscript = "";

    voiceShouldBeOn = true;

    // Prevent user edits while we are continuously rewriting interim text
    inputEl.readOnly = true;
    inputEl.focus();

    if (composerHintEl) {
      composerHintEl.textContent = "Listening… Speak now. Click the mic again to stop.";
    }

    setVoiceUI(true);

    try {
      recognition.start();
    } catch (e) {
      // Can throw if start is called too quickly / already started
      console.warn("SpeechRecognition.start() failed:", e);
    }
  }

  function getSelectedVoiceLang() {
    if (voiceLangEl && voiceLangEl.value) return voiceLangEl.value;
    return navigator.language || "en-IN";
  }


  function stopVoiceTyping(silent = false) {
    voiceShouldBeOn = false;

    // Stop the recognition session if it's currently active
    if (recognition && voiceIsActive) {
      try {
        recognition.stop();
      } catch (e) {
        console.warn("SpeechRecognition.stop() failed:", e);
      }
    }

    inputEl.readOnly = false;
    setVoiceUI(false);

    if (composerHintEl) composerHintEl.textContent = defaultComposerHint;
    if (!silent) toast("Voice typing stopped");
  }

  function setupVoiceTyping() {
    if (!voiceBtn) return;

    // Browser support check
    if (!SpeechRecognition) {
      voiceBtn.disabled = true;
      voiceBtn.title = "Voice typing isn’t supported in this browser";
      voiceBtn.addEventListener("click", () => {
        toast("Voice typing isn’t supported in this browser (try Chrome).");
      });
      return;
    }

    // Recognition
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // ✅ Set initial language from dropdown
    recognition.lang = getSelectedVoiceLang();

    // ✅ If user changes language, apply + restart if listening
    if (voiceLangEl) {
      voiceLangEl.addEventListener("change", () => {
        if (!recognition) return;

        recognition.lang = getSelectedVoiceLang();

        const label = voiceLangEl.options[voiceLangEl.selectedIndex]?.text || voiceLangEl.value;
        toast(`Voice language: ${label}`);

        // If currently listening, restart to apply immediately
        if (voiceShouldBeOn) {
          try { recognition.stop(); } catch (_) {}
          // onend will auto-restart because voiceShouldBeOn stays true
        }
      });
    }

    recognition.onstart = () => {
      voiceIsActive = true;
      setVoiceUI(true);
    };

    recognition.onresult = (event) => {
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const transcript = (res[0]?.transcript || "").trim();
        if (!transcript) continue;

        if (res.isFinal) {
          voiceFinalTranscript = appendWithSpace(voiceFinalTranscript, transcript);
        } else {
          interim = appendWithSpace(interim, transcript);
        }
      }

      const combined = appendWithSpace(voiceFinalTranscript, interim);
      inputEl.value = voiceBaseBefore + combined + voiceBaseAfter;

      // Keep caret at the end of the inserted speech chunk
      const caretPos = (voiceBaseBefore + combined).length;
      try {
        inputEl.setSelectionRange(caretPos, caretPos);
      } catch (_) {}

      autoResize();
    };

    recognition.onerror = (event) => {
      const err = event?.error || "unknown";
      console.warn("SpeechRecognition error:", err, event);

      // Permission/mic errors should stop and release readOnly
      if (err === "not-allowed" || err === "service-not-allowed") {
        toast("Microphone permission denied.");
        stopVoiceTyping(true);
      } else if (err === "audio-capture") {
        toast("No microphone found.");
        stopVoiceTyping(true);
      } else if (err === "network") {
        toast("Speech service network error. Check internet.");
        stopVoiceTyping(true);
      } else {
        // e.g. 'no-speech' happens often; onend will auto-restart if user still wants it
      }
    };

    recognition.onend = () => {
      voiceIsActive = false;

      // Some browsers end automatically after a pause.
      // If the user still wants dictation on, try restarting.
      if (voiceShouldBeOn) {
        // ✅ Ensure correct language at restart time too
        recognition.lang = getSelectedVoiceLang();

        setTimeout(() => {
          if (!voiceShouldBeOn) return;
          try {
            recognition.start();
          } catch (_) {}
        }, 250);
        return;
      }

      // Otherwise we’re done (manual stop or fatal error)
      inputEl.readOnly = false;
      setVoiceUI(false);
      if (composerHintEl) composerHintEl.textContent = defaultComposerHint;
    };

    voiceBtn.addEventListener("click", () => {
      if (voiceShouldBeOn) stopVoiceTyping(false);
      else startVoiceTyping();
    });

    // If tab is hidden, stop (prevents “stuck listening”)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopVoiceTyping(true);
    });
  }


  setupVoiceTyping();

  // // --- Send to backend (no response expected) ---
  // async function postToBackend(payload) {
  //   // This endpoint exists in app.py but returns 204 without content.
  //   const res = await fetch("/api/messages", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(payload),
  //   });
  //   // Anything 2xx counts as success for our UI.
  //   if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // }

  // --- Send to backend (expecting JSON response) ---
  async function postToBackend(payload) {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // backend now returns JSON: { reply: "Message received: ..." }
    return await res.json();
  }

  function setNetStatus(label, kind = "neutral") {
    netStatus.textContent = label;

    // subtle visual hints using the existing pills
    if (kind === "good") {
      netStatus.style.background = "var(--good)";
      netStatus.style.borderColor = "rgba(105,255,178,.25)";
      netStatus.style.color = "var(--muted)";
    } else if (kind === "bad") {
      netStatus.style.background = "var(--bad)";
      netStatus.style.borderColor = "rgba(255,105,130,.25)";
      netStatus.style.color = "var(--muted)";
    } else {
      netStatus.style.background = "rgba(255,255,255,.06)";
      netStatus.style.borderColor = "var(--stroke)";
      netStatus.style.color = "var(--muted)";
    }
  }

  async function sendMessage() {
    stopVoiceTyping(true);

    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = "";
    autoResize();

    const messageId = crypto.randomUUID?.() || ("m_" + Math.random().toString(16).slice(2));
    const msgEl = addMessage({ role: "user", text, status: "Sending…" });

    // Update sidebar preview (frontend-only)
    const convo = convos.find(c => c.id === activeConvoId);
    if (convo) {
      convo.last = text;
      convo.time = "Now";
      renderConvos(searchInput.value);
    }

    setNetStatus("Sending…");

    const payload = {
      id: messageId,
      conversation_id: activeConvoId,
      role: "user",
      text,
      sent_at: new Date().toISOString(),
    };

    try {
      // await postToBackend(payload);
      const data = await postToBackend(payload);

      // Show backend reply as "other" message
      addMessage({
        role: "Assistant",
        text: data.reply || "Message received",
      });

      const statusEl = msgEl.querySelector("[data-status]");
      if (statusEl) {
        statusEl.textContent = "Sent";
        statusEl.classList.add("status--ok");
      }
      setNetStatus("Sent", "good");
    } catch (err) {
      const statusEl = msgEl.querySelector("[data-status]");
      if (statusEl) {
        statusEl.textContent = "Failed";
        statusEl.classList.add("status--bad");
      }
      setNetStatus("Offline / Failed", "bad");
      toast("Failed to POST to backend");
      // Keep going; user can retry later (you can add retry UI easily).
      console.error(err);
    } finally {
      // return to idle after a moment
      setTimeout(() => setNetStatus("Ready"), 1200);
    }
  }

  // Enter to send, Shift+Enter newline
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  // Autosize textarea
  function autoResize() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 160) + "px";
  }
  inputEl.addEventListener("input", autoResize);

  // Attach button is UI-only for now
  document.getElementById("attachBtn").addEventListener("click", () => {
    toast("Attach is UI-only (frontend).");
  });

  // Initial UI
  renderConvos();
  addSystemMessage("Welcome! This UI posts messages to the backend. No replies are implemented yet.");
  setNetStatus("Ready");
})();
