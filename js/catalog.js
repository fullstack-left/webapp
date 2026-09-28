// AvtoSmart — versioned catalog adapter and runtime validation.
import { CATALOG_META, QUESTIONS } from "../data/questions.js";
import { TOPICS } from "../data/topics.js";

const LOCALES = ["uz", "cy", "ru"];
const topicById = new Map(TOPICS.map((topic) => [topic.id, topic]));
const questionById = new Map();
const questionIdsByTopic = new Map(TOPICS.map((topic) => [topic.id, []]));

function hasTranslations(value) {
  return value && LOCALES.every((locale) => typeof value[locale] === "string" && value[locale].trim());
}

export function validateCatalog() {
  const errors = [];
  const seen = new Set();

  if (!CATALOG_META?.version) errors.push("Catalog version is missing");
  if (!Array.isArray(QUESTIONS) || QUESTIONS.length < 20) {
    errors.push("Strict exam requires at least 20 questions");
  }

  for (const [index, question] of QUESTIONS.entries()) {
    const label = question?.id || `index:${index}`;
    if (!question?.id || typeof question.id !== "string") errors.push(`${label}: invalid id`);
    if (seen.has(question?.id)) errors.push(`${label}: duplicate id`);
    seen.add(question?.id);
    if (!topicById.has(question?.topicId)) errors.push(`${label}: unknown topic ${question?.topicId}`);
    if (!hasTranslations(question?.prompt)) errors.push(`${label}: incomplete prompt translations`);
    if (!hasTranslations(question?.explanation)) errors.push(`${label}: incomplete explanation translations`);
    if (!Array.isArray(question?.choices) || question.choices.length !== 4) {
      errors.push(`${label}: exactly four choices are required`);
      continue;
    }
    const choiceIds = new Set();
    for (const choice of question.choices) {
      if (!choice?.id || choiceIds.has(choice.id)) errors.push(`${label}: invalid or duplicate choice id`);
      choiceIds.add(choice?.id);
      if (!hasTranslations(choice?.text)) errors.push(`${label}/${choice?.id}: incomplete choice translations`);
    }
    if (!choiceIds.has(question.correctChoiceId)) errors.push(`${label}: correctChoiceId does not exist`);
    if (!hasTranslations(question?.source?.section) || !question?.source?.url) {
      errors.push(`${label}: incomplete source metadata`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    stats: {
      questions: QUESTIONS.length,
      topics: new Set(QUESTIONS.map((question) => question.topicId)).size,
      version: CATALOG_META.version,
    },
  };
}

const validation = validateCatalog();
if (!validation.valid) {
  console.error("AvtoSmart catalog validation failed", validation.errors);
} else {
  for (const question of QUESTIONS) {
    questionById.set(question.id, question);
    questionIdsByTopic.get(question.topicId)?.push(question.id);
  }
}

export function getCatalogStatus() {
  return validation;
}

export function getQuestion(questionId) {
  return questionById.get(questionId) ?? null;
}

export function getQuestions(questionIds) {
  return questionIds.map(getQuestion).filter(Boolean);
}

export function getAllQuestions() {
  return QUESTIONS.slice();
}

export function getAllQuestionIds() {
  return QUESTIONS.map((question) => question.id);
}

export function getTopic(topicId) {
  return topicById.get(Number(topicId)) ?? null;
}

export function getTopics() {
  return TOPICS.slice();
}

export function getQuestionIdsByTopic(topicId) {
  return (questionIdsByTopic.get(Number(topicId)) ?? []).slice();
}

export function getChoice(question, choiceId) {
  return question?.choices.find((choice) => choice.id === choiceId) ?? null;
}

export function isCorrectChoice(questionId, choiceId) {
  const question = getQuestion(questionId);
  return Boolean(question && question.correctChoiceId === choiceId);
}

export { CATALOG_META, LOCALES };
