// AvtoSmart — Ilova mantig'i (SPA router + render)
import { TOPICS } from "../data/topics.js";
import { LANGS, t, tr, setLang, getLang } from "./i18n.js";
import { store, computeStats } from "./storage.js";
import {
  EXAM_CONFIG, buildExamSet, questionsByTopic, questionsByIds,
  newExamState, isPass,
} from "./exam.js";

const app = document.getElementById("app");
const nav = document.getElementById("nav");

// --- Global holat ---
let route = "home";           // home | topics | topic | exam | result | mistakes | profile
let activeTopicId = null;
let exam = null;              // joriy imtihon holati
let examMode = "exam";        // "exam" | "topic" | "mistakes"
let timerId = null;
let timeLeft = 0;
let lastResult = null;

// --- Init: til va tema ---
setLang(store.lang);
applyTheme(store.theme);

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

// ---------- Router ----------
function go(next, opts = {}) {
  stopTimer();
  route = next;
  if (opts.topicId !== undefined) activeTopicId = opts.topicId;
  render();
}

// ---------- Yordamchi ----------
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function fmtTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

// ---------- Navbar ----------
function renderNav() {
  const items = [
    ["home", "🏠", t("navHome")],
    ["topics", "📚", t("navTopics")],
    ["exam", "📝", t("navExam")],
    ["mistakes", "❌", t("navMistakes")],
    ["profile", "👤", t("navProfile")],
  ];
  nav.innerHTML = "";

  const brand = el(`<div class="brand"><span class="logo">🚗</span><span>AvtoSmart</span></div>`);
  brand.onclick = () => go("home");
  nav.appendChild(brand);

  const tabs = el(`<div class="tabs"></div>`);
  for (const [key, icon, label] of items) {
    const active = route === key || (route === "topic" && key === "topics") ||
      (route === "result" && key === "exam");
    const b = el(`<button class="tab ${active ? "active" : ""}"><span>${icon}</span><span class="tab-label">${label}</span></button>`);
    b.onclick = () => {
      if (key === "exam") startExam("exam");
      else go(key);
    };
    tabs.appendChild(b);
  }
  nav.appendChild(tabs);

  // Til + tema tugmalari
  const controls = el(`<div class="controls"></div>`);
  const langSel = el(`<select class="lang-select" title="${t("theme")}"></select>`);
  for (const l of LANGS) {
    const o = el(`<option value="${l.code}">${l.label}</option>`);
    if (l.code === getLang()) o.selected = true;
    langSel.appendChild(o);
  }
  langSel.onchange = (e) => {
    setLang(e.target.value);
    store.setLang(e.target.value);
    render();
  };
  controls.appendChild(langSel);

  const themeBtn = el(`<button class="icon-btn" title="Theme">${store.theme === "dark" ? "🌙" : "☀️"}</button>`);
  themeBtn.onclick = () => {
    const next = store.theme === "dark" ? "light" : "dark";
    store.setTheme(next);
    applyTheme(next);
    renderNav();
  };
  controls.appendChild(themeBtn);
  nav.appendChild(controls);
}

// ---------- Ekranlar ----------
function render() {
  renderNav();
  app.innerHTML = "";
  let view;
  switch (route) {
    case "home": view = viewHome(); break;
    case "topics": view = viewTopics(); break;
    case "topic": view = viewTopic(); break;
    case "exam": view = viewExam(); break;
    case "result": view = viewResult(); break;
    case "mistakes": view = viewMistakes(); break;
    case "profile": view = viewProfile(); break;
    default: view = viewHome();
  }
  view.classList.add("fade-in");
  app.appendChild(view);
}

function viewHome() {
  const stats = computeStats();
  const wrap = el(`<section class="screen"></section>`);
  wrap.appendChild(el(`
    <div class="hero card">
      <div class="hero-badge">🚦 ${t("tagline")}</div>
      <h1 class="hero-title">${t("heroTitle")}</h1>
      <p class="hero-text">${t("heroText")}</p>
      <div class="hero-actions"></div>
    </div>
  `));
  const actions = wrap.querySelector(".hero-actions");

  const b1 = el(`<button class="btn btn-primary">📝 ${t("startExam")}</button>`);
  b1.onclick = () => startExam("exam");
  const b2 = el(`<button class="btn btn-ghost">📚 ${t("practiceTopics")}</button>`);
  b2.onclick = () => go("topics");
  actions.append(b1, b2);

  // Tezkor statistika
  const grid = el(`<div class="stat-grid"></div>`);
  grid.append(
    statCard("📝", stats.total, t("totalExams")),
    statCard("✅", stats.passRate + "%", t("passRate")),
    statCard("🏆", stats.best, t("bestScore")),
    statCard("❌", stats.mistakesLeft, t("mistakesLeft")),
  );
  wrap.appendChild(grid);
  return wrap;
}

function statCard(icon, value, label) {
  return el(`<div class="card stat-card"><div class="stat-icon">${icon}</div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`);
}

function viewTopics() {
  const wrap = el(`<section class="screen"></section>`);
  wrap.appendChild(el(`<h2 class="screen-title">📚 ${t("navTopics")}</h2>`));
  const grid = el(`<div class="topic-grid"></div>`);
  for (const topic of TOPICS) {
    const count = questionsByTopic(topic.id).length;
    const c = el(`
      <button class="card topic-card ${count === 0 ? "muted" : ""}">
        <span class="topic-icon">${topic.icon}</span>
        <span class="topic-name">${tr(topic.name)}</span>
        <span class="topic-count">${count} ${t("topicQuestions")}</span>
      </button>
    `);
    c.onclick = () => { if (count > 0) go("topic", { topicId: topic.id }); };
    grid.appendChild(c);
  }
  wrap.appendChild(grid);
  return wrap;
}

function viewTopic() {
  const topic = TOPICS.find((x) => x.id === activeTopicId);
  const qs = questionsByTopic(activeTopicId);
  const wrap = el(`<section class="screen"></section>`);
  const back = el(`<button class="btn btn-ghost small">← ${t("back")}</button>`);
  back.onclick = () => go("topics");
  wrap.appendChild(back);
  wrap.appendChild(el(`<h2 class="screen-title">${topic.icon} ${tr(topic.name)}</h2>`));
  const start = el(`<button class="btn btn-primary">▶ ${t("practiceTopics")} (${qs.length})</button>`);
  start.onclick = () => startExam("topic", qs);
  wrap.appendChild(start);
  return wrap;
}

// ---------- Imtihon oqimi ----------
function startExam(mode, customQuestions) {
  examMode = mode;
  let questions;
  if (mode === "exam") questions = buildExamSet();
  else if (mode === "topic") questions = customQuestions ?? [];
  else if (mode === "mistakes") questions = questionsByIds(store.mistakes);

  if (!questions || questions.length === 0) {
    alert(t("noMistakes"));
    go(mode === "mistakes" ? "mistakes" : "topics");
    return;
  }
  exam = newExamState(questions);
  route = "exam";
  if (mode === "exam") {
    timeLeft = EXAM_CONFIG.durationSec;
    startTimer();
  } else {
    timeLeft = 0;
  }
  render();
}

function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    timeLeft--;
    const badge = document.getElementById("timer");
    if (badge) {
      badge.textContent = fmtTime(timeLeft);
      if (timeLeft <= 60) badge.classList.add("danger");
    }
    if (timeLeft <= 0) finishExam();
  }, 1000);
}
function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

function viewExam() {
  const q = exam.questions[exam.index];
  const total = exam.questions.length;
  const answered = exam.answers[exam.index];
  const wrap = el(`<section class="screen exam-screen"></section>`);

  // Header: progress + timer
  const header = el(`
    <div class="exam-header">
      <div class="exam-progress">${t("question")} <b>${exam.index + 1}</b> / ${total}</div>
      ${examMode === "exam" ? `<div id="timer" class="timer">${fmtTime(timeLeft)}</div>` : ""}
    </div>
  `);
  wrap.appendChild(header);

  const bar = el(`<div class="progress-bar"><span style="width:${((exam.index) / total) * 100}%"></span></div>`);
  wrap.appendChild(bar);

  const card = el(`<div class="card question-card"></div>`);
  card.appendChild(el(`<div class="topic-tag">${topicName(q.topicId)}</div>`));
  card.appendChild(el(`<h3 class="question-text">${tr(q.q)}</h3>`));

  const opts = el(`<div class="options"></div>`);
  q.options.forEach((opt, i) => {
    const btn = el(`<button class="option"><span class="opt-key">${String.fromCharCode(65 + i)}</span><span>${tr(opt)}</span></button>`);
    if (answered !== null) {
      btn.disabled = true;
      if (i === q.correct) btn.classList.add("correct");
      else if (i === answered) btn.classList.add("wrong");
    }
    btn.onclick = () => selectAnswer(i);
    opts.appendChild(btn);
  });
  card.appendChild(opts);

  // Feedback (javob berilgandan keyin)
  if (answered !== null) {
    const ok = answered === q.correct;
    const fb = el(`
      <div class="feedback ${ok ? "ok" : "no"}">
        <div class="fb-head">${ok ? "✅ " + t("correctAns") : "❌ " + t("wrongAns")}</div>
        <div class="fb-exp"><b>${t("explanation")}:</b> ${tr(q.explanation)}</div>
        <div class="fb-ref">📖 ${q.ref}</div>
      </div>
    `);
    card.appendChild(fb);

    const nextBtn = el(`<button class="btn btn-primary">${exam.index + 1 < total ? t("next") + " →" : t("finish")}</button>`);
    nextBtn.onclick = () => {
      if (exam.index + 1 < total) { exam.index++; render(); }
      else finishExam();
    };
    card.appendChild(nextBtn);
  }

  wrap.appendChild(card);
  return wrap;
}

function selectAnswer(i) {
  if (exam.answers[exam.index] !== null) return; // qayta tanlashni bloklash
  const q = exam.questions[exam.index];
  exam.answers[exam.index] = i;
  if (i === q.correct) {
    exam.correctCount++;
    if (examMode === "mistakes") store.resolveMistake(q.id);
  } else {
    store.addMistake(q.id);
  }
  render();
}

function finishExam() {
  stopTimer();
  const total = exam.questions.length;
  const correct = exam.correctCount;
  const passed = examMode === "exam" ? isPass(correct) : correct === total;
  if (examMode === "exam") store.saveExam(correct, total, passed);
  lastResult = { correct, total, passed, mode: examMode };
  route = "result";
  render();
}

function viewResult() {
  const r = lastResult;
  const pct = Math.round((r.correct / r.total) * 100);
  const wrap = el(`<section class="screen"></section>`);
  wrap.appendChild(el(`
    <div class="card result-card ${r.passed ? "pass" : "fail"}">
      <div class="result-emoji">${r.passed ? "🎉" : "😔"}</div>
      <h2 class="result-status">${r.passed ? t("passed") : t("failed")}</h2>
      <div class="result-score">${r.correct} / ${r.total}</div>
      <div class="result-sub">${t("correctCount")} · ${pct}%</div>
      <div class="result-actions"></div>
    </div>
  `));
  const actions = wrap.querySelector(".result-actions");
  const retry = el(`<button class="btn btn-primary">🔄 ${t("retry")}</button>`);
  retry.onclick = () => startExam(r.mode === "exam" ? "exam" : "exam");
  const mist = el(`<button class="btn btn-ghost">❌ ${t("toMistakes")}</button>`);
  mist.onclick = () => go("mistakes");
  actions.append(retry, mist);
  return wrap;
}

function viewMistakes() {
  const ids = store.mistakes;
  const qs = questionsByIds(ids);
  const wrap = el(`<section class="screen"></section>`);
  wrap.appendChild(el(`<h2 class="screen-title">❌ ${t("navMistakes")}</h2>`));

  if (qs.length === 0) {
    wrap.appendChild(el(`<div class="card empty">${t("noMistakes")}</div>`));
    return wrap;
  }

  wrap.appendChild(el(`<p class="hint">${t("mistakesDesc")}</p>`));
  const start = el(`<button class="btn btn-primary">▶ ${t("reviewMistakes")} (${qs.length})</button>`);
  start.onclick = () => startExam("mistakes");
  wrap.appendChild(start);

  const list = el(`<div class="mistake-list"></div>`);
  for (const q of qs) {
    list.appendChild(el(`
      <div class="card mistake-item">
        <div class="topic-tag">${topicName(q.topicId)}</div>
        <div class="mistake-q">${tr(q.q)}</div>
      </div>
    `));
  }
  wrap.appendChild(list);
  return wrap;
}

function viewProfile() {
  const stats = computeStats();
  const wrap = el(`<section class="screen"></section>`);
  wrap.appendChild(el(`<h2 class="screen-title">👤 ${t("profileTitle")}</h2>`));
  const grid = el(`<div class="stat-grid"></div>`);
  grid.append(
    statCard("📝", stats.total, t("totalExams")),
    statCard("✅", stats.passRate + "%", t("passRate")),
    statCard("🏆", stats.best, t("bestScore")),
    statCard("❌", stats.mistakesLeft, t("mistakesLeft")),
  );
  wrap.appendChild(grid);

  // So'nggi imtihonlar
  const exams = store.exams.slice(-8).reverse();
  if (exams.length) {
    const list = el(`<div class="history"></div>`);
    for (const e of exams) {
      const d = new Date(e.date);
      list.appendChild(el(`
        <div class="card history-item ${e.passed ? "pass" : "fail"}">
          <span>${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <b>${e.correct}/${e.total}</b>
          <span>${e.passed ? "✅" : "❌"}</span>
        </div>
      `));
    }
    wrap.appendChild(list);
  }

  const reset = el(`<button class="btn btn-danger">🗑 ${t("resetProgress")}</button>`);
  reset.onclick = () => {
    if (confirm(t("resetConfirm"))) { store.reset(); render(); }
  };
  wrap.appendChild(reset);
  return wrap;
}

function topicName(topicId) {
  const t0 = TOPICS.find((x) => x.id === topicId);
  return t0 ? `${t0.icon} ${tr(t0.name)}` : "";
}

// ---------- Boshlash ----------
render();
