/**
 * Offline ofrenda craft — no API key required.
 * Builds a warm remembrance from the visitor's words + kind-specific altar logic.
 */

const KIND_META = {
  person: {
    label: "soul",
    offerings: [
      "a bowl of favorite food",
      "marigold petals",
      "a photograph turned toward the light",
      "a glass of water",
      "a candle that knows their name",
    ],
    whisper: (name) =>
      `${name} would want you to keep the ordinary days — they were never ordinary to them.`,
    candle: "marigold",
  },
  language: {
    label: "language",
    offerings: [
      "a printout of Hello, World",
      "an old manual with coffee stains",
      "a blinking cursor",
      "a stack of punched-card memories",
      "silence where the compiler used to sing",
    ],
    whisper: (name) =>
      `${name} is not gone — every runtime still carries a ghost of its grammar.`,
    candle: "teal",
  },
  project: {
    label: "project",
    offerings: [
      "the last unmerged branch",
      "a sticky note that said ‘almost’",
      "the README you meant to finish",
      "a screenshot from better days",
      "one clean commit message",
    ],
    whisper: (name) =>
      `${name} still waits in a folder somewhere. Open it gently.`,
    candle: "crimson",
  },
  craft: {
    label: "craft",
    offerings: [
      "worn tools laid in a row",
      "thread / wire / clay — whatever your hands knew",
      "a scrap of unfinished work",
      "the smell of the workshop",
      "patience folded like cloth",
    ],
    whisper: (name) =>
      `The hands that practiced ${name} taught more than the finished piece ever could.`,
    candle: "ivory",
  },
  place: {
    label: "place",
    offerings: [
      "dust from the doorway",
      "a sound you still hear there",
      "a map with one street circled",
      "rain on that particular roof",
      "a key that no longer fits",
    ],
    whisper: (name) =>
      `${name} keeps a chair for you, even when the room has changed.`,
    candle: "violet",
  },
};

function pick(list, seed) {
  return list[Math.abs(seed) % list.length];
}

function hashSeed(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return h;
}

function softSentence(memory) {
  const cleaned = String(memory || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!cleaned) return "a memory that still warms the room";
  const clipped = cleaned.length > 220 ? `${cleaned.slice(0, 217).trim()}…` : cleaned;
  return clipped.endsWith(".") ? clipped.slice(0, -1) : clipped;
}

function titleFor(name, kind, seed) {
  const titles = {
    person: [`Candle for ${name}`, `Ofrenda for ${name}`, `In memory of ${name}`],
    language: [`Ghost of ${name}`, `Altar for ${name}`, `${name}, still speaking`],
    project: [`Archive of ${name}`, `Unfinished: ${name}`, `Candle for ${name}`],
    craft: [`Hands that knew ${name}`, `Ofrenda for ${name}`, `Craft of ${name}`],
    place: [`Return to ${name}`, `Threshold of ${name}`, `Candle for ${name}`],
  };
  return pick(titles[kind] || titles.person, seed);
}

export function craftLocalOfrenda({ name, kind = "person", years = "", memory = "" }) {
  const started = Date.now();
  const safeKind = KIND_META[kind] ? kind : "person";
  const meta = KIND_META[safeKind];
  const seed = hashSeed(`${name}|${safeKind}|${memory}`);
  const detail = softSentence(memory);
  const era = years ? ` Across ${years},` : "";

  const openings = [
    `Tonight the altar holds space for ${name}.`,
    `A candle is lit for ${name}, and the room grows quieter.`,
    `This ofrenda is for ${name} — a ${meta.label} that memory refuses to release.`,
  ];

  const middles = [
    `${era} you still carry this: ${detail}.`,
    `${era} what remains is simple and true: ${detail}.`,
    `${era} the story you brought was enough: ${detail}.`,
  ];

  const closings = [
    `Nothing here asks you to forget. It only asks you to look once more, with kindness.`,
    `Let the marigold keep watch. What mattered then still matters in the light.`,
    `The veil thins not to frighten you — only to let love borrow a little more time.`,
  ];

  const remembrance = [
    pick(openings, seed),
    pick(middles, seed + 3),
    pick(closings, seed + 7),
  ].join("\n\n");

  const offeringPool = meta.offerings;
  const offerings = [
    pick(offeringPool, seed),
    pick(offeringPool, seed + 1),
    pick(offeringPool, seed + 2),
    pick(offeringPool, seed + 4),
  ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4);

  return {
    title: titleFor(name, safeKind, seed).slice(0, 80),
    remembrance: remembrance.slice(0, 1200),
    offerings,
    whisper: meta.whisper(name).slice(0, 240),
    candle: meta.candle,
    latencyMs: Math.max(1, Date.now() - started),
    model: "local-altar",
    source: "local",
  };
}
