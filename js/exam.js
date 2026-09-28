// AvtoSmart — pure session engine for strict exams and guided practice.
import { CATALOG_META, getQuestion } from "./catalog.js";

export const EXAM_CONFIG = Object.freeze({
  count: 20,
  durationSec: 25 * 60,
  passThreshold: 18,
});

export const SESSION_MODES = Object.freeze({
  EXAM: "exam",
  PRACTICE: "practice",
});

function randomIndex(max) {
  if (max <= 1) return 0;
  if (globalThis.crypto?.getRandomValues) {
    const ceiling = Math.floor(0x100000000 / max) * max;
    const bucket = new Uint32Array(1);
    do globalThis.crypto.getRandomValues(bucket); while (bucket[0] >= ceiling);
    return bucket[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export function shuffle(values) {
  const result = values.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = randomIndex(index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function createId(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.();
  return `${prefix}_${uuid ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
}

function uniqueKnownIds(questionIds) {
  return [...new Set(questionIds)].filter((questionId) => getQuestion(questionId));
}

export function createSession({
  mode,
  source = mode === SESSION_MODES.EXAM ? "exam" : "quick",
  questionIds,
  topicId = null,
  count,
  now = Date.now(),
}) {
  if (!Object.values(SESSION_MODES).includes(mode)) throw new Error(`Unknown session mode: ${mode}`);

  const eligible = uniqueKnownIds(questionIds ?? []);
  const requestedCount = mode === SESSION_MODES.EXAM
    ? EXAM_CONFIG.count
    : Math.min(count ?? eligible.length, eligible.length);

  if (mode === SESSION_MODES.EXAM && eligible.length < EXAM_CONFIG.count) {
    throw new Error(`Strict exam needs ${EXAM_CONFIG.count} unique questions; received ${eligible.length}`);
  }
  if (!requestedCount) throw new Error("Cannot create an empty session");

  const questionOrder = shuffle(eligible).slice(0, requestedCount);
  const choiceOrders = Object.fromEntries(questionOrder.map((questionId) => {
    const question = getQuestion(questionId);
    return [questionId, shuffle(question.choices.map((choice) => choice.id))];
  }));

  const questionSnapshots = Object.fromEntries(questionOrder.map((questionId) => [
    questionId,
    snapshotQuestion(getQuestion(questionId)),
  ]));

  return {
    schemaVersion: 2,
    id: createId("session"),
    catalogVersion: CATALOG_META.version,
    mode,
    source,
    topicId,
    status: "active",
    questionOrder,
    choiceOrders,
    questionSnapshots,
    currentIndex: 0,
    questionEnteredAt: now,
    questionElapsedMs: {},
    answersByQuestion: {},
    flaggedIds: [],
    startedAt: now,
    deadlineAt: mode === SESSION_MODES.EXAM ? now + EXAM_CONFIG.durationSec * 1000 : null,
    submittedAt: null,
  };
}

export function currentQuestionId(session) {
  return session.questionOrder[session.currentIndex] ?? null;
}

export function getSessionQuestion(session, questionId) {
  return session.questionSnapshots?.[questionId] ?? getQuestion(questionId);
}

function elapsedForCurrentQuestion(session, now) {
  const questionId = currentQuestionId(session);
  const previous = Number(session.questionElapsedMs?.[questionId]) || 0;
  const active = session.questionEnteredAt === null ? 0 : Math.max(0, now - session.questionEnteredAt);
  return Math.min(30 * 60 * 1000, previous + active);
}

function pauseCurrentQuestion(session, now) {
  const questionId = currentQuestionId(session);
  if (!questionId || session.questionEnteredAt === null) return { ...session, questionEnteredAt: null };
  const answeredElapsed = Number(session.answersByQuestion[questionId]?.elapsedMs) || 0;
  const elapsed = session.answersByQuestion[questionId]
    ? Math.max(Number(session.questionElapsedMs?.[questionId]) || 0, answeredElapsed)
    : elapsedForCurrentQuestion(session, now);
  return {
    ...session,
    questionEnteredAt: null,
    questionElapsedMs: {
      ...session.questionElapsedMs,
      [questionId]: elapsed,
    },
  };
}

export function selectAnswer(session, questionId, choiceId, now = Date.now()) {
  if (session.status !== "active") return session;
  const question = getSessionQuestion(session, questionId);
  if (!question || !question.choices.some((choice) => choice.id === choiceId)) return session;
  if (session.mode === SESSION_MODES.PRACTICE && session.answersByQuestion[questionId]) return session;

  const elapsedMs = questionId === currentQuestionId(session)
    ? elapsedForCurrentQuestion(session, now)
    : Number(session.questionElapsedMs?.[questionId]) || 0;
  return {
    ...session,
    questionEnteredAt: now,
    questionElapsedMs: { ...session.questionElapsedMs, [questionId]: elapsedMs },
    answersByQuestion: {
      ...session.answersByQuestion,
      [questionId]: {
        choiceId,
        selectedAt: now,
        elapsedMs,
      },
    },
  };
}

export function clearAnswer(session, questionId) {
  if (session.status !== "active" || session.mode !== SESSION_MODES.EXAM) return session;
  const answersByQuestion = { ...session.answersByQuestion };
  delete answersByQuestion[questionId];
  return { ...session, answersByQuestion };
}

export function moveTo(session, index, now = Date.now()) {
  if (session.status !== "active") return session;
  const bounded = Math.max(0, Math.min(Number(index) || 0, session.questionOrder.length - 1));
  if (bounded === session.currentIndex) return session;
  const paused = pauseCurrentQuestion(session, now);
  return { ...paused, currentIndex: bounded, questionEnteredAt: now };
}

export function moveBy(session, delta, now = Date.now()) {
  return moveTo(session, session.currentIndex + delta, now);
}

export function pauseSession(session, now = Date.now()) {
  if (session.status !== "active") return session;
  return pauseCurrentQuestion(session, now);
}

export function resumeSession(session, now = Date.now()) {
  if (session.status !== "active") return session;
  return { ...session, questionEnteredAt: now };
}

export function toggleFlag(session, questionId) {
  if (session.status !== "active" || !session.questionOrder.includes(questionId)) return session;
  const flagged = new Set(session.flaggedIds);
  flagged.has(questionId) ? flagged.delete(questionId) : flagged.add(questionId);
  return { ...session, flaggedIds: [...flagged] };
}

export function getSessionSummary(session) {
  const answered = session.questionOrder.filter((id) => session.answersByQuestion[id]).length;
  return {
    total: session.questionOrder.length,
    answered,
    unanswered: session.questionOrder.length - answered,
    flagged: session.flaggedIds.length,
    current: session.currentIndex + 1,
  };
}

export function getRemainingSeconds(session, now = Date.now()) {
  if (!session.deadlineAt) return null;
  return Math.max(0, Math.ceil((session.deadlineAt - now) / 1000));
}

export function isExpired(session, now = Date.now()) {
  const remaining = getRemainingSeconds(session, now);
  return remaining !== null && remaining <= 0;
}

function snapshotQuestion(question) {
  return JSON.parse(JSON.stringify({
    id: question.id,
    topicId: question.topicId,
    prompt: question.prompt,
    choices: question.choices,
    correctChoiceId: question.correctChoiceId,
    explanation: question.explanation,
    source: question.source,
  }));
}

export function gradeSession(session, now = Date.now()) {
  const rows = session.questionOrder.map((questionId) => {
    const question = getSessionQuestion(session, questionId);
    const answer = session.answersByQuestion[questionId] ?? null;
    const correct = Boolean(answer && answer.choiceId === question.correctChoiceId);
    return {
      questionId,
      choiceId: answer?.choiceId ?? null,
      correctChoiceId: question.correctChoiceId,
      correct,
      unanswered: !answer,
      flagged: session.flaggedIds.includes(questionId),
      elapsedMs: answer?.elapsedMs ?? null,
      questionSnapshot: snapshotQuestion(question),
    };
  });
  const correct = rows.filter((row) => row.correct).length;
  const total = rows.length;
  const passed = session.mode === SESSION_MODES.EXAM
    ? correct >= EXAM_CONFIG.passThreshold
    : null;
  const submittedAt = session.mode === SESSION_MODES.EXAM
    ? Math.min(now, session.deadlineAt)
    : now;
  const durationMs = session.mode === SESSION_MODES.EXAM
    ? Math.max(0, submittedAt - session.startedAt)
    : rows.reduce((sum, row) => sum + (Number(row.elapsedMs) || 0), 0);

  return {
    id: createId("attempt"),
    sessionId: session.id,
    schemaVersion: 2,
    catalogVersion: session.catalogVersion,
    mode: session.mode,
    source: session.source,
    topicId: session.topicId,
    startedAt: session.startedAt,
    submittedAt,
    durationMs,
    correct,
    total,
    accuracy: total ? Math.round((correct / total) * 100) : 0,
    passed,
    rows,
  };
}

export function completeSession(session, now = Date.now()) {
  return { ...session, status: "submitted", submittedAt: now };
}
