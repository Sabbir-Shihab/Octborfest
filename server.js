import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { craftOfrenda } from "./src/ofrenda.js";
import { DEFAULT_MODEL } from "./src/cerebras.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json({ limit: "48kb" }));
app.use(express.static(path.join(__dirname, "public")));

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
    worksWithoutKey: true,
  });
});

app.post("/api/ofrenda", async (req, res) => {
  try {
    const apiKey = resolveApiKey(req);
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
    res.status(500).json({
      error: err?.message || "The candles flickered out.",
    });
  }
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Ofrenda glowing at ${APP_URL}`));
}
