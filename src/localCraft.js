/** Offline / no-API remembrance craft — keeps Ofrenda usable without Cerebras. */

const KIND_META = {
  person: {
    title: (name) => `Candle for ${name}`,
    offerings: ["fresh marigolds", "a favorite meal", "a photograph", "warm tea", "a handwritten note"],
    candle: "marigold",
    whisper: (name) => `I am still here in the stories you tell about ${name}.`,
    open: (name, years) =>
      years
        ? `Tonight the altar holds space for ${name} (${years}).`
        : `Tonight the altar holds space for ${name}.`,
  },
  language: {
    title: (name) => `Ghost of ${name}`,
    offerings: ["a punched card", "a dusty manual", "an old terminal blink", "sample code on paper", "patience"],
    candle: "teal",
    whisper: (name) => `${name} never left — it just learned to whisper in fewer rooms.`,
    open: (name, years) =>
      years
        ? `We light a candle for ${name}, a language from ${years}.`
        : `We light a candle for ${name}, a language the machine still remembers.`,
  },
  project: {
    title: (name) => `Requiem for ${name}`,
    offerings: ["a sticky-note roadmap", "the last commit message", "a half-finished README", "coffee rings on a desk", "hope for a reboot"],
    candle: "crimson",
    whisper: (name) => `${name} is not gone — it is waiting in a branch you have not opened yet.`,
    open: (name, years) =>
      years
        ? `This candle is for ${name}, begun around ${years} and never fully buried.`
        : `This candle is for ${name}, the project that taught you something before it slept.`,
  },
  craft: {
    title: (name) => `Keeping ${name}`,
    offerings: ["worn tools", "muscle memory", "a quiet workshop hour", "apprentice stories", "calloused hands"],
    candle: "ivory",
    whisper: (name) => `As long as someone still practices ${name}, the craft breathes.`,
    open: (name, years) =>
      years
        ? `We honor ${name}, a craft carried through ${years}.`
        : `We honor ${name}, a craft too tender to let vanish.`,
  },
  place: {
    title: (name) => `Map back to ${name}`,
    offerings: ["dust from the road", "a window view", "rain on tin roofs", "a shared joke", "the long way home"],
    candle: "violet",
    whisper: (name) => `${name} still knows your footsteps.`,
    open: (name, years) =>
      years
        ? `The altar turns toward ${name}, remembered from ${years}.`
        : `The altar turns toward ${name}, a place that still holds you.`,
  },
};

function pickOfferings(list, seed) {
  const copy = [...list];
  const out = [];
  let n = seed;
  while (out.length < 4 && copy.length) {
    n = (n * 31 + 17) % copy.length;
    out.push(copy.splice(n, 1)[0]);
  }
  return out;
}

function softParagraph(memory) {
  const cleaned = String(memory || "").replace(/\s+/g, " ").trim();
  if (cleaned.length <= 220) return cleaned;
  const cut = cleaned.slice(0, 220);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  if (lastStop > 80) return cleaned.slice(0, lastStop + 1).trim();
  return `${cut.trim()}…`;
}

function hashSeed(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 33 + text.charCodeAt(i)) >>> 0;
  return h;
}

export function craftLocalOfrenda({ name, kind, years, memory }) {
  const started = Date.now();
  const meta = KIND_META[kind] || KIND_META.person;
  const memoryLine = softParagraph(memory);
  const seed = hashSeed(`${name}|${kind}|${memory}`);

  const remembrance = [
    meta.open(name, years),
    "",
    `You brought this memory to the altar: ${memoryLine}`,
    "",
    "We do not invent what you did not share. We only hold it gently — marigold light, a quiet table, room enough for what remains.",
  ].join("\n");

  return {
    title: meta.title(name).slice(0, 80),
    remembrance: remembrance.slice(0, 1200),
    offerings: pickOfferings(meta.offerings, seed),
    whisper: meta.whisper(name).slice(0, 240),
    candle: meta.candle,
    latencyMs: Math.max(12, Date.now() - started),
    model: "local-altar",
    mode: "local",
  };
}
