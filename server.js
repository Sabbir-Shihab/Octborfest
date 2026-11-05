import express from "express";
import { craftOfrenda } from "./src/ofrenda.js";
import { DEFAULT_MODEL } from "./src/cerebras.js";

const app = express();
app.use(express.json({ limit: "48kb" }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3001;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

const KINDS = new Set(["person", "language", "project", "craft", "place"]);

function resolveApiKey(req) {
  const fromHeader = String(req.get("x-cerebras-api-key") || "").trim();
  const fromBody = String(req.body?.apiKey || "").trim();
  const fromEnv = String(process.env.CEREBRAS_API_KEY || "").trim();
  return fromHeader || fromBody || fromEnv;
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    serverKey: Boolean(String(process.env.CEREBRAS_API_KEY || "").trim()),
    model: DEFAULT_MODEL,
    acceptsClientKey: true,
  });
});

app.post("/api/ofrenda", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
    if (!apiKey) {
      return res.status(400).json({
        error:
          "Paste your Cerebras API key in the form (or upload a key file). Get one free at cloud.cerebras.ai",
      });
    }

    const name = String(req.body?.name || "").trim().slice(0, 80);
    const kind = String(req.body?.kind || "person").trim().toLowerCase();
    const years = String(req.body?.years || "").trim().slice(0, 40);
    const memory = String(req.body?.memory || "").trim().slice(0, 1200);
    const model = String(req.body?.model || DEFAULT_MODEL).trim().slice(0, 80);

    if (!name || name.length < 2) {
      return res.status(400).json({ error: "Give the ofrenda a name." });
    }
    if (!memory || memory.length < 12) {
      return res.status(400).json({ error: "Share a little more of the memory." });
    }
    if (!KINDS.has(kind)) {
      return res.status(400).json({ error: "Unknown ofrenda kind." });
    }

    const ofrenda = await craftOfrenda({ name, kind, years, memory, apiKey, model });
    res.json({ ofrenda });
  } catch (err) {
    console.error(err?.message || err);
    const msg = String(err?.message || "The candles flickered out.");
    const status = /api key|401|auth|unauthorized/i.test(msg) ? 401 : 500;
    res.status(status).json({
      error: status === 401 ? "Cerebras rejected that API key. Check and try again." : msg,
    });
  }
});

app.listen(PORT, () => console.log(`Ofrenda glowing at ${APP_URL}`));
