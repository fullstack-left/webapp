// AvtoSmart — Imtihon dvigateli
import { QUESTIONS } from "../data/questions.js";

export const EXAM_CONFIG = {
  count: 20,           // savollar soni
  durationSec: 25 * 60, // 25 daqiqa
  passThreshold: 18,   // o'tish uchun to'g'ri javoblar
};

// Fisher–Yates aralashtirish
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Imtihon uchun tasodifiy savollar to'plami.
// Baza kichik bo'lsa, mavjudlarni takrorlab kerakli songa yetkazadi (namuna uchun).
export function buildExamSet() {
  const pool = shuffle(QUESTIONS);
  const set = [];
  let i = 0;
  while (set.length < EXAM_CONFIG.count && pool.length) {
    set.push(pool[i % pool.length]);
    i++;
    if (i > EXAM_CONFIG.count * 3) break; // xavfsizlik
  }
  return set.slice(0, Math.min(EXAM_CONFIG.count, set.length));
}

// Mavzu bo'yicha savollar
export function questionsByTopic(topicId) {
  return QUESTIONS.filter((q) => q.topicId === topicId);
}

// id bo'yicha savol
export function questionById(id) {
  return QUESTIONS.find((q) => q.id === id);
}

// Yechilmagan xatolar bo'yicha savollar
export function questionsByIds(ids) {
  return ids.map(questionById).filter(Boolean);
}

// Yangi imtihon holati
export function newExamState(questions) {
  return {
    questions,
    index: 0,
    answers: new Array(questions.length).fill(null), // tanlangan indeks
    correctCount: 0,
    finished: false,
  };
}

export function isPass(correctCount) {
  return correctCount >= EXAM_CONFIG.passThreshold;
}
