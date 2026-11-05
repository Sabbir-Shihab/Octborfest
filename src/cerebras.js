import Cerebras from "@cerebras/cerebras_cloud_sdk";

export const DEFAULT_MODEL = process.env.CEREBRAS_MODEL || "qwen-3.8-27b";

export function createCerebrasClient(apiKey) {
  const key = String(apiKey || "").trim();
  if (!key) {
    throw new Error("Cerebras API key is missing.");
  }
  return new Cerebras({ apiKey: key });
}

export function stripThink(text = "") {
  return String(text)
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?think>/gi, "")
    .trim();
}

export function parseJsonObject(text) {
  const cleaned = stripThink(text);
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}
