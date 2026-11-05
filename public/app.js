const STORAGE_KEY = "ofrenda.altar.v1";
const API_KEY_STORAGE = "ofrenda.cerebrasKey.v1";

const form = document.getElementById("ofrenda-form");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("submit-btn");
const resultEl = document.getElementById("result");
const saveBtn = document.getElementById("save-btn");
const altarWall = document.getElementById("altar-wall");
const petalsRoot = document.getElementById("petals");
const apiKeyInput = document.getElementById("api-key");
const toggleKeyBtn = document.getElementById("toggle-key");
const clearKeyBtn = document.getElementById("clear-key");
const rememberKey = document.getElementById("remember-key");
const keyFileInput = document.getElementById("key-file");
const keyStatus = document.getElementById("key-status");

let latest = null;

function spawnPetals() {
  if (!petalsRoot || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const count = window.innerWidth < 700 ? 8 : 14;
  for (let i = 0; i < count; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--drift", `${(Math.random() * 120 - 40).toFixed(0)}px`);
    petal.style.animationDuration = `${14 + Math.random() * 16}s`;
    petal.style.animationDelay = `${-Math.random() * 18}s`;
    petal.style.width = `${9 + Math.random() * 8}px`;
    petal.style.height = `${7 + Math.random() * 6}px`;
    petalsRoot.appendChild(petal);
  }
}

function setKeyStatus(message, kind = "") {
  keyStatus.textContent = message;
  keyStatus.classList.toggle("ok", kind === "ok");
  keyStatus.classList.toggle("error", kind === "error");
}

function maskKey(key) {
  if (!key || key.length < 8) return "saved";
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

function parseKeyFromText(raw) {
  const text = String(raw || "").replace(/^\uFEFF/, "").trim();
  if (!text) return "";

  const envMatch = text.match(/^\s*CEREBRAS_API_KEY\s*=\s*["']?([^\s"'#]+)["']?/im);
  if (envMatch?.[1]) return envMatch[1].trim();

  const csk = text.match(/csk-[A-Za-z0-9_-]+/);
  if (csk?.[0]) return csk[0];

  const firstLine = text.split(/\r?\n/).map((l) => l.trim()).find(Boolean);
  return firstLine || "";
}

function loadSavedKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

function persistKey(key) {
  try {
    if (rememberKey.checked && key) {
      localStorage.setItem(API_KEY_STORAGE, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

function getApiKey() {
  return String(apiKeyInput.value || "").trim();
}

function applyKey(key, source = "pasted") {
  const cleaned = parseKeyFromText(key) || String(key || "").trim();
  if (!cleaned) {
    setKeyStatus("No API key found in that file.", "error");
    return false;
  }
  apiKeyInput.value = cleaned;
  persistKey(cleaned);
  setKeyStatus(`Key ready (${source}): ${maskKey(cleaned)}`, "ok");
  return true;
}

function loadAltar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveAltar(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 24)));
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

function setResultCandle(color) {
  const wax = document.getElementById("result-wax");
  if (!wax) return;
  wax.className = `wax display lit ${color || "marigold"}`;
}

function renderResult(ofrenda, input) {
  latest = { ...ofrenda, input, savedAt: Date.now() };
  resultEl.hidden = false;
  document.getElementById("result-title").textContent = ofrenda.title;
  document.getElementById("result-body").textContent = ofrenda.remembrance;

  const offerings = document.getElementById("result-offerings");
  offerings.replaceChildren();
  for (const item of ofrenda.offerings || []) {
    const li = document.createElement("li");
    li.textContent = item;
    offerings.appendChild(li);
  }

  document.getElementById("result-whisper").textContent = ofrenda.whisper
    ? `“${ofrenda.whisper}”`
    : "";
  const source = ofrenda.source || (ofrenda.model === "local-altar" ? "local" : "cerebras");
  const engine =
    source === "cerebras"
      ? `${ofrenda.model} · ${ofrenda.latencyMs} ms on Cerebras`
      : source === "local-fallback"
        ? `local altar (Cerebras fallback) · ${ofrenda.latencyMs} ms`
        : `local altar · ${ofrenda.latencyMs} ms`;
  document.getElementById("result-meta").textContent = engine;

  setResultCandle(ofrenda.candle);
  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderAltar() {
  const list = loadAltar();
  altarWall.replaceChildren();

  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "altar-empty";
    empty.textContent = "No candles yet. Dedicate one above — it stays only on this device.";
    altarWall.appendChild(empty);
    return;
  }

  list.forEach((item, index) => {
    const tile = document.createElement("article");
    tile.className = "altar-tile";
    tile.style.animationDelay = `${index * 0.05}s`;

    const mini = document.createElement("div");
    mini.className = "mini-candle";
    const wax = document.createElement("div");
    wax.className = "mini-wax";
    if (item.candle === "crimson") {
      wax.style.background = "linear-gradient(90deg, #8b1018, #e63946)";
    } else if (item.candle === "teal") {
      wax.style.background = "linear-gradient(90deg, #1d6f66, #40b4a6)";
    } else if (item.candle === "ivory") {
      wax.style.background = "linear-gradient(90deg, #e8dcc4, #fffaf0)";
    }
    mini.appendChild(wax);

    const title = document.createElement("h3");
    title.textContent = item.title || item.input?.name || "Ofrenda";

    const body = document.createElement("p");
    body.textContent = item.remembrance || "";

    const kind = document.createElement("span");
    kind.className = "kind";
    kind.textContent = item.input?.kind || "memory";

    tile.append(mini, title, body, kind);
    altarWall.appendChild(tile);
  });
}

toggleKeyBtn.addEventListener("click", () => {
  const show = apiKeyInput.type === "password";
  apiKeyInput.type = show ? "text" : "password";
  toggleKeyBtn.textContent = show ? "Hide" : "Show";
  toggleKeyBtn.setAttribute("aria-pressed", show ? "true" : "false");
});

clearKeyBtn.addEventListener("click", () => {
  apiKeyInput.value = "";
  try {
    localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    /* ignore */
  }
  setKeyStatus("Saved key cleared.");
});

apiKeyInput.addEventListener("change", () => {
  const key = getApiKey();
  if (key) applyKey(key, "pasted");
});

rememberKey.addEventListener("change", () => {
  const key = getApiKey();
  if (rememberKey.checked) {
    persistKey(key);
    if (key) setKeyStatus(`Will remember: ${maskKey(key)}`, "ok");
  } else {
    try {
      localStorage.removeItem(API_KEY_STORAGE);
    } catch {
      /* ignore */
    }
    setKeyStatus("Remember off — key stays only until you close the tab.");
  }
});

keyFileInput.addEventListener("change", async () => {
  const file = keyFileInput.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    applyKey(text, file.name);
  } catch {
    setKeyStatus("Could not read that file.", "error");
  } finally {
    keyFileInput.value = "";
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const apiKey = getApiKey();
  if (apiKey) persistKey(apiKey);

  const data = new FormData(form);
  const payload = {
    name: String(data.get("name") || "").trim(),
    kind: String(data.get("kind") || "person"),
    years: String(data.get("years") || "").trim(),
    memory: String(data.get("memory") || "").trim(),
  };

  submitBtn.disabled = true;
  setStatus(
    apiKey ? "The veil thins… Qwen is writing." : "The veil thins… local altar is writing."
  );
  resultEl.hidden = true;

  try {
    const headers = { "Content-Type": "application/json" };
    if (apiKey) headers["X-Cerebras-Api-Key"] = apiKey;

    const res = await fetch("/api/ofrenda", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Request failed");
    renderResult(json.ofrenda, payload);
    setStatus("Candle lit.");
  } catch (err) {
    setStatus(err.message || "Something went wrong.", true);
  } finally {
    submitBtn.disabled = false;
  }
});

saveBtn.addEventListener("click", () => {
  if (!latest) return;
  const list = loadAltar();
  list.unshift(latest);
  saveAltar(list);
  renderAltar();
  setStatus("Kept on the altar wall.");
  document.getElementById("altar").scrollIntoView({ behavior: "smooth" });
});

const saved = loadSavedKey();
if (saved) {
  apiKeyInput.value = saved;
  setKeyStatus(`Loaded saved key: ${maskKey(saved)}`, "ok");
} else {
  setKeyStatus("Works without a key — local altar is ready.", "ok");
}

spawnPetals();
renderAltar();
