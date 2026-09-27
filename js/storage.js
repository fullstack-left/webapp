// AvtoSmart — localStorage bilan ishlash qatlami
const KEY = "avtosmart:v1";

const DEFAULT_STATE = {
  lang: "uz",
  theme: "dark",           // "dark" | "light"
  exams: [],               // [{ date, correct, total, passed }]
  mistakes: [],            // yechilmagan savol id lari (unique)
};

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function write(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export const store = {
  get all() { return read(); },

  get lang() { return read().lang; },
  setLang(lang) { const s = read(); s.lang = lang; write(s); },

  get theme() { return read().theme; },
  setTheme(theme) { const s = read(); s.theme = theme; write(s); },

  // Imtihon natijasini saqlash
  saveExam(correct, total, passed) {
    const s = read();
    s.exams.push({ date: new Date().toISOString(), correct, total, passed });
    write(s);
  },

  get exams() { return read().exams; },

  // Xatoni qo'shish (takrorlanmasin)
  addMistake(id) {
    const s = read();
    if (!s.mistakes.includes(id)) { s.mistakes.push(id); write(s); }
  },

  // To'g'ri javob berilganda xatoni olib tashlash
  resolveMistake(id) {
    const s = read();
    s.mistakes = s.mistakes.filter((m) => m !== id);
    write(s);
  },

  get mistakes() { return read().mistakes; },

  reset() { write({ ...DEFAULT_STATE, lang: read().lang, theme: read().theme }); },
};

// Statistika hisoblash
export function computeStats() {
  const s = read();
  const total = s.exams.length;
  const passedCount = s.exams.filter((e) => e.passed).length;
  const best = s.exams.reduce((m, e) => Math.max(m, e.correct), 0);
  const passRate = total ? Math.round((passedCount / total) * 100) : 0;
  return { total, passRate, best, mistakesLeft: s.mistakes.length };
}
