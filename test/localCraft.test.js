import test from "node:test";
import assert from "node:assert/strict";
import { craftLocalOfrenda } from "../src/localCraft.js";

test("local craft returns a full ofrenda without an API key", () => {
  const out = craftLocalOfrenda({
    name: "Abuela Rosa",
    kind: "person",
    years: "1942–2018",
    memory: "She taught me to save seeds in old biscuit tins.",
  });

  assert.ok(out.title.includes("Abuela Rosa"));
  assert.ok(out.remembrance.includes("biscuit"));
  assert.equal(out.offerings.length, 4);
  assert.ok(out.whisper.length > 10);
  assert.equal(out.candle, "marigold");
  assert.equal(out.model, "local-altar");
  assert.equal(out.mode, "local");
});

test("kind changes candle color", () => {
  const lang = craftLocalOfrenda({
    name: "BASIC",
    kind: "language",
    years: "1980s",
    memory: "PRINT HELLO was the first magic I typed.",
  });
  assert.equal(lang.candle, "teal");
  assert.match(lang.title, /BASIC/);
});
