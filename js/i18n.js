// AvtoSmart — UI translations and locale-aware formatting.
export const LANGS = [
  { code: "uz", tag: "uz-Latn", label: "O‘zbekcha" },
  { code: "cy", tag: "uz-Cyrl", label: "Ўзбекча" },
  { code: "ru", tag: "ru", label: "Русский" },
];

const S = {
  appName: { uz: "AvtoSmart", cy: "AvtoSmart", ru: "AvtoSmart" },
  tagline: { uz: "Yo‘l qoidalarini aqlli o‘rganing", cy: "Йўл қоидаларини ақлли ўрганинг", ru: "Изучайте ПДД с умом" },
  skip: { uz: "Asosiy kontentga o‘tish", cy: "Асосий контентга ўтиш", ru: "Перейти к основному содержанию" },
  navHome: { uz: "Bosh sahifa", cy: "Бош саҳифа", ru: "Главная" },
  navTopics: { uz: "Mavzular", cy: "Мавзулар", ru: "Темы" },
  navExam: { uz: "Imtihon", cy: "Имтиҳон", ru: "Экзамен" },
  navMistakes: { uz: "Xatolar", cy: "Хатолар", ru: "Ошибки" },
  navBookmarks: { uz: "Saqlangan", cy: "Сақланган", ru: "Закладки" },
  navProfile: { uz: "Profil", cy: "Профил", ru: "Профиль" },
  greeting: { uz: "Assalomu alaykum", cy: "Ассалому алайкум", ru: "Добро пожаловать" },
  heroTitle: { uz: "Imtihonga ishonch bilan tayyorlaning", cy: "Имтиҳонга ишонч билан тайёрланинг", ru: "Готовьтесь к экзамену уверенно" },
  heroText: { uz: "Bilimingizni aniqlang, zaif mavzularni mustahkamlang va haqiqiy formatda o‘zingizni sinang.", cy: "Билимингизни аниқланг, заиф мавзуларни мустаҳкамланг ва ҳақиқий форматда ўзингизни синанг.", ru: "Определяйте пробелы, укрепляйте слабые темы и проверяйте себя в реальном формате." },
  startExam: { uz: "Sinov imtihonini boshlash", cy: "Синов имтиҳонини бошлаш", ru: "Начать пробный экзамен" },
  examMeta: { uz: "20 savol · 25 daqiqa · 18/20 o‘tish", cy: "20 савол · 25 дақиқа · 18/20 ўтиш", ru: "20 вопросов · 25 минут · проходной 18/20" },
  quickPractice: { uz: "Tezkor mashq", cy: "Тезкор машқ", ru: "Быстрая практика" },
  quickPracticeText: { uz: "10 ta aralash savol bilan bilimni qizdiring", cy: "10 та аралаш савол билан билимни қиздиринг", ru: "Разминка из 10 смешанных вопросов" },
  resumeTitle: { uz: "Davom etilmagan sessiya", cy: "Давом этилмаган сессия", ru: "Незавершённая сессия" },
  resumeText: { uz: "{answered}/{total} savol javoblangan. Barcha javoblaringiz saqlandi.", cy: "{answered}/{total} савол жавобланган. Барча жавобларингиз сақланди.", ru: "Отвечено {answered} из {total}. Все ответы сохранены." },
  resume: { uz: "Davom ettirish", cy: "Давом эттириш", ru: "Продолжить" },
  discard: { uz: "Sessiyani bekor qilish", cy: "Сессияни бекор қилиш", ru: "Удалить сессию" },
  todayGoal: { uz: "Bugungi maqsad", cy: "Бугунги мақсад", ru: "Цель на сегодня" },
  goalProgress: { uz: "{done} / {goal} noyob savol", cy: "{done} / {goal} ноёб савол", ru: "{done} / {goal} уникальных вопросов" },
  streak: { uz: "Kunlik seriya", cy: "Кунлик серия", ru: "Серия дней" },
  day: { uz: "kun", cy: "кун", ru: "дн." },
  accuracy: { uz: "Umumiy aniqlik", cy: "Умумий аниқлик", ru: "Общая точность" },
  passRate: { uz: "Imtihon o‘tish", cy: "Имтиҳон ўтиш", ru: "Сдача экзаменов" },
  bestScore: { uz: "Eng yaxshi natija", cy: "Энг яхши натижа", ru: "Лучший результат" },
  unresolved: { uz: "Ishlanadigan xatolar", cy: "Ишланадиган хатолар", ru: "Ошибки для работы" },
  weakTopics: { uz: "E’tibor talab qiladigan mavzular", cy: "Эътибор талаб қиладиган мавзулар", ru: "Темы, требующие внимания" },
  allTopicsStrong: { uz: "Mashq qilganingizdan keyin zaif mavzular shu yerda ko‘rinadi.", cy: "Машқ қилганингиздан кейин заиф мавзулар шу ерда кўринади.", ru: "После практики здесь появятся темы, требующие внимания." },
  recentAttempts: { uz: "So‘nggi urinishlar", cy: "Сўнгги уринишлар", ru: "Последние попытки" },
  noAttempts: { uz: "Hali urinish yo‘q. Birinchi testni boshlang.", cy: "Ҳали уриниш йўқ. Биринчи тестни бошланг.", ru: "Попыток пока нет. Начните первый тест." },
  viewAll: { uz: "Barchasini ko‘rish", cy: "Барчасини кўриш", ru: "Смотреть все" },
  passedShort: { uz: "O‘tdi", cy: "Ўтди", ru: "Сдан" },
  failedShort: { uz: "O‘tmadi", cy: "Ўтмади", ru: "Не сдан" },
  practiceShort: { uz: "Mashq", cy: "Машқ", ru: "Практика" },
  topicsTitle: { uz: "Mavzular bo‘yicha tayyorlaning", cy: "Мавзулар бўйича тайёрланинг", ru: "Готовьтесь по темам" },
  topicsText: { uz: "Har bir bo‘lim bo‘yicha aniqlik va qamrovni kuzating.", cy: "Ҳар бир бўлим бўйича аниқлик ва қамровни кузатинг.", ru: "Отслеживайте точность и охват по каждому разделу." },
  searchTopics: { uz: "Mavzuni qidirish…", cy: "Мавзуни қидириш…", ru: "Найти тему…" },
  all: { uz: "Barchasi", cy: "Барчаси", ru: "Все" },
  needsWork: { uz: "Mashq kerak", cy: "Машқ керак", ru: "Нужна практика" },
  notStarted: { uz: "Boshlanmagan", cy: "Бошланмаган", ru: "Не начато" },
  questions: { uz: "savol", cy: "савол", ru: "вопросов" },
  mastery: { uz: "O‘zlashtirish", cy: "Ўзлаштириш", ru: "Освоение" },
  beginTopic: { uz: "Mashqni boshlash", cy: "Машқни бошлаш", ru: "Начать практику" },
  collectionMistakesTitle: { uz: "Xatolar ustida ishlash", cy: "Хатолар устида ишлаш", ru: "Работа над ошибками" },
  collectionMistakesText: { uz: "Noto‘g‘ri va javobsiz qolgan savollar shu yerda jamlanadi.", cy: "Нотўғри ва жавобсиз қолган саволлар шу ерда жамланади.", ru: "Здесь собраны вопросы с неверными или пропущенными ответами." },
  collectionBookmarksTitle: { uz: "Saqlangan savollar", cy: "Сақланган саволлар", ru: "Сохранённые вопросы" },
  collectionBookmarksText: { uz: "Keyin qaytish uchun belgilagan savollaringiz.", cy: "Кейин қайтиш учун белгилаган саволларингиз.", ru: "Вопросы, к которым вы хотите вернуться." },
  emptyMistakes: { uz: "Ajoyib — hozircha yechilmagan xato yo‘q!", cy: "Ажойиб — ҳозирча ечилмаган хато йўқ!", ru: "Отлично — нерешённых ошибок пока нет!" },
  emptyBookmarks: { uz: "Hali savol saqlamagansiz.", cy: "Ҳали савол сақламагансиз.", ru: "Вы пока не сохранили вопросы." },
  practiceCollection: { uz: "To‘plamni mashq qilish", cy: "Тўпламни машқ қилиш", ru: "Практиковать подборку" },
  sessionExam: { uz: "Sinov imtihoni", cy: "Синов имтиҳони", ru: "Пробный экзамен" },
  sessionPractice: { uz: "Mashq sessiyasi", cy: "Машқ сессияси", ru: "Практика" },
  strictBadge: { uz: "Qat’iy rejim", cy: "Қатъий режим", ru: "Строгий режим" },
  practiceBadge: { uz: "Darhol izoh", cy: "Дарҳол изоҳ", ru: "Мгновенное объяснение" },
  questionOf: { uz: "{current}-savol / {total}", cy: "{current}-савол / {total}", ru: "Вопрос {current} из {total}" },
  answered: { uz: "Javoblangan", cy: "Жавобланган", ru: "Отвечено" },
  unanswered: { uz: "Javobsiz", cy: "Жавобсиз", ru: "Без ответа" },
  flagged: { uz: "Belgilangan", cy: "Белгиланган", ru: "Отмечено" },
  timeLeft: { uz: "Qolgan vaqt", cy: "Қолган вақт", ru: "Осталось" },
  flag: { uz: "Keyin ko‘rish", cy: "Кейин кўриш", ru: "Отметить" },
  unflag: { uz: "Belgini olib tashlash", cy: "Белгини олиб ташлаш", ru: "Снять отметку" },
  bookmark: { uz: "Saqlash", cy: "Сақлаш", ru: "Сохранить" },
  bookmarked: { uz: "Saqlandi", cy: "Сақланди", ru: "Сохранено" },
  selectAnswer: { uz: "Javob variantini tanlang", cy: "Жавоб вариантини танланг", ru: "Выберите вариант ответа" },
  previous: { uz: "Oldingi", cy: "Олдинги", ru: "Назад" },
  next: { uz: "Keyingi", cy: "Кейинги", ru: "Далее" },
  finishPractice: { uz: "Mashqni yakunlash", cy: "Машқни якунлаш", ru: "Завершить практику" },
  reviewAndSubmit: { uz: "Tekshirish va yakunlash", cy: "Текшириш ва якунлаш", ru: "Проверить и завершить" },
  questionNavigator: { uz: "Savollar navigatori", cy: "Саволлар навигатори", ru: "Навигатор вопросов" },
  keyboardHint: { uz: "Klaviatura: 1–4 javob · ← → navigatsiya · F belgi · B saqlash", cy: "Клавиатура: 1–4 жавоб · ← → навигация · F белги · B сақлаш", ru: "Клавиатура: 1–4 ответ · ← → навигация · F отметить · B сохранить" },
  correct: { uz: "To‘g‘ri javob", cy: "Тўғри жавоб", ru: "Верный ответ" },
  incorrect: { uz: "Noto‘g‘ri javob", cy: "Нотўғри жавоб", ru: "Неверный ответ" },
  explanation: { uz: "Nega?", cy: "Нега?", ru: "Почему?" },
  source: { uz: "Rasmiy manba bo‘limi", cy: "Расмий манба бўлими", ru: "Раздел официального источника" },
  openSource: { uz: "Manbani ochish", cy: "Манбани очиш", ru: "Открыть источник" },
  submitTitle: { uz: "Imtihonni yakunlaysizmi?", cy: "Имтиҳонни якунлайсизми?", ru: "Завершить экзамен?" },
  submitText: { uz: "{answered}/{total} savol javoblangan. {unanswered} ta javobsiz, {flagged} ta belgilangan.", cy: "{answered}/{total} савол жавобланган. {unanswered} та жавобсиз, {flagged} та белгиланган.", ru: "Отвечено {answered} из {total}. Без ответа: {unanswered}, отмечено: {flagged}." },
  continueReview: { uz: "Tekshirishda davom etish", cy: "Текширишда давом этиш", ru: "Продолжить проверку" },
  confirmSubmit: { uz: "Ha, yakunlash", cy: "Ҳа, якунлаш", ru: "Да, завершить" },
  discardTitle: { uz: "Sessiya o‘chirilsinmi?", cy: "Сессия ўчирилсинми?", ru: "Удалить сессию?" },
  discardText: { uz: "Saqlangan javoblar qayta tiklanmaydi.", cy: "Сақланган жавоблар қайта тикланмайди.", ru: "Сохранённые ответы нельзя будет восстановить." },
  cancel: { uz: "Bekor qilish", cy: "Бекор қилиш", ru: "Отмена" },
  confirmDiscard: { uz: "O‘chirish", cy: "Ўчириш", ru: "Удалить" },
  resultTitle: { uz: "Natija va batafsil tahlil", cy: "Натижа ва батафсил таҳлил", ru: "Результат и подробный разбор" },
  passed: { uz: "Imtihondan o‘tdingiz", cy: "Имтиҳондан ўтдингиз", ru: "Экзамен сдан" },
  failed: { uz: "Yana biroz tayyorgarlik kerak", cy: "Яна бироз тайёргарлик керак", ru: "Нужно ещё немного подготовки" },
  practiceComplete: { uz: "Mashq yakunlandi", cy: "Машқ якунланди", ru: "Практика завершена" },
  correctCount: { uz: "{correct}/{total} to‘g‘ri", cy: "{correct}/{total} тўғри", ru: "{correct} из {total} верно" },
  duration: { uz: "Sarflangan vaqt", cy: "Сарфланган вақт", ru: "Затраченное время" },
  reviewTitle: { uz: "Savollar tahlili", cy: "Саволлар таҳлили", ru: "Разбор вопросов" },
  filterAll: { uz: "Barchasi", cy: "Барчаси", ru: "Все" },
  filterWrong: { uz: "Noto‘g‘ri", cy: "Нотўғри", ru: "Ошибки" },
  filterUnanswered: { uz: "Javobsiz", cy: "Жавобсиз", ru: "Без ответа" },
  filterFlagged: { uz: "Belgilangan", cy: "Белгиланган", ru: "Отмеченные" },
  yourAnswer: { uz: "Sizning javobingiz", cy: "Сизнинг жавобингиз", ru: "Ваш ответ" },
  noAnswer: { uz: "Javob berilmagan", cy: "Жавоб берилмаган", ru: "Нет ответа" },
  correctAnswer: { uz: "To‘g‘ri javob", cy: "Тўғри жавоб", ru: "Правильный ответ" },
  practiceErrors: { uz: "Xatolarni mashq qilish", cy: "Хатоларни машқ қилиш", ru: "Практиковать ошибки" },
  newExam: { uz: "Yangi imtihon", cy: "Янги имтиҳон", ru: "Новый экзамен" },
  backHome: { uz: "Bosh sahifaga", cy: "Бош саҳифага", ru: "На главную" },
  profileTitle: { uz: "Progress va sozlamalar", cy: "Прогресс ва созламалар", ru: "Прогресс и настройки" },
  profileText: { uz: "O‘rganish ritmingiz va ilova sozlamalarini boshqaring.", cy: "Ўрганиш ритмингиз ва илова созламаларини бошқаринг.", ru: "Управляйте ритмом обучения и настройками приложения." },
  learner: { uz: "AvtoSmart o‘quvchisi", cy: "AvtoSmart ўқувчиси", ru: "Ученик AvtoSmart" },
  soundDescription: { uz: "Javobdan keyingi qisqa ovoz", cy: "Жавобдан кейинги қисқа овоз", ru: "Короткий звук после ответа" },
  difficultyEasy: { uz: "Oson", cy: "Осон", ru: "Легко" },
  difficultyMedium: { uz: "O‘rta", cy: "Ўрта", ru: "Средне" },
  difficultyHard: { uz: "Murakkab", cy: "Мураккаб", ru: "Сложно" },
  activityTitle: { uz: "So‘nggi 28 kun", cy: "Сўнгги 28 кун", ru: "Последние 28 дней" },
  bestStreak: { uz: "Eng uzun seriya", cy: "Энг узун серия", ru: "Лучшая серия" },
  dailyGoalSetting: { uz: "Kunlik maqsad", cy: "Кунлик мақсад", ru: "Дневная цель" },
  language: { uz: "Til", cy: "Тил", ru: "Язык" },
  appearance: { uz: "Ko‘rinish", cy: "Кўриниш", ru: "Оформление" },
  dark: { uz: "Qorong‘i", cy: "Қоронғи", ru: "Тёмная" },
  light: { uz: "Yorug‘", cy: "Ёруғ", ru: "Светлая" },
  sound: { uz: "Feedback ovozi", cy: "Feedback овози", ru: "Звук ответа" },
  exportData: { uz: "Progressni yuklab olish", cy: "Прогрессни юклаб олиш", ru: "Скачать прогресс" },
  resetData: { uz: "Progressni tozalash", cy: "Прогрессни тозалаш", ru: "Сбросить прогресс" },
  resetTitle: { uz: "Barcha progress o‘chirilsinmi?", cy: "Барча прогресс ўчирилсинми?", ru: "Удалить весь прогресс?" },
  resetText: { uz: "Natijalar, statistika, xatolar va bookmarklar o‘chadi. Bu amalni qaytarib bo‘lmaydi.", cy: "Натижалар, статистика, хатолар ва bookmarkлар ўчади. Бу амални қайтариб бўлмайди.", ru: "Результаты, статистика, ошибки и закладки будут удалены без возможности восстановления." },
  saved: { uz: "Saqlandi", cy: "Сақланди", ru: "Сохранено" },
  sessionSaved: { uz: "Sessiya saqlandi — keyin davom ettirishingiz mumkin", cy: "Сессия сақланди — кейин давом эттиришингиз мумкин", ru: "Сессия сохранена — можно продолжить позже" },
  storageError: { uz: "Progressni saqlashda xato yuz berdi", cy: "Прогрессни сақлашда хато юз берди", ru: "Не удалось сохранить прогресс" },
  storageRecovery: { uz: "Buzilgan eski progress karantinga olindi. Uni eksport qilib ko‘rishingiz yoki progressni tozalashingiz mumkin.", cy: "Бузилган эски прогресс карантинга олинди. Уни экспорт қилишингиз ёки прогрессни тозалашингиз мумкин.", ru: "Повреждённый прогресс помещён в карантин. Его можно экспортировать или сбросить." },
  migrationNotice: { uz: "Eski katalogdagi {count} ta xato yangi savollarga noto‘g‘ri bog‘lanmasligi uchun xavfsiz arxivlandi.", cy: "Эски каталогдаги {count} та хато янги саволларга нотўғри боғланмаслиги учун хавфсиз архивланди.", ru: "{count} ошибок старого каталога безопасно архивированы, чтобы не связывать их с другими вопросами." },
  unavailable: { uz: "Bu to‘plamda hozircha savol yo‘q", cy: "Бу тўпламда ҳозирча савол йўқ", ru: "В этой подборке пока нет вопросов" },
  catalogError: { uz: "Savollar katalogida xato topildi", cy: "Саволлар каталогида хато топилди", ru: "Обнаружена ошибка в каталоге вопросов" },
  educational: { uz: "Ta’limiy platforma · Davlat xizmati emas", cy: "Таълимий платформа · Давлат хизмати эмас", ru: "Учебная платформа · Не государственный сервис" },
  catalogVersion: { uz: "Katalog {version} · yangilangan {date}", cy: "Каталог {version} · янгиланган {date}", ru: "Каталог {version} · обновлён {date}" },
  offline: { uz: "Offline rejim — saqlangan kontent bilan ishlayapsiz", cy: "Offline режим — сақланган контент билан ишлаяпсиз", ru: "Офлайн — используется сохранённый контент" },
  online: { uz: "Internetga ulanish tiklandi", cy: "Интернетга уланиш тикланди", ru: "Подключение восстановлено" },
  install: { uz: "Ilovani o‘rnatish", cy: "Иловани ўрнатиш", ru: "Установить приложение" },
  updateReady: { uz: "Yangi versiya tayyor", cy: "Янги версия тайёр", ru: "Доступна новая версия" },
  refresh: { uz: "Yangilash", cy: "Янгилаш", ru: "Обновить" },
};

let currentLang = "uz";

export function setLang(code) {
  if (LANGS.some((language) => language.code === code)) currentLang = code;
}

export function getLang() {
  return currentLang;
}

export function getDocumentLocale() {
  return LANGS.find((language) => language.code === currentLang)?.tag ?? "uz-Latn";
}

export function t(key, params = {}) {
  const value = S[key]?.[currentLang] ?? S[key]?.uz ?? key;
  return Object.entries(params).reduce(
    (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
    value,
  );
}

export function tr(value) {
  return value?.[currentLang] ?? value?.uz ?? "";
}

export function formatDate(timestamp, options = {}) {
  const defaults = { day: "2-digit", month: "short", year: "numeric" };
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat(getDocumentLocale(), { ...defaults, ...options }).format(date);
  } catch {
    return "—";
  }
}

export function formatDuration(milliseconds) {
  if (!Number.isFinite(milliseconds)) return "—";
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
