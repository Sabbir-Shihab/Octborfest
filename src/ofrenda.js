import {
  createCerebrasClient,
  DEFAULT_MODEL,
  parseJsonObject,
  stripThink,
} from "./cerebras.js";
import { craftLocalOfrenda } from "./localCraft.js";

const SYSTEM = `You are the quiet keeper of a digital ofrenda — an altar for Día de los Muertos and for "Ghost in the Machine" remembrances.
You help people honor someone they miss, a forgotten craft, an abandoned project, or a dead programming language.

Tone: warm, reverent, never sarcastic, never creepy-horror. Think candlelight and marigold petals, not jump scares.
Keep language concrete and personal. No corporate speak. No emojis in JSON string values unless the user used them.

Reply with ONLY a JSON object (no markdown fences) shaped like:
{
  "title": "short ofrenda title, max 8 words",
  "remembrance": "2-4 short paragraphs of remembrance, second person or soft third person, under 180 words",
  "offerings": ["3 to 5 symbolic offerings that fit the dedication"],
  "whisper": "one quiet sentence as if the honored spirit left a note",
  "candle": "one word color hint: marigold | ivory | crimson | teal | violet"
}

If the dedication is thin, invent gently from what is given — never invent a false death date or claim facts the user did not share.
/no_think`;

async function craftWithCerebras({ name, kind, years, memory, apiKey, model }) {
  const cerebras = createCerebrasClient(apiKey);
  const modelId = String(model || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
  const started = Date.now();
  const userBlock = [
    `Name / subject: ${name}`,
    `Kind: ${kind}`,
    years ? `Years / era: ${years}` : null,
    `Memory the visitor brought:\n${memory}`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await cerebras.chat.completions.create({
    model: modelId,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: userBlock },
    ],
    temperature: 0.7,
  });

  const latencyMs = Date.now() - started;
  const raw = res.choices?.[0]?.message?.content || "";
  const data = parseJsonObject(raw);

  return {
    title: String(data.title || `Ofrenda for ${name}`).slice(0, 80),
    remembrance: stripThink(String(data.remembrance || "")).slice(0, 1200),
    offerings: Array.isArray(data.offerings)
      ? data.offerings.map((o) => String(o).slice(0, 80)).filter(Boolean).slice(0, 5)
      : [],
    whisper: stripThink(String(data.whisper || "")).slice(0, 240),
    candle: ["marigold", "ivory", "crimson", "teal", "violet"].includes(
      String(data.candle || "").toLowerCase()
    )
      ? String(data.candle).toLowerCase()
      : "marigold",
    latencyMs,
    model: modelId,
    mode: "cerebras",
  };
}

/**
 * Prefer Cerebras when a key is present; otherwise craft locally so the app always works.
 * If Cerebras fails (bad key / network), fall back to local instead of breaking the altar.
 */
export async function craftOfrenda(input) {
  const apiKey = String(input.apiKey || "").trim();
  if (!apiKey) {
    return craftLocalOfrenda(input);
  }

  try {
    return await craftWithCerebras(input);
  } catch (err) {
    console.error("Cerebras failed, using local altar:", err?.message || err);
    const local = craftLocalOfrenda(input);
    return {
      ...local,
      mode: "local-fallback",
      note: "Cerebras unavailable — crafted on the local altar instead.",
    };
  }
}
