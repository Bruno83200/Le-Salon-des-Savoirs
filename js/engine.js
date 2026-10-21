export const CATEGORIES = [
  {
    id: "geography",
    name: "Géographie",
    short: "Géographie",
    color: "#368ee8",
    symbol: "◎",
  },
  {
    id: "entertainment",
    name: "Divertissement",
    short: "Divertissement",
    color: "#ed6caa",
    symbol: "♫",
  },
  {
    id: "history",
    name: "Histoire",
    short: "Histoire",
    color: "#e5b642",
    symbol: "⌛",
  },
  {
    id: "arts",
    name: "Art et Littérature",
    short: "Arts & lettres",
    color: "#a77bea",
    symbol: "✒",
  },
  {
    id: "science",
    name: "Sciences et Nature",
    short: "Sciences & nature",
    color: "#40b78b",
    symbol: "✿",
  },
  {
    id: "sports",
    name: "Sports et Loisirs",
    short: "Sports & loisirs",
    color: "#f29a4a",
    symbol: "⚑",
  },
];
export const KEY = "salon-savoirs-v1";
export const cellCategory = (i) => (i + Math.floor(i / 6)) % 6;
export const destinations = (pos, die) => [
  ...new Set([(pos + die) % 36, (pos - die + 36) % 36]),
];
export function shuffle(a) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
export function freshGame(names, mode, duration, difficulty = "all") {
  return {
    version: 1,
    difficulty,
    corpus: "salon-624-v04",
    mode,
    duration,
    players: names.map((name, i) => ({
      name,
      pos: i * 6,
      medals: [],
      correct: 0,
      total: 0,
    })),
    current: 0,
    phase: "roll",
    die: 0,
    used: [],
    active: null,
    turn: 1,
    trainingCategory: "all",
  };
}
export function validSave(s) {
  return (
    s &&
    s.version === 1 &&
    (s.difficulty === undefined ||
      ["all", "facile", "moyen", "difficile"].includes(s.difficulty)) &&
    ["board", "training"].includes(s.mode) &&
    Array.isArray(s.players) &&
    s.players.length >= 1 &&
    s.players.length <= 6 &&
    s.players.every(
      (p) =>
        typeof p.name === "string" &&
        Number.isInteger(p.pos) &&
        p.pos >= 0 &&
        p.pos < 36 &&
        Array.isArray(p.medals) &&
        p.medals.every((m) => Number.isInteger(m) && m >= 0 && m < 6) &&
        Number.isFinite(p.total) &&
        Number.isFinite(p.correct),
    ) &&
    Number.isInteger(s.current) &&
    s.current >= 0 &&
    s.current < s.players.length &&
    ["roll", "move", "question", "feedback", "won"].includes(s.phase) &&
    Array.isArray(s.used) &&
    s.used.every((x) => typeof x === "string") &&
    Number.isInteger(s.die) &&
    s.die >= 0 &&
    s.die <= 6 &&
    [0, 20, 40].includes(s.duration) &&
    Number.isInteger(s.turn) &&
    (!["question", "feedback"].includes(s.phase) ||
      (s.active &&
        typeof s.active.id === "string" &&
        Array.isArray(s.active.choices) &&
        Number.isFinite(s.active.deadline) &&
        Number.isInteger(s.active.cat) &&
        s.active.cat >= 0 &&
        s.active.cat < 6))
  );
}
