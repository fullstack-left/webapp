// AvtoSmart — Ko'p tillilik (i18n)
// Tillar: uz (lotin), cy (kirill), ru (rus)

export const LANGS = [
  { code: "uz", label: "O'zbekcha" },
  { code: "cy", label: "Ўзбекча" },
  { code: "ru", label: "Русский" },
];

export const STRINGS = {
  appName:      { uz: "AvtoSmart",                 cy: "AvtoSmart",                 ru: "AvtoSmart" },
  tagline:      { uz: "YHQ imtihoniga tayyorgarlik", cy: "ЙҲҚ имтиҳонига тайёргарлик", ru: "Подготовка к экзамену ПДД" },

  navHome:      { uz: "Bosh sahifa",   cy: "Бош саҳифа",   ru: "Главная" },
  navTopics:    { uz: "Mavzular",      cy: "Мавзулар",     ru: "Темы" },
  navExam:      { uz: "Imtihon",       cy: "Имтиҳон",      ru: "Экзамен" },
  navMistakes:  { uz: "Xatolar",       cy: "Хатолар",      ru: "Ошибки" },
  navProfile:   { uz: "Profil",        cy: "Профил",       ru: "Профиль" },

  startExam:    { uz: "Imtihonni boshlash", cy: "Имтиҳонни бошлаш", ru: "Начать экзамен" },
  practiceTopics:{ uz: "Mavzularni mashq qilish", cy: "Мавзуларни машқ қилиш", ru: "Практика по темам" },
  reviewMistakes:{ uz: "Xatolar ustida ishlash", cy: "Хатолар устида ишлаш", ru: "Работа над ошибками" },

  heroTitle:    { uz: "Davlat imtihonini birinchi urinishda toping",
                  cy: "Давлат имтиҳонини биринчи уринишда топинг",
                  ru: "Сдайте госэкзамен с первой попытки" },
  heroText:     { uz: "20 ta savol · 25 daqiqa · 18 to'g'ri javob — aynan davlat formati.",
                  cy: "20 та савол · 25 дақиқа · 18 тўғри жавоб — айнан давлат формати.",
                  ru: "20 вопросов · 25 минут · 18 правильных — точный формат госэкзамена." },

  examDesc:     { uz: "20 ta tasodifiy savol, 25 daqiqa. O'tish uchun kamida 18 ta to'g'ri javob kerak.",
                  cy: "20 та тасодифий савол, 25 дақиқа. Ўтиш учун камида 18 та тўғри жавоб керак.",
                  ru: "20 случайных вопросов, 25 минут. Для сдачи нужно минимум 18 правильных." },

  question:     { uz: "Savol",   cy: "Савол",   ru: "Вопрос" },
  next:         { uz: "Keyingi", cy: "Кейинги", ru: "Далее" },
  finish:       { uz: "Yakunlash", cy: "Якунлаш", ru: "Завершить" },
  timeLeft:     { uz: "Qolgan vaqt", cy: "Қолган вақт", ru: "Осталось" },
  correctAns:   { uz: "To'g'ri!", cy: "Тўғри!", ru: "Верно!" },
  wrongAns:     { uz: "Noto'g'ri", cy: "Нотўғри", ru: "Неверно" },
  explanation:  { uz: "Izoh", cy: "Изоҳ", ru: "Пояснение" },

  resultTitle:  { uz: "Imtihon natijasi", cy: "Имтиҳон натижаси", ru: "Результат экзамена" },
  passed:       { uz: "O'tdingiz! 🎉", cy: "Ўтдингиз! 🎉", ru: "Сдано! 🎉" },
  failed:       { uz: "O'tolmadingiz", cy: "Ўтолмадингиз", ru: "Не сдано" },
  correctCount: { uz: "To'g'ri javoblar", cy: "Тўғри жавоблар", ru: "Правильных ответов" },
  retry:        { uz: "Qayta urinish", cy: "Қайта уриниш", ru: "Ещё раз" },
  toMistakes:   { uz: "Xatolarni ko'rish", cy: "Хатоларни кўриш", ru: "Смотреть ошибки" },

  noMistakes:   { uz: "Xatolar yo'q — a'lo natija! 👍", cy: "Хатолар йўқ — аъло! 👍", ru: "Ошибок нет — отлично! 👍" },
  mistakesDesc: { uz: "Bu savollarga to'g'ri javob bermaguningizcha ro'yxatda qoladi.",
                  cy: "Бу саволларга тўғри жавоб бермагунингизча рўйхатда қолади.",
                  ru: "Эти вопросы останутся, пока вы не ответите верно." },

  profileTitle: { uz: "Sizning statistikangiz", cy: "Сизнинг статистикангиз", ru: "Ваша статистика" },
  totalExams:   { uz: "Imtihonlar", cy: "Имтиҳонлар", ru: "Экзамены" },
  passRate:     { uz: "O'tish darajasi", cy: "Ўтиш даражаси", ru: "Процент сдачи" },
  bestScore:    { uz: "Eng yaxshi natija", cy: "Энг яхши натижа", ru: "Лучший результат" },
  mistakesLeft: { uz: "Yechilmagan xatolar", cy: "Ечилмаган хатолар", ru: "Нерешённые ошибки" },
  resetProgress:{ uz: "Progressni tozalash", cy: "Прогрессни тозалаш", ru: "Сбросить прогресс" },
  resetConfirm: { uz: "Barcha progress o'chirilsinmi?", cy: "Барча прогресс ўчирилсинми?", ru: "Сбросить весь прогресс?" },

  topicQuestions:{ uz: "savol", cy: "савол", ru: "вопр." },
  back:         { uz: "Orqaga", cy: "Орқага", ru: "Назад" },
  theme:        { uz: "Mavzu", cy: "Мавзу", ru: "Тема" },
};

let currentLang = "uz";

export function setLang(code) {
  if (STRINGS.appName[code] !== undefined) currentLang = code;
}
export function getLang() { return currentLang; }

// t("navHome") -> joriy tildagi satr
export function t(key) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[currentLang] ?? entry.uz;
}

// tr(obj) -> {uz,cy,ru} ob'ektidan joriy tilni oladi
export function tr(obj) {
  if (!obj) return "";
  return obj[currentLang] ?? obj.uz ?? "";
}
