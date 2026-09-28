// AvtoSmart — validated v2 learning repository with v1 migration and session resume.
import { CATALOG_META, getQuestion, getQuestionIdsByTopic, getTopics } from "./catalog.js";

const KEY = "avtosmart:v2";
const LEGACY_KEY = "avtosmart:v1";
const MAX_ATTEMPTS = 100;
const MAX_RECENT_RESULTS = 8;
let initialLoadError = null;
let initialRecovery = null;

function defaultState() {
  return {
    version: 2,
    revision: 0,
    settings: {
      lang: "uz",
      theme: "dark",
      dailyGoal: 10,
      sound: true,
    },
    activeSession: null,
    attempts: [],
    questionStats: {},
    activity: {},
    mistakes: [],
    bookmarks: [],
    migration: null,
    recovery: null,
  };
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clone(value) {
  return globalThis.structuredClone
    ? globalThis.structuredClone(value)
    : JSON.parse(JSON.stringify(value));
}

function storageAvailable() {
  try {
    const storage = globalThis.localStorage;
    if (!storage) return false;
    const probe = "__avtosmart_storage_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function sanitizeQuestionIds(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((value) => typeof value === "string" && getQuestion(value)))];
}

function uniqueStringIds(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((value) => typeof value === "string" && value.length > 0))];
}

function finiteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : fallback;
}

function safeTimestamp(value, fallback = null) {
  const timestamp = Number(value);
  const min = Date.UTC(2000, 0, 1);
  const max = Date.UTC(2100, 0, 1);
  return Number.isFinite(timestamp) && timestamp >= min && timestamp <= max
    ? timestamp
    : fallback;
}

function sanitizeActiveSession(value) {
  if (!isObject(value) || value.schemaVersion !== 2 || value.status !== "active") return null;
  if (!["exam", "practice"].includes(value.mode) || typeof value.catalogVersion !== "string") return null;
  if (typeof value.id !== "string" || !value.id) return null;

  const questionOrder = uniqueStringIds(value.questionOrder);
  if (!questionOrder.length || questionOrder.length !== value.questionOrder?.length) return null;
  if (value.mode === "exam" && questionOrder.length !== 20) return null;
  if (!isObject(value.choiceOrders) || !isObject(value.answersByQuestion)) return null;

  const questionSnapshots = {};
  const choiceOrders = {};
  for (const questionId of questionOrder) {
    const storedSnapshot = sanitizeQuestionSnapshot(value.questionSnapshots?.[questionId]);
    const currentQuestion = value.catalogVersion === CATALOG_META.version ? getQuestion(questionId) : null;
    const question = storedSnapshot ?? currentQuestion;
    if (!question) return null;
    questionSnapshots[questionId] = storedSnapshot ?? sanitizeQuestionSnapshot(currentQuestion);
    const order = value.choiceOrders[questionId];
    const expected = new Set(question.choices.map((choice) => choice.id));
    if (!Array.isArray(order) || order.length !== expected.size || new Set(order).size !== expected.size || order.some((id) => !expected.has(id))) return null;
    choiceOrders[questionId] = order.slice();
  }

  const answersByQuestion = {};
  for (const [questionId, answer] of Object.entries(value.answersByQuestion)) {
    const question = questionSnapshots[questionId];
    if (!questionOrder.includes(questionId) || !isObject(answer) || !question?.choices.some((choice) => choice.id === answer.choiceId)) continue;
    answersByQuestion[questionId] = {
      choiceId: answer.choiceId,
      selectedAt: safeTimestamp(answer.selectedAt, Date.now()),
      elapsedMs: finiteNumber(answer.elapsedMs),
    };
  }

  const startedAt = safeTimestamp(value.startedAt);
  const deadlineAt = value.mode === "exam" ? safeTimestamp(value.deadlineAt) : null;
  if (!startedAt || (value.mode === "exam" && (!deadlineAt || deadlineAt <= startedAt))) return null;

  return {
    schemaVersion: 2,
    id: value.id,
    catalogVersion: value.catalogVersion,
    mode: value.mode,
    source: typeof value.source === "string" ? value.source : "unknown",
    topicId: Number.isInteger(Number(value.topicId)) ? Number(value.topicId) : null,
    status: "active",
    questionOrder,
    choiceOrders,
    questionSnapshots,
    currentIndex: Math.min(questionOrder.length - 1, Math.floor(finiteNumber(value.currentIndex))),
    questionEnteredAt: value.questionEnteredAt === null ? null : safeTimestamp(value.questionEnteredAt, Date.now()),
    questionElapsedMs: Object.fromEntries(questionOrder.map((questionId) => [
      questionId,
      finiteNumber(value.questionElapsedMs?.[questionId]),
    ])),
    answersByQuestion,
    flaggedIds: uniqueStringIds(value.flaggedIds).filter((id) => questionOrder.includes(id)),
    startedAt,
    deadlineAt,
    submittedAt: null,
  };
}

function sanitizeQuestionSnapshot(value) {
  if (!isObject(value) || typeof value.id !== "string" || !Array.isArray(value.choices)) return null;
  const localized = (entry) => isObject(entry) && ["uz", "cy", "ru"].every((lang) => typeof entry[lang] === "string")
    ? { uz: entry.uz, cy: entry.cy, ru: entry.ru }
    : null;
  const prompt = localized(value.prompt);
  const explanation = localized(value.explanation);
  const choices = value.choices.map((choice) => isObject(choice) && typeof choice.id === "string" && localized(choice.text)
    ? { id: choice.id, text: localized(choice.text) }
    : null).filter(Boolean);
  const sourceSection = localized(value.source?.section);
  if (!prompt || !explanation || choices.length !== 4 || new Set(choices.map((choice) => choice.id)).size !== 4) return null;
  if (!choices.some((choice) => choice.id === value.correctChoiceId) || !sourceSection || typeof value.source?.url !== "string") return null;
  return {
    id: value.id,
    topicId: Number(value.topicId),
    prompt,
    choices,
    correctChoiceId: value.correctChoiceId,
    explanation,
    source: { section: sourceSection, url: value.source.url },
  };
}

function sanitizeAttemptRow(row) {
  if (!isObject(row) || typeof row.questionId !== "string") return null;
  const snapshot = sanitizeQuestionSnapshot(row.questionSnapshot);
  const question = snapshot ?? getQuestion(row.questionId);
  if (!question || question.id !== row.questionId) return null;
  const validChoice = row.choiceId === null || question.choices.some((choice) => choice.id === row.choiceId);
  if (!validChoice || row.correctChoiceId !== question.correctChoiceId) return null;

  const unanswered = row.choiceId === null;
  const correct = !unanswered && row.choiceId === question.correctChoiceId;
  if (Boolean(row.unanswered) !== unanswered || Boolean(row.correct) !== correct) return null;

  return {
    questionId: row.questionId,
    choiceId: row.choiceId,
    correctChoiceId: question.correctChoiceId,
    correct,
    unanswered,
    flagged: Boolean(row.flagged),
    elapsedMs: row.elapsedMs === null ? null : finiteNumber(row.elapsedMs),
    ...(snapshot ? { questionSnapshot: snapshot } : {}),
  };
}

function sanitizeAttempt(value) {
  if (!isObject(value) || typeof value.id !== "string") return null;
  if (value.legacy) {
    const submittedAt = safeTimestamp(value.submittedAt, Date.now());
    const candidateStartedAt = safeTimestamp(value.startedAt, submittedAt);
    const startedAt = candidateStartedAt <= submittedAt ? candidateStartedAt : submittedAt;
    return {
      id: value.id,
      sessionId: null,
      schemaVersion: 1,
      catalogVersion: "legacy",
      mode: "exam",
      source: "legacy",
      startedAt,
      submittedAt,
      durationMs: null,
      legacy: true,
      correct: finiteNumber(value.correct),
      total: finiteNumber(value.total, 20),
      accuracy: Math.min(100, finiteNumber(value.accuracy)),
      passed: Boolean(value.passed),
      rows: [],
    };
  }
  if (!["exam", "practice"].includes(value.mode) || typeof value.sessionId !== "string") return null;
  if (!Array.isArray(value.rows)) return null;
  const rows = value.rows.map(sanitizeAttemptRow);
  if (!rows.length || rows.some((row) => row === null)) return null;
  const submittedAt = safeTimestamp(value.submittedAt);
  const startedAt = safeTimestamp(value.startedAt);
  if (!submittedAt || !startedAt || submittedAt < startedAt) return null;
  const correct = rows.filter((row) => row.correct).length;
  const total = rows.length;
  return {
    id: value.id,
    sessionId: value.sessionId,
    schemaVersion: 2,
    catalogVersion: typeof value.catalogVersion === "string" ? value.catalogVersion : "unknown",
    mode: value.mode,
    source: typeof value.source === "string" ? value.source : "unknown",
    topicId: Number.isInteger(Number(value.topicId)) ? Number(value.topicId) : null,
    rows,
    correct,
    total,
    accuracy: Math.round((correct / total) * 100),
    startedAt,
    submittedAt,
    durationMs: value.durationMs === null ? null : finiteNumber(value.durationMs),
    passed: value.mode === "exam" ? correct >= 18 : null,
  };
}

function sanitizeQuestionStats(value) {
  const result = {};
  if (!isObject(value)) return result;
  for (const [questionId, stat] of Object.entries(value)) {
    if (!getQuestion(questionId) || !isObject(stat)) continue;
    result[questionId] = {
      attempts: finiteNumber(stat.attempts),
      correct: finiteNumber(stat.correct),
      wrong: finiteNumber(stat.wrong),
      unanswered: finiteNumber(stat.unanswered),
      totalMs: finiteNumber(stat.totalMs),
      lastAt: stat.lastAt === null ? null : safeTimestamp(stat.lastAt),
      recent: Array.isArray(stat.recent) ? stat.recent.filter((item) => item === 0 || item === 1).slice(-MAX_RECENT_RESULTS) : [],
    };
  }
  return result;
}

function sanitizeActivity(value) {
  const result = {};
  if (!isObject(value)) return result;
  for (const [key, item] of Object.entries(value)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key) || !isObject(item)) continue;
    result[key] = {
      questionIds: sanitizeQuestionIds(item.questionIds),
      correct: finiteNumber(item.correct),
      responses: finiteNumber(item.responses),
      sessions: finiteNumber(item.sessions),
    };
  }
  return result;
}

function normalizeState(input, { captureRecovery = false } = {}) {
  const base = defaultState();
  if (!isObject(input)) return base;

  const settings = isObject(input.settings) ? input.settings : {};
  base.revision = Number.isFinite(input.revision) ? Math.max(0, input.revision) : 0;
  base.settings = {
    lang: ["uz", "cy", "ru"].includes(settings.lang) ? settings.lang : "uz",
    theme: ["dark", "light"].includes(settings.theme) ? settings.theme : "dark",
    dailyGoal: [5, 10, 15, 20].includes(Number(settings.dailyGoal)) ? Number(settings.dailyGoal) : 10,
    sound: settings.sound !== false,
  };
  base.activeSession = sanitizeActiveSession(input.activeSession);
  const rawAttempts = Array.isArray(input.attempts) ? input.attempts : [];
  const sanitizedAttempts = rawAttempts.map(sanitizeAttempt).filter(Boolean);
  base.attempts = sanitizedAttempts.slice(-MAX_ATTEMPTS);
  base.questionStats = sanitizeQuestionStats(input.questionStats);
  base.activity = sanitizeActivity(input.activity);
  base.mistakes = sanitizeQuestionIds(input.mistakes);
  base.bookmarks = sanitizeQuestionIds(input.bookmarks);
  base.migration = isObject(input.migration) ? input.migration : null;
  base.recovery = isObject(input.recovery) ? input.recovery : null;

  const droppedSession = isObject(input.activeSession) && !base.activeSession;
  const droppedAttempts = rawAttempts.length - sanitizedAttempts.length;
  if (captureRecovery && (droppedSession || droppedAttempts > 0)) {
    initialLoadError = "Semantically invalid progress data";
    base.recovery = {
      key: KEY,
      raw: JSON.stringify(input),
      error: `${droppedSession ? "Invalid active session. " : ""}${droppedAttempts} invalid attempt(s) quarantined.`,
      detectedAt: new Date().toISOString(),
    };
  }
  return base;
}

function parseStored(key) {
  if (!storageAvailable()) return null;
  let raw = null;
  try {
    raw = globalThis.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    initialLoadError = `Invalid ${key} data`;
    initialRecovery = {
      key,
      raw,
      error: error instanceof Error ? error.message : String(error),
      detectedAt: new Date().toISOString(),
    };
    dispatchRepositoryEvent("avtosmart:storage-error", { message: initialLoadError, error });
    return null;
  }
}

function migrateLegacy(legacy) {
  const next = defaultState();
  const legacyMistakeCount = Array.isArray(legacy?.mistakes) ? legacy.mistakes.length : 0;
  next.settings.lang = ["uz", "cy", "ru"].includes(legacy?.lang) ? legacy.lang : "uz";
  next.settings.theme = ["dark", "light"].includes(legacy?.theme) ? legacy.theme : "dark";
  // Legacy numeric IDs referred to a different catalog. They cannot be safely
  // reinterpreted as q001...qNNN, so they are disclosed and discarded.
  next.mistakes = [];
  next.attempts = (Array.isArray(legacy?.exams) ? legacy.exams : []).slice(-MAX_ATTEMPTS).map((exam, index) => ({
    id: `legacy_${index}_${exam?.date ?? Date.now()}`,
    sessionId: null,
    schemaVersion: 1,
    catalogVersion: "legacy",
    mode: "exam",
    source: "legacy",
    startedAt: Date.parse(exam?.date) || Date.now(),
    submittedAt: Date.parse(exam?.date) || Date.now(),
    durationMs: null,
    correct: Number(exam?.correct) || 0,
    total: Number(exam?.total) || 20,
    accuracy: exam?.total ? Math.round(((Number(exam.correct) || 0) / Number(exam.total)) * 100) : 0,
    passed: Boolean(exam?.passed),
    rows: [],
    legacy: true,
  }));
  next.migration = {
    from: 1,
    at: new Date().toISOString(),
    legacyAttempts: next.attempts.length,
    recoveredMistakes: 0,
    discardedLegacyMistakes: legacyMistakeCount,
    discardedLegacyMistakeIds: Array.isArray(legacy?.mistakes) ? legacy.mistakes.slice() : [],
    noticeShown: false,
  };
  return next;
}

function loadInitialState() {
  const current = parseStored(KEY);
  if (current) return normalizeState(current, { captureRecovery: true });
  const legacy = parseStored(LEGACY_KEY);
  return legacy ? normalizeState(migrateLegacy(legacy), { captureRecovery: true }) : defaultState();
}

let state = loadInitialState();
if (initialRecovery) state.recovery = initialRecovery;
let lastError = initialLoadError;

function dispatchRepositoryEvent(name, detail) {
  if (typeof globalThis.dispatchEvent === "function" && typeof globalThis.CustomEvent === "function") {
    globalThis.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

function writeState(next) {
  if (!storageAvailable()) {
    lastError = "Persistent storage is unavailable";
    dispatchRepositoryEvent("avtosmart:storage-error", { message: lastError });
    return { ok: false, error: lastError, ephemeral: true };
  }
  const normalized = normalizeState(next);
  normalized.revision = state.revision + 1;
  try {
    globalThis.localStorage.setItem(KEY, JSON.stringify(normalized));
    state = normalized;
    lastError = null;
    dispatchRepositoryEvent("avtosmart:state-change", { revision: state.revision });
    return { ok: true, value: clone(state) };
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    dispatchRepositoryEvent("avtosmart:storage-error", { message: lastError, error });
    return { ok: false, error: lastError };
  }
}

function mutate(mutator) {
  const draft = clone(state);
  mutator(draft);
  return writeState(draft);
}

function dateKey(timestamp = Date.now()) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ensureDaily(draft, timestamp) {
  const key = dateKey(timestamp);
  if (!isObject(draft.activity[key])) {
    draft.activity[key] = { questionIds: [], correct: 0, responses: 0, sessions: 0 };
  }
  return draft.activity[key];
}

function ensureQuestionStat(draft, questionId) {
  if (!isObject(draft.questionStats[questionId])) {
    draft.questionStats[questionId] = {
      attempts: 0,
      correct: 0,
      wrong: 0,
      unanswered: 0,
      totalMs: 0,
      lastAt: null,
      recent: [],
    };
  }
  return draft.questionStats[questionId];
}

function applyLearningRow(draft, row, timestamp) {
  if (!getQuestion(row.questionId)) return;
  const stat = ensureQuestionStat(draft, row.questionId);
  stat.attempts += 1;
  stat.correct += row.correct ? 1 : 0;
  stat.wrong += !row.correct && !row.unanswered ? 1 : 0;
  stat.unanswered += row.unanswered ? 1 : 0;
  stat.totalMs += Number(row.elapsedMs) || 0;
  stat.lastAt = timestamp;
  stat.recent = [...(Array.isArray(stat.recent) ? stat.recent : []), row.correct ? 1 : 0]
    .slice(-MAX_RECENT_RESULTS);

  const mistakes = new Set(draft.mistakes);
  row.correct ? mistakes.delete(row.questionId) : mistakes.add(row.questionId);
  draft.mistakes = [...mistakes];

  if (!row.unanswered) {
    const daily = ensureDaily(draft, timestamp);
    if (!daily.questionIds.includes(row.questionId)) daily.questionIds.push(row.questionId);
    daily.responses += 1;
    if (row.correct) daily.correct += 1;
  }
}

function shiftDateKey(key, days) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day + days);
  return dateKey(date.getTime());
}

function calculateStreak(activity) {
  const activeDates = new Set(Object.entries(activity)
    .filter(([, value]) => Number(value?.responses) > 0)
    .map(([key]) => key));
  if (!activeDates.size) return { current: 0, best: 0 };

  const today = dateKey();
  let cursor = activeDates.has(today) ? today : shiftDateKey(today, -1);
  let current = 0;
  while (activeDates.has(cursor)) {
    current += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  const sorted = [...activeDates].sort();
  let best = 1;
  let running = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    running = shiftDateKey(sorted[index - 1], 1) === sorted[index] ? running + 1 : 1;
    best = Math.max(best, running);
  }
  return { current, best };
}

export const repository = {
  snapshot() {
    return clone(state);
  },

  get lastError() {
    return lastError;
  },

  acknowledgeMigrationNotice() {
    if (!state.migration || state.migration.noticeShown) return { ok: true, value: clone(state) };
    return mutate((draft) => { draft.migration.noticeShown = true; });
  },

  updateSettings(patch) {
    return mutate((draft) => {
      draft.settings = { ...draft.settings, ...patch };
    });
  },

  getActiveSession() {
    return state.activeSession ? clone(state.activeSession) : null;
  },

  saveActiveSession(session) {
    return mutate((draft) => { draft.activeSession = clone(session); });
  },

  clearActiveSession(sessionId = null) {
    return mutate((draft) => {
      if (!sessionId || draft.activeSession?.id === sessionId) draft.activeSession = null;
    });
  },

  commitPracticeAnswer({ session, questionId, correct, elapsedMs = 0, timestamp = Date.now() }) {
    return mutate((draft) => {
      draft.activeSession = clone(session);
      applyLearningRow(draft, {
        questionId,
        correct: Boolean(correct),
        unanswered: false,
        elapsedMs,
      }, timestamp);
    });
  },

  finishAttempt(attempt) {
    const existing = state.attempts.find((item) => item.sessionId && item.sessionId === attempt.sessionId);
    if (existing) {
      const result = state.activeSession?.id === attempt.sessionId
        ? mutate((draft) => { draft.activeSession = null; })
        : { ok: true, value: clone(state) };
      return { ...result, duplicate: true, attempt: clone(existing) };
    }
    const result = mutate((draft) => {
      draft.attempts = [...draft.attempts, clone(attempt)].slice(-MAX_ATTEMPTS);
      if (attempt.mode === "exam") {
        for (const row of attempt.rows) applyLearningRow(draft, row, attempt.submittedAt);
      }
      const daily = ensureDaily(draft, attempt.submittedAt);
      daily.sessions += 1;
      if (draft.activeSession?.id === attempt.sessionId) draft.activeSession = null;
    });
    return { ...result, attempt: result.ok ? clone(attempt) : null };
  },

  toggleBookmark(questionId) {
    if (!getQuestion(questionId)) return { ok: false, error: "Unknown question" };
    return mutate((draft) => {
      const set = new Set(draft.bookmarks);
      set.has(questionId) ? set.delete(questionId) : set.add(questionId);
      draft.bookmarks = [...set];
    });
  },

  isBookmarked(questionId) {
    return state.bookmarks.includes(questionId);
  },

  getAttempt(attemptId) {
    const attempt = state.attempts.find((item) => item.id === attemptId);
    return attempt ? clone(attempt) : null;
  },

  getRecentAttempts(limit = 6) {
    return clone(state.attempts.slice(-limit).reverse());
  },

  getMistakeIds() {
    return state.mistakes.slice();
  },

  getBookmarkIds() {
    return state.bookmarks.slice();
  },

  resetLearning() {
    return mutate((draft) => {
      const settings = draft.settings;
      Object.assign(draft, defaultState(), { settings });
    });
  },

  exportData() {
    return JSON.stringify(state, null, 2);
  },
};

export function getTopicMastery(topicId) {
  const ids = getQuestionIdsByTopic(topicId);
  let attempts = 0;
  let correct = 0;
  let covered = 0;
  for (const id of ids) {
    const stat = state.questionStats[id];
    if (!stat?.attempts) continue;
    covered += 1;
    attempts += Number(stat.attempts) || 0;
    correct += Number(stat.correct) || 0;
  }
  return {
    mastery: attempts ? Math.round((correct / attempts) * 100) : 0,
    attempts,
    covered,
    total: ids.length,
  };
}

export function computeDashboard() {
  const examAttempts = state.attempts.filter((attempt) => attempt.mode === "exam" && !attempt.legacy);
  const passed = examAttempts.filter((attempt) => attempt.passed).length;
  const totalQuestionAttempts = Object.values(state.questionStats)
    .reduce((sum, stat) => sum + (Number(stat.attempts) || 0), 0);
  const totalCorrect = Object.values(state.questionStats)
    .reduce((sum, stat) => sum + (Number(stat.correct) || 0), 0);
  const streak = calculateStreak(state.activity);
  const today = state.activity[dateKey()] ?? { questionIds: [], responses: 0, correct: 0 };

  const weakTopics = getTopics().map((topic) => ({ topic, ...getTopicMastery(topic.id) }))
    .filter((item) => item.attempts > 0)
    .sort((a, b) => a.mastery - b.mastery || b.attempts - a.attempts)
    .slice(0, 3);

  return {
    exams: examAttempts.length,
    passRate: examAttempts.length ? Math.round((passed / examAttempts.length) * 100) : 0,
    bestScore: examAttempts.reduce((best, attempt) => Math.max(best, attempt.correct || 0), 0),
    accuracy: totalQuestionAttempts ? Math.round((totalCorrect / totalQuestionAttempts) * 100) : 0,
    answeredToday: today.questionIds?.length ?? 0,
    responsesToday: today.responses ?? 0,
    dailyGoal: state.settings.dailyGoal,
    streak: streak.current,
    bestStreak: streak.best,
    mistakes: state.mistakes.length,
    bookmarks: state.bookmarks.length,
    weakTopics,
  };
}

if (storageAvailable() && !globalThis.localStorage.getItem(KEY)) {
  writeState(state);
}

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("storage", (event) => {
    if (event.key !== KEY || !event.newValue) return;
    try {
      const incoming = normalizeState(JSON.parse(event.newValue), { captureRecovery: true });
      if (incoming.revision > state.revision) {
        state = incoming;
        dispatchRepositoryEvent("avtosmart:state-change", { revision: state.revision, external: true });
      }
    } catch {
      // Ignore malformed cross-tab events; the current validated state remains active.
    }
  });
}
