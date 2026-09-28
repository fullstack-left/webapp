// AvtoSmart — accessible hash-routed learning experience.
import {
  CATALOG_META,
  getAllQuestionIds,
  getCatalogStatus,
  getChoice,
  getQuestion,
  getQuestionIdsByTopic,
  getTopic,
  getTopics,
} from "./catalog.js";
import {
  EXAM_CONFIG,
  SESSION_MODES,
  createSession,
  currentQuestionId,
  getRemainingSeconds,
  getSessionQuestion,
  getSessionSummary,
  gradeSession,
  isExpired,
  moveBy,
  moveTo,
  pauseSession,
  resumeSession,
  selectAnswer,
  toggleFlag,
} from "./exam.js";
import { computeDashboard, getTopicMastery, repository } from "./storage.js";
import {
  LANGS,
  formatDate,
  formatDuration,
  getDocumentLocale,
  getLang,
  setLang,
  t,
  tr,
} from "./i18n.js";

const app = document.getElementById("app");
const nav = document.getElementById("nav");
const liveRegion = document.getElementById("live-region");
const toastRegion = document.getElementById("toast-region");
const dialog = document.getElementById("app-dialog");
const footer = document.getElementById("footer");

let currentSession = repository.getActiveSession();
let topicSearch = "";
let topicFilter = "all";
let resultFilter = "all";
let timerId = null;
let timerMilestone = null;
let deferredInstallPrompt = null;
let lastRouteName = route().name;

const ICONS = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></svg>',
  topics: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h5v18H6a2 2 0 0 1-2-2Zm9-2h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5Z"/></svg>',
  exam: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h6M9 9h6M9 13h3M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/></svg>',
  mistakes: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4m0 4h.01M10.3 3.8 2.2 18a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3L13.7 3.8a2 2 0 0 0-3.4 0Z"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>',
  profile: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  flag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4m0 1h11l-2 4 2 4H5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5a8.5 8.5 0 1 0 11.7 11.7Z"/></svg>',
  download: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 21h14"/></svg>',
  target: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v3m9 6h-3m-6 9v-3m-9-6h3"/></svg>',
  flame: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c4 0 7-2.8 7-6.7 0-3.1-1.8-5.4-4.6-8.3.1 2-1 3.1-2 3.8.3-3.5-1.9-6.5-4.8-8.8.2 3.8-2.6 6.2-2.6 10.6C5 18.1 8 22 12 22Z"/><path d="M9.5 17.2c0 2 1.1 3.3 2.5 3.3s2.5-1.3 2.5-3.3c0-1.5-.8-2.6-2.5-4.3-1.7 1.7-2.5 2.8-2.5 4.3Z"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v4a4 4 0 0 1-8 0Zm4 8v5m-4 4h8M6 6H3v1a4 4 0 0 0 5 4m10-5h3v1a4 4 0 0 1-5 4"/></svg>',
  settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></svg>',
};

function e(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function route() {
  const clean = (location.hash || "#/home").replace(/^#\/?/, "");
  const [name = "home", ...params] = clean.split("/").filter(Boolean);
  return { name, params };
}

function href(path) {
  return `#/${path.replace(/^\//, "")}`;
}

function applyPreferences() {
  const { settings } = repository.snapshot();
  setLang(settings.lang);
  document.documentElement.lang = getDocumentLocale();
  document.documentElement.dataset.theme = settings.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    settings.theme === "dark" ? "#07111f" : "#f4f7fb",
  );
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) manifestLink.href = settings.lang === "ru"
    ? "manifest.ru.webmanifest"
    : settings.lang === "cy" ? "manifest.cy.webmanifest" : "manifest.webmanifest";
  const skipLink = document.querySelector('[data-action="skip-content"]');
  if (skipLink) skipLink.textContent = t("skip");
  const updateText = document.querySelector("#update-banner span");
  const updateButton = document.getElementById("apply-update");
  if (updateText) updateText.textContent = t("updateReady");
  if (updateButton) updateButton.textContent = t("refresh");
}

function announce(message) {
  if (!liveRegion) return;
  liveRegion.textContent = "";
  requestAnimationFrame(() => { liveRegion.textContent = message; });
}

function toast(message, type = "info") {
  if (!toastRegion) return;
  const item = document.createElement("div");
  item.className = `toast toast-${type}`;
  item.setAttribute("role", "status");
  item.textContent = message;
  toastRegion.appendChild(item);
  requestAnimationFrame(() => item.classList.add("is-visible"));
  setTimeout(() => {
    item.classList.remove("is-visible");
    setTimeout(() => item.remove(), 220);
  }, 3200);
}

function setHash(path) {
  const next = href(path);
  if (location.hash === next) render({ focusHeading: true });
  else location.hash = next;
}

function activeRoute(name) {
  const currentRoute = route();
  const current = currentRoute.name;
  if (name === "home") return current === "home";
  if (name === "topics") return current === "topics";
  if (name === "exam") {
    if (current === "session") return currentSession?.mode === SESSION_MODES.EXAM;
    if (current === "result") return repository.getAttempt(currentRoute.params[0])?.mode === SESSION_MODES.EXAM;
    return false;
  }
  return current === name;
}

function renderNav() {
  const dashboard = computeDashboard();
  const links = [
    ["home", "home", t("navHome")],
    ["topics", "topics", t("navTopics")],
    ["exam", "exam", t("navExam")],
    ["mistakes", "mistakes", t("navMistakes")],
    ["bookmarks", "bookmark", t("navBookmarks")],
    ["profile", "profile", t("navProfile")],
  ];

  nav.innerHTML = `
    <div class="nav-shell">
      <a class="brand" href="${href("home")}" aria-label="${e(t("appName"))} — ${e(t("navHome"))}">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span></span>
        <span class="brand-copy"><strong>${e(t("appName"))}</strong><small>${e(t("tagline"))}</small></span>
      </a>
      <nav class="desktop-nav" aria-label="${e(t("appName"))}">
        ${links.map(([path, iconName, label]) => `
          <a class="nav-link ${activeRoute(path) ? "active" : ""}" href="${href(path === "exam" ? "new-exam" : path)}" ${path === "exam" ? 'data-action="start-exam"' : ""} ${activeRoute(path) ? 'aria-current="page"' : ""}>
            ${ICONS[iconName]}<span>${e(label)}</span>
            ${path === "mistakes" && dashboard.mistakes ? `<b class="nav-count">${dashboard.mistakes}</b>` : ""}
          </a>
        `).join("")}
      </nav>
      <div class="nav-actions">
        <button id="install-button" class="icon-button install-button ${deferredInstallPrompt ? "" : "hidden"}" type="button" data-action="install-app" aria-label="${e(t("install"))}" title="${e(t("install"))}">
          <span aria-hidden="true">${ICONS.download}</span>
        </button>
        <button class="icon-button theme-toggle" type="button" data-action="toggle-theme" aria-label="${e(t("appearance"))}">
          <span aria-hidden="true">${repository.snapshot().settings.theme === "dark" ? ICONS.moon : ICONS.sun}</span>
        </button>
        <a class="avatar-button" href="${href("profile")}" aria-label="${e(t("navProfile"))}"><span>AS</span></a>
      </div>
    </div>
    <nav class="mobile-nav" aria-label="${e(t("appName"))}">
      ${links.map(([path, iconName, label]) => `
        <a class="mobile-nav-link ${activeRoute(path) ? "active" : ""}" href="${href(path === "exam" ? "new-exam" : path)}" ${path === "exam" ? 'data-action="start-exam"' : ""} ${activeRoute(path) ? 'aria-current="page"' : ""}>
          <span class="mobile-icon">${ICONS[iconName]}${path === "mistakes" && dashboard.mistakes ? `<b>${Math.min(dashboard.mistakes, 99)}</b>` : ""}</span>
          <span>${e(label)}</span>
        </a>
      `).join("")}
    </nav>
  `;
}

function renderFooter() {
  if (!footer) return;
  footer.innerHTML = `
    <div><strong>AvtoSmart</strong><span>${e(t("educational"))}</span></div>
    <div>
      <a href="${e(CATALOG_META.officialSourceUrl)}" target="_blank" rel="noopener noreferrer">Lex.uz${ICONS.arrow}</a>
      <span>${e(t("catalogVersion", { version: CATALOG_META.version, date: CATALOG_META.updatedAt }))}</span>
    </div>
  `;
}

function difficultyLabel(value) {
  return t(`difficulty${String(value).charAt(0).toUpperCase()}${String(value).slice(1)}`);
}

function pageHeader(eyebrow, title, text) {
  return `
    <header class="page-heading">
      <p class="eyebrow">${e(eyebrow)}</p>
      <h1 tabindex="-1">${e(title)}</h1>
      ${text ? `<p>${e(text)}</p>` : ""}
    </header>
  `;
}

function statCard(icon, value, label, tone = "blue") {
  return `
    <article class="metric-card tone-${tone}">
      <div class="metric-icon" aria-hidden="true">${icon}</div>
      <div><strong>${e(value)}</strong><span>${e(label)}</span></div>
    </article>
  `;
}

function resumeCard(session) {
  const summary = getSessionSummary(session);
  const topic = session.topicId ? getTopic(session.topicId) : null;
  const title = session.mode === SESSION_MODES.EXAM ? t("sessionExam") : (topic ? tr(topic.name) : t("sessionPractice"));
  const remaining = getRemainingSeconds(session);
  return `
    <section class="resume-card surface-card">
      <div class="resume-icon" aria-hidden="true">${ICONS.clock}</div>
      <div class="resume-copy">
        <span class="section-kicker">${e(t("resumeTitle"))}</span>
        <h2>${e(title)}</h2>
        <p>${e(t("resumeText", { answered: summary.answered, total: summary.total }))}</p>
        <div class="inline-progress"><span style="width:${Math.round((summary.answered / summary.total) * 100)}%"></span></div>
      </div>
      ${remaining !== null ? `<div class="resume-time"><small>${e(t("timeLeft"))}</small><strong>${formatClock(remaining)}</strong></div>` : ""}
      <div class="resume-actions">
        <button class="button button-primary" data-action="resume-session">${e(t("resume"))}${ICONS.arrow}</button>
        <button class="button button-subtle" data-action="request-discard">${e(t("discard"))}</button>
      </div>
    </section>
  `;
}

function renderHome() {
  const dashboard = computeDashboard();
  const savedState = repository.snapshot();
  const active = repository.getActiveSession();
  const goalPercent = Math.min(100, Math.round((dashboard.answeredToday / dashboard.dailyGoal) * 100));
  const readiness = dashboard.exams
    ? Math.round(dashboard.accuracy * 0.6 + dashboard.passRate * 0.4)
    : dashboard.accuracy;
  const recent = repository.getRecentAttempts(4);

  return `
    <div class="dashboard-view">
      ${savedState.recovery ? `<section class="recovery-card surface-card" role="status"><span>${ICONS.mistakes}</span><div><strong>${e(t("storageRecovery"))}</strong><small>${e(savedState.recovery.error ?? savedState.recovery.key)}</small></div><a class="button button-subtle" href="${href("profile")}">${e(t("exportData"))}${ICONS.arrow}</a></section>` : ""}
      ${active ? resumeCard(active) : ""}
      <section class="hero-panel">
        <div class="hero-content">
          <p class="eyebrow">${e(t("greeting"))}</p>
          <h1 tabindex="-1">${e(t("heroTitle"))}</h1>
          <p>${e(t("heroText"))}</p>
          <div class="hero-actions">
            <button class="button button-primary button-lg" data-action="start-exam">${ICONS.exam}${e(t("startExam"))}</button>
            <button class="button button-glass button-lg" data-action="start-quick">${e(t("quickPractice"))}${ICONS.arrow}</button>
          </div>
          <div class="hero-meta"><span class="status-dot"></span>${e(t("examMeta"))}</div>
        </div>
        <div class="readiness-card" aria-label="${e(t("accuracy"))}: ${readiness}%">
          <div class="readiness-ring" style="--progress:${readiness}">
            <div><strong>${readiness}%</strong><span>${e(t("accuracy"))}</span></div>
          </div>
          <div class="readiness-mini">
            <span><b>${dashboard.exams}</b>${e(t("navExam"))}</span>
            <span><b>${dashboard.bestScore}/20</b>${e(t("bestScore"))}</span>
          </div>
        </div>
      </section>

      <section class="dashboard-grid">
        <article class="goal-card surface-card">
          <div class="goal-ring" style="--progress:${goalPercent}">
            <div><strong>${dashboard.answeredToday}</strong><span>/${dashboard.dailyGoal}</span></div>
          </div>
          <div>
            <span class="section-kicker">${e(t("todayGoal"))}</span>
            <h2>${goalPercent >= 100 ? `100% ${ICONS.check}` : `${goalPercent}%`}</h2>
            <p>${e(t("goalProgress", { done: dashboard.answeredToday, goal: dashboard.dailyGoal }))}</p>
          </div>
        </article>
        <article class="streak-card surface-card">
          <span class="streak-flame" aria-hidden="true">${ICONS.flame}</span>
          <div><span class="section-kicker">${e(t("streak"))}</span><h2>${dashboard.streak} ${e(t("day"))}</h2><p>${e(t("bestStreak"))}: ${dashboard.bestStreak}</p></div>
        </article>
      </section>

      <section class="metrics-grid" aria-label="${e(t("profileTitle"))}">
        ${statCard(ICONS.target, `${dashboard.accuracy}%`, t("accuracy"), "cyan")}
        ${statCard(ICONS.check, `${dashboard.passRate}%`, t("passRate"), "green")}
        ${statCard(ICONS.mistakes, dashboard.mistakes, t("unresolved"), "orange")}
        ${statCard(ICONS.bookmark, dashboard.bookmarks, t("navBookmarks"), "violet")}
      </section>

      <section class="section-block">
        <div class="section-title-row"><div><span class="section-kicker">${e(t("needsWork"))}</span><h2>${e(t("weakTopics"))}</h2></div><a href="${href("topics")}" class="text-link">${e(t("viewAll"))}${ICONS.arrow}</a></div>
        ${dashboard.weakTopics.length ? `<div class="weak-topic-grid">${dashboard.weakTopics.map(topicProgressCard).join("")}</div>` : `<div class="empty-inline surface-card"><span>${ICONS.target}</span><p>${e(t("allTopicsStrong"))}</p></div>`}
      </section>

      <section class="section-block">
        <div class="section-title-row"><div><span class="section-kicker">${e(t("practiceShort"))}</span><h2>${e(t("recentAttempts"))}</h2></div><a href="${href("profile")}" class="text-link">${e(t("viewAll"))}${ICONS.arrow}</a></div>
        ${recent.length ? `<div class="attempt-list">${recent.map(attemptRow).join("")}</div>` : `<div class="empty-inline surface-card"><span>${ICONS.arrow}</span><p>${e(t("noAttempts"))}</p></div>`}
      </section>
    </div>
  `;
}

function topicProgressCard(item) {
  const { topic, mastery, attempts } = item;
  return `
    <button class="topic-progress-card surface-card" data-action="start-topic" data-topic-id="${topic.id}">
      <span class="topic-symbol" aria-hidden="true">${String(topic.id).padStart(2, "0")}</span>
      <span class="topic-progress-copy"><strong>${e(tr(topic.name))}</strong><small>${attempts} ${e(t("questions"))}</small><span class="inline-progress"><i style="width:${mastery}%"></i></span></span>
      <b>${mastery}%</b>${ICONS.arrow}
    </button>
  `;
}

function attemptRow(attempt) {
  const isExam = attempt.mode === "exam";
  const state = isExam ? (attempt.passed ? "pass" : "fail") : "practice";
  const label = isExam ? (attempt.passed ? t("passedShort") : t("failedShort")) : t("practiceShort");
  const link = attempt.legacy ? href("profile") : href(`result/${attempt.id}`);
  return `
    <a class="attempt-row surface-card" href="${link}">
      <span class="attempt-status ${state}">${isExam ? (attempt.passed ? ICONS.check : ICONS.mistakes) : ICONS.arrow}</span>
      <span><strong>${e(isExam ? t("sessionExam") : t("sessionPractice"))}</strong><small>${e(formatDate(attempt.submittedAt, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", year: undefined }))}</small></span>
      <b>${attempt.correct}/${attempt.total}</b><span class="result-chip ${state}">${e(label)}</span>${ICONS.arrow}
    </a>
  `;
}

function renderTopics() {
  const normalizedSearch = topicSearch.trim().toLocaleLowerCase(getDocumentLocale());
  const items = getTopics().map((topic) => ({
    topic,
    ids: getQuestionIdsByTopic(topic.id),
    progress: getTopicMastery(topic.id),
  })).filter(({ topic, progress }) => {
    const matchesSearch = tr(topic.name).toLocaleLowerCase(getDocumentLocale()).includes(normalizedSearch);
    const matchesFilter = topicFilter === "all"
      || (topicFilter === "weak" && progress.attempts > 0 && progress.mastery < 80)
      || (topicFilter === "new" && progress.attempts === 0);
    return matchesSearch && matchesFilter;
  });

  return `
    <div class="page-view topics-view">
      ${pageHeader(t("navTopics"), t("topicsTitle"), t("topicsText"))}
      <div class="topic-toolbar surface-card">
        <label class="search-field"><span aria-hidden="true">⌕</span><span class="sr-only">${e(t("searchTopics"))}</span><input type="search" value="${e(topicSearch)}" placeholder="${e(t("searchTopics"))}" data-input="topic-search"></label>
        <div class="segmented" role="group" aria-label="${e(t("navTopics"))}">
          ${[["all", t("all")], ["weak", t("needsWork")], ["new", t("notStarted")]].map(([value, label]) => `<button class="${topicFilter === value ? "active" : ""}" data-action="topic-filter" data-value="${value}" aria-pressed="${topicFilter === value}">${e(label)}</button>`).join("")}
        </div>
      </div>
      <div class="topic-catalog">
        ${items.map(({ topic, ids, progress }, index) => `
          <article class="topic-card surface-card" style="--delay:${Math.min(index, 12) * 25}ms">
            <div class="topic-card-top"><span class="topic-symbol" aria-hidden="true">${String(topic.id).padStart(2, "0")}</span><span class="topic-number">${String(topic.id).padStart(2, "0")}</span></div>
            <h2>${e(tr(topic.name))}</h2>
            <p>${ids.length} ${e(t("questions"))} · ${progress.covered}/${progress.total} ${e(t("mastery")).toLowerCase()}</p>
            <div class="mastery-row"><span>${e(t("mastery"))}</span><b>${progress.mastery}%</b></div>
            <div class="inline-progress large"><span style="width:${progress.mastery}%"></span></div>
            <button class="button button-subtle" data-action="start-topic" data-topic-id="${topic.id}">${e(t("beginTopic"))}${ICONS.arrow}</button>
          </article>
        `).join("") || `<div class="empty-state surface-card"><span>⌕</span><h2>${e(t("unavailable"))}</h2></div>`}
      </div>
    </div>
  `;
}

function renderCollection(kind) {
  const isMistakes = kind === "mistakes";
  const ids = isMistakes ? repository.getMistakeIds() : repository.getBookmarkIds();
  const questions = ids.map(getQuestion).filter(Boolean);
  const title = isMistakes ? t("collectionMistakesTitle") : t("collectionBookmarksTitle");
  const text = isMistakes ? t("collectionMistakesText") : t("collectionBookmarksText");
  const empty = isMistakes ? t("emptyMistakes") : t("emptyBookmarks");

  return `
    <div class="page-view collection-view">
      ${pageHeader(isMistakes ? t("navMistakes") : t("navBookmarks"), title, text)}
      ${questions.length ? `
        <div class="collection-summary surface-card">
          <div><strong>${questions.length}</strong><span>${e(t("questions"))}</span></div>
          <button class="button button-primary" data-action="start-collection" data-kind="${kind}">${e(t("practiceCollection"))}${ICONS.arrow}</button>
        </div>
        <div class="question-library">
          ${questions.map((question, index) => questionLibraryItem(question, index + 1)).join("")}
        </div>
      ` : `<div class="empty-state surface-card"><span>${isMistakes ? ICONS.check : ICONS.bookmark}</span><h2>${e(empty)}</h2><p>${e(isMistakes ? t("topicsText") : t("collectionBookmarksText"))}</p><a class="button button-primary" href="${href("topics")}">${e(t("navTopics"))}${ICONS.arrow}</a></div>`}
    </div>
  `;
}

function questionLibraryItem(question, index) {
  const topic = getTopic(question.topicId);
  const bookmarked = repository.isBookmarked(question.id);
  return `
    <article class="library-item surface-card">
      <span class="library-index">${String(index).padStart(2, "0")}</span>
      <div><span class="topic-pill">${String(topic?.id ?? "").padStart(2, "0")} · ${e(tr(topic?.name))}</span><h2>${e(tr(question.prompt))}</h2><small>${e(difficultyLabel(question.difficulty))}</small></div>
      <button class="icon-button ${bookmarked ? "active" : ""}" data-action="toggle-bookmark" data-question-id="${e(question.id)}" aria-label="${e(bookmarked ? t("bookmarked") : t("bookmark"))}" aria-pressed="${bookmarked}">${ICONS.bookmark}</button>
    </article>
  `;
}

function renderSession() {
  if (!currentSession) return renderMissingSession();
  const questionId = currentQuestionId(currentSession);
  const question = getSessionQuestion(currentSession, questionId);
  if (!question) return renderMissingSession();

  const summary = getSessionSummary(currentSession);
  const answer = currentSession.answersByQuestion[questionId] ?? null;
  const answeredPractice = currentSession.mode === SESSION_MODES.PRACTICE && answer;
  const topic = getTopic(question.topicId);
  const flagged = currentSession.flaggedIds.includes(questionId);
  const bookmarked = repository.isBookmarked(questionId);
  const choiceOrder = currentSession.choiceOrders[questionId];
  const percent = Math.round((summary.answered / summary.total) * 100);

  return `
    <div class="session-view ${currentSession.mode}">
      <header class="session-topbar">
        <div>
          <span class="mode-badge ${currentSession.mode}">${currentSession.mode === SESSION_MODES.EXAM ? e(t("strictBadge")) : e(t("practiceBadge"))}</span>
          <h1 tabindex="-1">${e(currentSession.mode === SESSION_MODES.EXAM ? t("sessionExam") : t("sessionPractice"))}</h1>
        </div>
        <div class="session-top-actions">
          ${currentSession.mode === SESSION_MODES.EXAM ? `<div class="timer-block" aria-label="${e(t("timeLeft"))}">${ICONS.clock}<span><small>${e(t("timeLeft"))}</small><strong id="exam-timer">${formatClock(getRemainingSeconds(currentSession))}</strong></span></div>` : ""}
          <button class="button button-subtle" data-action="save-exit">${e(t("backHome"))}</button>
        </div>
      </header>

      <div class="session-progress-row">
        <span>${e(t("questionOf", { current: summary.current, total: summary.total }))}</span>
        <progress value="${summary.answered}" max="${summary.total}">${percent}%</progress>
        <div><b>${summary.answered}</b> ${e(t("answered"))}<b>${summary.flagged}</b> ${e(t("flagged"))}</div>
      </div>

      <div class="exam-layout">
        <section class="question-panel surface-card" aria-labelledby="question-legend">
          <div class="question-context">
            <span class="topic-pill">${String(topic?.id ?? "").padStart(2, "0")} · ${e(tr(topic?.name))}</span>
            <div class="question-tools">
              <button class="tool-button ${flagged ? "active flag" : ""}" data-action="toggle-flag" aria-pressed="${flagged}">${ICONS.flag}<span>${e(flagged ? t("unflag") : t("flag"))}</span></button>
              <button class="tool-button ${bookmarked ? "active bookmark" : ""}" data-action="toggle-bookmark" data-question-id="${e(questionId)}" aria-pressed="${bookmarked}">${ICONS.bookmark}<span>${e(bookmarked ? t("bookmarked") : t("bookmark"))}</span></button>
            </div>
          </div>

          <fieldset class="question-fieldset">
            <legend id="question-legend" tabindex="-1">${e(tr(question.prompt))}</legend>
            <p class="answer-instruction">${e(t("selectAnswer"))}</p>
            <div class="choice-list">
              ${choiceOrder.map((choiceId, index) => {
                const choice = getChoice(question, choiceId);
                const selected = answer?.choiceId === choiceId;
                const correct = answeredPractice && question.correctChoiceId === choiceId;
                const wrong = answeredPractice && selected && !correct;
                return `
                  <label class="choice-card ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}" data-choice-id="${e(choiceId)}" tabindex="-1">
                    <input type="radio" name="answer" value="${e(choiceId)}" data-input="answer" ${selected ? "checked" : ""} ${answeredPractice ? "disabled" : ""}>
                    <span class="choice-key">${index + 1}</span><span class="choice-text">${e(tr(choice?.text))}</span><span class="choice-state" aria-hidden="true">${correct ? ICONS.check : wrong ? ICONS.close : ""}</span>
                  </label>
                `;
              }).join("")}
            </div>
          </fieldset>

          ${answeredPractice ? renderFeedback(question, answer.choiceId) : currentSession.mode === SESSION_MODES.EXAM ? `<div class="strict-note"><span aria-hidden="true">${ICONS.exam}</span><p>${e(t("strictBadge"))}: ${e(t("submitText", { answered: summary.answered, total: summary.total, unanswered: summary.unanswered, flagged: summary.flagged }))}</p></div>` : ""}
        </section>

        <aside class="navigator-panel surface-card" aria-label="${e(t("questionNavigator"))}">
          <div class="navigator-heading"><h2>${e(t("questionNavigator"))}</h2><span>${summary.answered}/${summary.total}</span></div>
          ${renderPalette(currentSession)}
          <div class="navigator-legend"><span><i class="answered"></i>${e(t("answered"))}</span><span><i class="flagged"></i>${e(t("flagged"))}</span><span><i></i>${e(t("unanswered"))}</span></div>
          <p class="keyboard-hint">${e(t("keyboardHint"))}</p>
        </aside>
      </div>

      <footer class="session-actions">
        <button class="button button-subtle" data-action="session-prev" ${currentSession.currentIndex === 0 ? "disabled" : ""}>${ICONS.back}${e(t("previous"))}</button>
        <span>${summary.current} / ${summary.total}</span>
        ${currentSession.mode === SESSION_MODES.EXAM
          ? `<button class="button ${currentSession.currentIndex === summary.total - 1 ? "button-primary" : "button-subtle"}" data-action="${currentSession.currentIndex === summary.total - 1 ? "request-submit" : "session-next"}">${e(currentSession.currentIndex === summary.total - 1 ? t("reviewAndSubmit") : t("next"))}${ICONS.arrow}</button>`
          : `<button class="button button-primary" data-action="${currentSession.currentIndex === summary.total - 1 ? "finish-practice" : "session-next"}" ${!answer ? "disabled" : ""}>${e(currentSession.currentIndex === summary.total - 1 ? t("finishPractice") : t("next"))}${ICONS.arrow}</button>`}
      </footer>
    </div>
  `;
}

function renderFeedback(question, selectedChoiceId) {
  const correct = question.correctChoiceId === selectedChoiceId;
  return `
    <section class="answer-feedback ${correct ? "correct" : "wrong"}" aria-live="polite" tabindex="-1" id="answer-feedback">
      <div class="feedback-icon">${correct ? ICONS.check : ICONS.close}</div>
      <div class="feedback-copy">
        <h2>${e(correct ? t("correct") : t("incorrect"))}</h2>
        <p><strong>${e(t("explanation"))}</strong> ${e(tr(question.explanation))}</p>
        <div class="source-line"><span>${e(t("source"))}: ${e(tr(question.source.section))}</span><a href="${e(question.source.url)}" target="_blank" rel="noopener noreferrer">${e(t("openSource"))}${ICONS.arrow}</a></div>
      </div>
    </section>
  `;
}

function renderPalette(session) {
  return `<div class="question-palette">${session.questionOrder.map((questionId, index) => {
    const answered = Boolean(session.answersByQuestion[questionId]);
    const flagged = session.flaggedIds.includes(questionId);
    const current = session.currentIndex === index;
    return `<button class="palette-item ${answered ? "answered" : ""} ${flagged ? "flagged" : ""} ${current ? "current" : ""}" data-action="go-question" data-index="${index}" aria-label="${e(t("questionOf", { current: index + 1, total: session.questionOrder.length }))}" ${current ? 'aria-current="step"' : ""}>${index + 1}${flagged ? '<span aria-hidden="true"></span>' : ""}</button>`;
  }).join("")}</div>`;
}

function renderMissingSession() {
  return `<div class="page-view">${pageHeader(t("navExam"), t("unavailable"), "")}<div class="empty-state surface-card"><span>○</span><a class="button button-primary" href="${href("home")}">${e(t("backHome"))}</a></div></div>`;
}

function renderResult(attemptId) {
  const attempt = repository.getAttempt(attemptId);
  if (!attempt || attempt.legacy || !attempt.rows?.length) return renderMissingSession();
  const isExam = attempt.mode === "exam";
  const wrongIds = attempt.rows.filter((row) => !row.correct).map((row) => row.questionId);
  const visibleRows = attempt.rows.filter((row) => {
    if (resultFilter === "wrong") return !row.correct && !row.unanswered;
    if (resultFilter === "unanswered") return row.unanswered;
    if (resultFilter === "flagged") return row.flagged;
    return true;
  });
  const statusTitle = isExam ? (attempt.passed ? t("passed") : t("failed")) : t("practiceComplete");
  const scoreTone = isExam ? (attempt.passed ? "pass" : "fail") : "practice";

  return `
    <div class="page-view result-view">
      ${pageHeader(t("resultTitle"), statusTitle, t("correctCount", { correct: attempt.correct, total: attempt.total }))}
      <section class="result-hero ${scoreTone} surface-card">
        <div class="result-orbit" style="--score:${attempt.accuracy}"><strong>${attempt.accuracy}%</strong><span>${e(t("accuracy"))}</span></div>
        <div class="result-summary">
          <span class="result-chip ${scoreTone}">${e(isExam ? (attempt.passed ? t("passedShort") : t("failedShort")) : t("practiceShort"))}</span>
          <h2>${attempt.correct}<small>/${attempt.total}</small></h2>
          <p>${e(t("correctCount", { correct: attempt.correct, total: attempt.total }))}</p>
        </div>
        <div class="result-metrics">
          <span><small>${e(t("duration"))}</small><b>${formatDuration(attempt.durationMs)}</b></span>
          <span><small>${e(t("unanswered"))}</small><b>${attempt.rows.filter((row) => row.unanswered).length}</b></span>
          <span><small>${e(t("flagged"))}</small><b>${attempt.rows.filter((row) => row.flagged).length}</b></span>
        </div>
        <div class="result-actions">
          ${wrongIds.length ? `<button class="button button-primary" data-action="practice-result-errors" data-attempt-id="${e(attempt.id)}">${e(t("practiceErrors"))}</button>` : ""}
          <button class="button button-subtle" data-action="start-exam">${e(t("newExam"))}</button>
          <a class="button button-subtle" href="${href("home")}">${e(t("backHome"))}</a>
        </div>
      </section>

      <section class="review-section">
        <div class="section-title-row"><div><span class="section-kicker">${e(t("resultTitle"))}</span><h2>${e(t("reviewTitle"))}</h2></div></div>
        <div class="segmented review-filter" role="group" aria-label="${e(t("reviewTitle"))}">
          ${[["all", t("filterAll"), attempt.rows.length], ["wrong", t("filterWrong"), attempt.rows.filter((row) => !row.correct && !row.unanswered).length], ["unanswered", t("filterUnanswered"), attempt.rows.filter((row) => row.unanswered).length], ["flagged", t("filterFlagged"), attempt.rows.filter((row) => row.flagged).length]].map(([value, label, count]) => `<button class="${resultFilter === value ? "active" : ""}" data-action="result-filter" data-value="${value}" aria-pressed="${resultFilter === value}">${e(label)} <b>${count}</b></button>`).join("")}
        </div>
        <div class="review-list">${visibleRows.map((row, index) => renderReviewRow(row, index + 1)).join("") || `<div class="empty-inline surface-card"><span>${ICONS.check}</span><p>${e(t("emptyMistakes"))}</p></div>`}</div>
      </section>
    </div>
  `;
}

function renderReviewRow(row, index) {
  const question = row.questionSnapshot ?? getQuestion(row.questionId);
  if (!question) return "";
  const selected = getChoice(question, row.choiceId);
  const correct = getChoice(question, row.correctChoiceId);
  const state = row.correct ? "correct" : row.unanswered ? "unanswered" : "wrong";
  return `
    <details class="review-item ${state} surface-card">
      <summary><span class="review-number">${index}</span><span><small>${e(tr(getTopic(question.topicId)?.name))}</small><strong>${e(tr(question.prompt))}</strong></span><span class="review-state">${row.correct ? ICONS.check : row.unanswered ? "—" : ICONS.close}</span></summary>
      <div class="review-detail">
        <div class="answer-comparison">
          <div class="${row.correct ? "correct" : "wrong"}"><small>${e(t("yourAnswer"))}</small><p>${e(selected ? tr(selected.text) : t("noAnswer"))}</p></div>
          ${!row.correct ? `<div class="correct"><small>${e(t("correctAnswer"))}</small><p>${e(tr(correct?.text))}</p></div>` : ""}
        </div>
        <p class="review-explanation"><strong>${e(t("explanation"))}</strong> ${e(tr(question.explanation))}</p>
        <a class="text-link" href="${e(question.source.url)}" target="_blank" rel="noopener noreferrer">${e(tr(question.source.section))}${ICONS.arrow}</a>
      </div>
    </details>
  `;
}

function renderProfile() {
  const state = repository.snapshot();
  const dashboard = computeDashboard();
  const recent = repository.getRecentAttempts(12);
  const days = lastDateKeys(28);

  return `
    <div class="page-view profile-view">
      ${pageHeader(t("navProfile"), t("profileTitle"), t("profileText"))}
      <section class="profile-overview">
        <div class="profile-identity surface-card"><div class="large-avatar">AS</div><div><span class="section-kicker">${e(t("learner"))}</span><h2>${e(t("heroTitle"))}</h2><p>${e(t("catalogVersion", { version: CATALOG_META.version, date: CATALOG_META.updatedAt }))}</p></div></div>
        <div class="profile-stat surface-card"><span>${ICONS.flame}</span><strong>${dashboard.streak}</strong><small>${e(t("streak"))}</small></div>
        <div class="profile-stat surface-card"><span>${ICONS.trophy}</span><strong>${dashboard.bestStreak}</strong><small>${e(t("bestStreak"))}</small></div>
      </section>

      <section class="activity-card surface-card">
        <div class="section-title-row"><div><span class="section-kicker">${e(t("todayGoal"))}</span><h2>${e(t("activityTitle"))}</h2></div><strong>${dashboard.answeredToday}/${dashboard.dailyGoal}</strong></div>
        <div class="activity-grid">${days.map((key) => {
          const count = state.activity[key]?.responses ?? 0;
          const level = count === 0 ? 0 : count < 4 ? 1 : count < 8 ? 2 : count < 12 ? 3 : 4;
          return `<span class="activity-day level-${level}" title="${e(key)}: ${count}" aria-label="${e(key)}: ${count} ${e(t("questions"))}"></span>`;
        }).join("")}</div>
      </section>

      <section class="settings-grid">
        <article class="settings-card surface-card">
          <div class="settings-heading"><span>${ICONS.settings}</span><div><span class="section-kicker">AvtoSmart</span><h2>${e(t("profileTitle"))}</h2></div></div>
          <label class="setting-row"><span><strong>${e(t("language"))}</strong><small>${e(t("tagline"))}</small></span><select data-input="language">${LANGS.map((language) => `<option value="${language.code}" ${language.code === getLang() ? "selected" : ""}>${e(language.label)}</option>`).join("")}</select></label>
          <label class="setting-row"><span><strong>${e(t("appearance"))}</strong><small>${e(state.settings.theme === "dark" ? t("dark") : t("light"))}</small></span><select data-input="theme"><option value="dark" ${state.settings.theme === "dark" ? "selected" : ""}>${e(t("dark"))}</option><option value="light" ${state.settings.theme === "light" ? "selected" : ""}>${e(t("light"))}</option></select></label>
          <label class="setting-row"><span><strong>${e(t("dailyGoalSetting"))}</strong><small>${e(t("goalProgress", { done: dashboard.answeredToday, goal: dashboard.dailyGoal }))}</small></span><select data-input="daily-goal">${[5, 10, 15, 20].map((goal) => `<option value="${goal}" ${state.settings.dailyGoal === goal ? "selected" : ""}>${goal}</option>`).join("")}</select></label>
          <label class="setting-row"><span><strong>${e(t("sound"))}</strong><small>${e(t("soundDescription"))}</small></span><input class="switch" type="checkbox" data-input="sound" ${state.settings.sound ? "checked" : ""}></label>
        </article>

        <article class="settings-card data-card surface-card">
          <div class="settings-heading"><span>${ICONS.download}</span><div><span class="section-kicker">JSON</span><h2>${e(t("exportData"))}</h2></div></div>
          <p>${e(t("profileText"))}</p>
          <button class="button button-subtle" data-action="export-data">${e(t("exportData"))}</button>
          <button class="button button-danger" data-action="request-reset">${e(t("resetData"))}</button>
        </article>
      </section>

      <section class="section-block">
        <div class="section-title-row"><h2>${e(t("recentAttempts"))}</h2></div>
        ${recent.length ? `<div class="attempt-list">${recent.map(attemptRow).join("")}</div>` : `<div class="empty-inline surface-card"><span>${ICONS.arrow}</span><p>${e(t("noAttempts"))}</p></div>`}
      </section>
    </div>
  `;
}

function lastDateKeys(total) {
  return Array.from({ length: total }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (total - index - 1));
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
}

function renderCatalogError(status) {
  return `<div class="page-view">${pageHeader("AvtoSmart", t("catalogError"), status.errors.join(" · "))}</div>`;
}

function render({ focusHeading = false } = {}) {
  stopTimer();
  applyPreferences();
  renderNav();
  renderFooter();

  const status = getCatalogStatus();
  if (!status.valid) {
    app.innerHTML = renderCatalogError(status);
    return;
  }

  currentSession = repository.getActiveSession();
  if (currentSession?.mode === SESSION_MODES.EXAM && isExpired(currentSession)) {
    submitCurrentSession(true);
    return;
  }

  const currentRoute = route();
  switch (currentRoute.name) {
    case "home": app.innerHTML = renderHome(); break;
    case "new-exam":
      startLearningSession({ mode: SESSION_MODES.EXAM, source: "exam", questionIds: getAllQuestionIds() });
      return;
    case "topics": app.innerHTML = renderTopics(); break;
    case "mistakes": app.innerHTML = renderCollection("mistakes"); break;
    case "bookmarks": app.innerHTML = renderCollection("bookmarks"); break;
    case "session": app.innerHTML = renderSession(); break;
    case "result": app.innerHTML = renderResult(currentRoute.params[0]); break;
    case "profile": app.innerHTML = renderProfile(); break;
    default: history.replaceState(null, "", href("home")); app.innerHTML = renderHome();
  }

  document.title = `${currentRoute.name === "home" ? t("heroTitle") : app.querySelector("h1")?.textContent ?? t("appName")} · AvtoSmart`;
  if (focusHeading) requestAnimationFrame(() => app.querySelector("h1")?.focus({ preventScroll: true }));
  if (currentRoute.name === "session" && currentSession?.mode === SESSION_MODES.EXAM) startTimer();
}

function startLearningSession({ mode, source, questionIds, topicId = null, count }) {
  const existing = repository.getActiveSession();
  if (existing) {
    currentSession = existing;
    toast(t("resumeTitle"));
    setHash(`session/${existing.id}`);
    return;
  }
  try {
    currentSession = createSession({ mode, source, questionIds, topicId, count });
    const result = repository.saveActiveSession(currentSession);
    if (!result.ok) throw new Error(result.error);
    setHash(`session/${currentSession.id}`);
  } catch (error) {
    console.error(error);
    toast(error.message || t("unavailable"), "error");
  }
}

function saveSession() {
  if (!currentSession) return { ok: false, error: "No active session" };
  const result = repository.saveActiveSession(currentSession);
  if (!result.ok) toast(t("storageError"), "error");
  return result;
}

function submitCurrentSession(automatic = false) {
  if (!currentSession) return;
  const attempt = gradeSession(currentSession);
  const result = repository.finishAttempt(attempt);
  if (!result.ok) {
    toast(t("storageError"), "error");
    return;
  }
  const persistedAttempt = result.attempt ?? attempt;
  currentSession = null;
  closeDialog();
  if (automatic) announce(t("timeLeft") + ": 0:00");
  setHash(`result/${persistedAttempt.id}`);
}

function handleAction(action, target) {
  switch (action) {
    case "skip-content":
      target.blur();
      app?.focus({ preventScroll: false });
      window.setTimeout(() => app?.focus({ preventScroll: false }), 50);
      break;
    case "toggle-theme": {
      const theme = repository.snapshot().settings.theme === "dark" ? "light" : "dark";
      const result = repository.updateSettings({ theme });
      result.ok ? render() : toast(t("storageError"), "error");
      break;
    }
    case "start-exam":
      startLearningSession({ mode: SESSION_MODES.EXAM, source: "exam", questionIds: getAllQuestionIds() });
      break;
    case "start-quick":
      startLearningSession({ mode: SESSION_MODES.PRACTICE, source: "quick", questionIds: getAllQuestionIds(), count: 10 });
      break;
    case "start-topic": {
      const topicId = Number(target.dataset.topicId);
      startLearningSession({ mode: SESSION_MODES.PRACTICE, source: "topic", questionIds: getQuestionIdsByTopic(topicId), topicId });
      break;
    }
    case "start-collection": {
      const kind = target.dataset.kind;
      const ids = kind === "mistakes" ? repository.getMistakeIds() : repository.getBookmarkIds();
      startLearningSession({ mode: SESSION_MODES.PRACTICE, source: kind, questionIds: ids });
      break;
    }
    case "resume-session": {
      const session = repository.getActiveSession();
      if (session) {
        currentSession = resumeSession(session);
        if (saveSession().ok) setHash(`session/${session.id}`);
      }
      break;
    }
    case "request-discard": showDiscardDialog(); break;
    case "confirm-discard": {
      const result = currentSession
        ? repository.clearActiveSession(currentSession.id)
        : repository.clearActiveSession();
      if (!result.ok) { toast(t("storageError"), "error"); break; }
      currentSession = null;
      closeDialog();
      render();
      break;
    }
    case "topic-filter": topicFilter = target.dataset.value; render(); break;
    case "toggle-flag":
      if (currentSession) {
        const previous = currentSession;
        currentSession = toggleFlag(currentSession, currentQuestionId(currentSession));
        if (saveSession().ok) render();
        else currentSession = previous;
      }
      break;
    case "toggle-bookmark": {
      const questionId = target.dataset.questionId || (currentSession && currentQuestionId(currentSession));
      if (questionId) {
        const result = repository.toggleBookmark(questionId);
        if (result.ok) { render(); toast(t(repository.isBookmarked(questionId) ? "bookmarked" : "bookmark")); }
        else toast(t("storageError"), "error");
      }
      break;
    }
    case "session-prev": navigateSession(-1); break;
    case "session-next": navigateSession(1); break;
    case "go-question":
      if (currentSession) {
        const previous = currentSession;
        currentSession = moveTo(currentSession, Number(target.dataset.index));
        if (saveSession().ok) { render(); focusQuestion(); }
        else currentSession = previous;
      }
      break;
    case "request-submit": showSubmitDialog(); break;
    case "confirm-submit": submitCurrentSession(); break;
    case "finish-practice": submitCurrentSession(); break;
    case "save-exit": {
      const previous = currentSession;
      currentSession = pauseSession(currentSession);
      if (saveSession().ok) { toast(t("sessionSaved")); setHash("home"); }
      else currentSession = previous;
      break;
    }
    case "result-filter": resultFilter = target.dataset.value; render(); break;
    case "practice-result-errors": {
      const attempt = repository.getAttempt(target.dataset.attemptId);
      const ids = attempt?.rows.filter((row) => !row.correct).map((row) => row.questionId) ?? [];
      startLearningSession({ mode: SESSION_MODES.PRACTICE, source: "result-errors", questionIds: ids });
      break;
    }
    case "export-data": exportProgress(); break;
    case "request-reset": showResetDialog(); break;
    case "confirm-reset": {
      const result = repository.resetLearning();
      if (!result.ok) { toast(t("storageError"), "error"); break; }
      currentSession = null;
      closeDialog();
      toast(t("saved"));
      setHash("home");
      break;
    }
    case "close-dialog": closeDialog(); break;
    case "install-app": installApp(); break;
    case "refresh-app": location.reload(); break;
    default: break;
  }
}

function handleAnswer(choiceId) {
  if (!currentSession) return;
  const questionId = currentQuestionId(currentSession);
  const previousSession = currentSession;
  const hadAnswer = Boolean(currentSession.answersByQuestion[questionId]);
  const next = selectAnswer(currentSession, questionId, choiceId);
  if (next === currentSession) return;
  currentSession = next;

  if (currentSession.mode === SESSION_MODES.PRACTICE && !hadAnswer) {
    const answer = currentSession.answersByQuestion[questionId];
    const correct = getSessionQuestion(currentSession, questionId)?.correctChoiceId === choiceId;
    const result = repository.commitPracticeAnswer({
      session: currentSession,
      questionId,
      correct,
      elapsedMs: answer.elapsedMs,
      timestamp: answer.selectedAt,
    });
    if (!result.ok) {
      currentSession = repository.getActiveSession();
      toast(t("storageError"), "error");
      render();
      return;
    }
    playFeedback(correct);
    announce(correct ? t("correct") : t("incorrect"));
    render();
    requestAnimationFrame(() => document.getElementById("answer-feedback")?.focus());
    return;
  }

  const saveResult = saveSession();
  if (saveResult.ok) patchStrictAnswer(choiceId);
  else {
    currentSession = previousSession;
    render();
  }
}

function patchStrictAnswer(choiceId) {
  const summary = getSessionSummary(currentSession);
  document.querySelectorAll('.choice-card[data-choice-id]').forEach((label) => {
    const selected = label.dataset.choiceId === choiceId;
    label.classList.toggle("selected", selected);
    const input = label.querySelector('input[name="answer"]');
    if (input) input.checked = selected;
  });
  const selectedLabel = document.querySelector(`.choice-card[data-choice-id="${choiceId}"]`);
  selectedLabel?.focus();
  window.setTimeout(() => {
    if (selectedLabel?.isConnected && route().name === "session") selectedLabel.focus();
  }, 50);
  const progress = document.querySelector(".session-progress-row progress");
  if (progress) progress.value = summary.answered;
  const progressStats = document.querySelector(".session-progress-row > div");
  if (progressStats) progressStats.innerHTML = `<b>${summary.answered}</b> ${e(t("answered"))}<b>${summary.flagged}</b> ${e(t("flagged"))}`;
  const navigatorCount = document.querySelector(".navigator-heading span");
  if (navigatorCount) navigatorCount.textContent = `${summary.answered}/${summary.total}`;
  document.querySelector(`.palette-item:nth-child(${currentSession.currentIndex + 1})`)?.classList.add("answered");
  const strictText = document.querySelector(".strict-note p");
  if (strictText) strictText.textContent = `${t("strictBadge")}: ${t("submitText", summary)}`;
}

function navigateSession(delta) {
  if (!currentSession) return;
  const previous = currentSession;
  currentSession = moveBy(currentSession, delta);
  if (!saveSession().ok) {
    currentSession = previous;
    return;
  }
  render();
  focusQuestion();
}

function focusQuestion() {
  requestAnimationFrame(() => document.getElementById("question-legend")?.focus?.());
}

function formatClock(seconds) {
  if (seconds === null || !Number.isFinite(seconds)) return "—";
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function startTimer() {
  updateTimer();
  timerId = window.setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
}

function updateTimer() {
  if (!currentSession) return;
  const remaining = getRemainingSeconds(currentSession);
  const element = document.getElementById("exam-timer");
  if (element) {
    element.textContent = formatClock(remaining);
    element.closest(".timer-block")?.classList.toggle("urgent", remaining <= 60);
  }
  if ([300, 60].includes(remaining) && timerMilestone !== remaining) {
    timerMilestone = remaining;
    announce(`${t("timeLeft")}: ${formatClock(remaining)}`);
  }
  if (remaining <= 0) {
    stopTimer();
    submitCurrentSession(true);
  }
}

function showDialog({ title, text, details = "", confirm, confirmAction, danger = false }) {
  if (!dialog) return;
  dialog.innerHTML = `
    <div class="dialog-card">
      <div class="dialog-icon ${danger ? "danger" : ""}" aria-hidden="true">${danger ? ICONS.mistakes : ICONS.check}</div>
      <h2 id="dialog-title">${e(title)}</h2><p>${e(text)}</p>${details}
      <div class="dialog-actions"><button class="button button-subtle" data-action="close-dialog">${e(t("cancel"))}</button><button class="button ${danger ? "button-danger" : "button-primary"}" data-action="${confirmAction}">${e(confirm)}</button></div>
    </div>`;
  dialog.showModal();
}

function showSubmitDialog() {
  if (!currentSession) return;
  const summary = getSessionSummary(currentSession);
  showDialog({
    title: t("submitTitle"),
    text: t("submitText", summary),
    details: `<div class="dialog-stats"><span><b>${summary.answered}</b>${e(t("answered"))}</span><span><b>${summary.unanswered}</b>${e(t("unanswered"))}</span><span><b>${summary.flagged}</b>${e(t("flagged"))}</span></div>`,
    confirm: t("confirmSubmit"),
    confirmAction: "confirm-submit",
  });
}

function showDiscardDialog() {
  showDialog({ title: t("discardTitle"), text: t("discardText"), confirm: t("confirmDiscard"), confirmAction: "confirm-discard", danger: true });
}

function showResetDialog() {
  showDialog({ title: t("resetTitle"), text: t("resetText"), confirm: t("resetData"), confirmAction: "confirm-reset", danger: true });
}

function closeDialog() {
  if (dialog?.open) dialog.close();
}

function exportProgress() {
  const blob = new Blob([repository.exportData()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `avtosmart-progress-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function playFeedback(correct) {
  if (!repository.snapshot().settings.sound) return;
  try {
    const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = correct ? 620 : 220;
    gain.gain.setValueAtTime(0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.12);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.12);
  } catch {
    // Sound is a progressive enhancement.
  }
}

async function installApp() {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  render();
}

function persistSetting(patch, { focusHeading = false, notify = false } = {}) {
  const result = repository.updateSettings(patch);
  if (!result.ok) {
    toast(t("storageError"), "error");
    render();
    return false;
  }
  render({ focusHeading });
  if (notify) toast(t("saved"));
  return true;
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) {
    const routeLink = event.target.closest('a[href^="#/"]');
    if (routeLink && currentSession && route().name === "session") {
      const previous = currentSession;
      currentSession = pauseSession(currentSession);
      if (!saveSession().ok) {
        currentSession = previous;
        event.preventDefault();
      }
    }
    return;
  }
  if (target.matches("a") && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0)) return;
  event.preventDefault();
  handleAction(target.dataset.action, target);
});

document.addEventListener("input", (event) => {
  if (event.target.matches('[data-input="topic-search"]')) {
    topicSearch = event.target.value;
    render();
    requestAnimationFrame(() => {
      const field = document.querySelector('[data-input="topic-search"]');
      field?.focus();
      field?.setSelectionRange(topicSearch.length, topicSearch.length);
    });
  }
});

document.addEventListener("change", (event) => {
  const input = event.target.dataset.input;
  if (input === "answer") handleAnswer(event.target.value);
  if (input === "language") persistSetting({ lang: event.target.value }, { focusHeading: true });
  if (input === "theme") persistSetting({ theme: event.target.value });
  if (input === "daily-goal") persistSetting({ dailyGoal: Number(event.target.value) }, { notify: true });
  if (input === "sound") persistSetting({ sound: event.target.checked }, { notify: true });
});

document.addEventListener("keydown", (event) => {
  if (route().name !== "session" || !currentSession || dialog?.open) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
  const questionId = currentQuestionId(currentSession);
  const order = currentSession.choiceOrders[questionId];
  if (/^[1-4]$/.test(event.key)) { event.preventDefault(); handleAnswer(order[Number(event.key) - 1]); }
  if (event.key === "ArrowLeft") { event.preventDefault(); navigateSession(-1); }
  if (event.key === "ArrowRight") { event.preventDefault(); navigateSession(1); }
  if (event.key.toLowerCase() === "f") {
    event.preventDefault();
    const previous = currentSession;
    currentSession = toggleFlag(currentSession, questionId);
    if (saveSession().ok) render();
    else currentSession = previous;
  }
  if (event.key.toLowerCase() === "b") {
    event.preventDefault();
    const result = repository.toggleBookmark(questionId);
    result.ok ? render() : toast(t("storageError"), "error");
  }
});

window.addEventListener("hashchange", () => {
  const nextRouteName = route().name;
  if (lastRouteName === "session" && nextRouteName !== "session" && currentSession) {
    const previous = currentSession;
    currentSession = pauseSession(currentSession);
    if (!saveSession().ok) {
      currentSession = previous;
      history.replaceState(null, "", href(`session/${previous.id}`));
      lastRouteName = "session";
      render({ focusHeading: true });
      return;
    }
  } else if (lastRouteName !== "session" && nextRouteName === "session" && currentSession) {
    currentSession = resumeSession(currentSession);
    saveSession();
  }
  lastRouteName = nextRouteName;
  render({ focusHeading: true });
});
window.addEventListener("online", () => {
  const banner = document.getElementById("connection-banner");
  if (banner) banner.hidden = true;
  toast(t("online"), "success");
});
window.addEventListener("offline", () => {
  const banner = document.getElementById("connection-banner");
  if (banner) { banner.textContent = t("offline"); banner.hidden = false; }
  toast(t("offline"), "warning");
});
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.getElementById("install-button")?.classList.remove("hidden");
});
window.addEventListener("avtosmart:storage-error", () => toast(t("storageError"), "error"));
window.addEventListener("beforeunload", (event) => {
  if (!repository.getActiveSession()) return;
  if (currentSession) {
    currentSession = pauseSession(currentSession);
    repository.saveActiveSession(currentSession);
  }
  event.preventDefault();
});
document.addEventListener("visibilitychange", () => {
  if (!currentSession) return;
  if (document.hidden) {
    currentSession = pauseSession(currentSession);
    saveSession();
    return;
  }
  if (route().name === "session") {
    currentSession = resumeSession(currentSession);
    saveSession();
    if (currentSession.mode === SESSION_MODES.EXAM) updateTimer();
  }
});

if (!location.hash) history.replaceState(null, "", href("home"));
applyPreferences();
if (currentSession && route().name === "session") {
  currentSession = resumeSession(currentSession);
  saveSession();
}
const initialConnectionBanner = document.getElementById("connection-banner");
if (initialConnectionBanner && !navigator.onLine) {
  initialConnectionBanner.textContent = t("offline");
  initialConnectionBanner.hidden = false;
}
render({ focusHeading: false });


const startupState = repository.snapshot();
if (repository.lastError || startupState.recovery) {
  window.setTimeout(() => toast(t("storageRecovery"), "warning"), 120);
}
if (startupState.migration?.discardedLegacyMistakes > 0 && !startupState.migration.noticeShown) {
  window.setTimeout(() => {
    toast(t("migrationNotice", { count: startupState.migration.discardedLegacyMistakes }), "warning");
    repository.acknowledgeMigrationNotice();
  }, 220);
}
