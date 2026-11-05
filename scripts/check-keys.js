import Cerebras from "@cerebras/cerebras_cloud_sdk";

const key = process.env.CEREBRAS_API_KEY;
const model = process.env.CEREBRAS_MODEL || "qwen-3.8-27b";

console.log("Checking Cerebras...\n");

if (!key) {
  console.log("  [SKIP] No server .env key — that's fine; paste/upload the key in the UI instead.");
  process.exit(0);
}

try {
  const client = new Cerebras({ apiKey: key });
  const started = Date.now();
  const res = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: 'Reply with exactly {"ok":true} /no_think' }],
    temperature: 0,
  });
  const ms = Date.now() - started;
  const text = res.choices?.[0]?.message?.content || "";
  console.log(`  [OK] Qwen (${model}) answered in ${ms} ms`);
  console.log(`       sample: ${text.slice(0, 80).replace(/\n/g, " ")}`);
} catch (err) {
  console.log(`  [FAIL] ${err.message}`);
  process.exit(1);
}
