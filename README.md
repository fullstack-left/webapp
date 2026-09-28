# AvtoSmart

**AvtoSmart** — O‘zbekiston yo‘l harakati qoidalarini o‘rganish, zaif mavzularni aniqlash va sinov imtihonini topshirish uchun yaratilgan install qilinadigan, offline ishlaydigan ta’lim platformasi.

> AvtoSmart davlat xizmati emas. Savollar ta’limiy maqsadda yozilgan; amaldagi qoidalarni doimo [Lex.uz rasmiy manbasi](https://lex.uz/docs/-5953883) bilan tekshiring.

## Asosiy imkoniyatlar

### Qat’iy imtihon rejimi

- 20 ta **takrorlanmaydigan** tasodifiy savol
- 25 daqiqalik, sahifa yangilanganda ham saqlanadigan `deadlineAt` timer
- 18/20 o‘tish mezoni
- Submitgacha javobning to‘g‘ri yoki noto‘g‘riligi ko‘rsatilmaydi
- Oldingi/keyingi savol, raqamli navigator, javobni almashtirish va flag
- Yakunlashdan oldin javobsiz va belgilangan savollar bo‘yicha tasdiqlash
- Sahifa yopilganda sessiyani aynan o‘sha holatda davom ettirish

### O‘quv rejimi

- 35 ta mavzu bo‘yicha mashq
- 10 savollik tezkor aralash mashq
- Xatolar va bookmarklar bo‘yicha alohida to‘plamlar
- Darhol feedback, tushuntirish va rasmiy manba bo‘limi
- To‘g‘ri javobdan keyin xatoning avtomatik yechilishi

### Progress va analitika

- Har bir savol va mavzu bo‘yicha aniqlik/o‘zlashtirish
- Kunlik noyob savollar maqsadi
- Joriy va eng yaxshi kunlik streak
- Imtihon o‘tish foizi va eng yaxshi natija
- Batafsil result review: hammasi, noto‘g‘ri, javobsiz va flagged filtrlari
- So‘nggi 28 kunlik activity heatmap
- Progressni JSON ko‘rinishida eksport qilish

### UX va platforma

- O‘zbek lotin (`uz-Latn`), o‘zbek kirill (`uz-Cyrl`) va rus (`ru`) tillari
- Mobile-first responsive UI, desktop workspace va mobil bottom navigation
- Dark/Light rejim, 44px touch target, `:focus-visible`, reduced motion
- Klaviatura: `1–4` javob, `←/→` navigatsiya, `F` flag, `B` bookmark
- Install qilinadigan PWA, versioned cache va offline fallback
- Tashqi JavaScript/CSS bog‘liqliklari yo‘q

## Kontent katalogi

`data/questions.js` quyidagilarni ta’minlaydi:

- 36 ta noyob savol va 35/35 mavzu qamrovi
- Har savolda 4 ta barqaror `choiceId`
- Javoblar muvozanati: `a=9`, `b=9`, `c=9`, `d=9`
- Uch tildagi savol, variant, izoh va manba bo‘limi
- Katalog versiyasi: `2026.09.2`

Ishga tushishda `js/catalog.js` noyob ID, mavzu, tarjima, 4 variant, to‘g‘ri javob va source metadata yaxlitligini tekshiradi. Yaroqsiz katalogda imtihon ishga tushmaydi.

## Arxitektura

```text
webapp/
├── index.html                 # Semantik PWA shell
├── offline.html               # Offline fallback
├── manifest.webmanifest       # Uzbek lotin install metadata
├── manifest.cy.webmanifest    # Uzbek kirill install metadata
├── manifest.ru.webmanifest    # Ruscha install metadata
├── sw.js                      # Versioned app-shell cache
├── css/
│   └── styles.css             # Adaptive design system
├── data/
│   ├── topics.js              # 35 ta mavzu
│   └── questions.js           # Versioned multilingual catalog
├── icons/
│   ├── icon.svg
│   └── maskable.svg
├── js/
│   ├── app.js                 # Hash router, views va event delegation
│   ├── catalog.js             # Validation va O(1) catalog indexes
│   ├── exam.js                # Pure strict/practice session engine
│   ├── storage.js             # v2 repository, migration va analytics
│   ├── i18n.js                # 3 til va locale formatlash
│   └── pwa.js                 # Service worker/update lifecycle
└── docs/
    └── UPGRADE_PLAN.md        # Arxitektura va acceptance criteria
```

### Saqlash modeli

`avtosmart:v2` versiyalangan envelope:

- `settings`
- `activeSession` (savol va variantlarning immutable snapshotlari bilan)
- `attempts` (eng so‘nggi 100 ta)
- `questionStats`
- `activity`
- `mistakes`
- `bookmarks`

Eski `avtosmart:v1` ma’lumotlari birinchi ishga tushishda avtomatik migratsiya qilinadi. Sessiya javob, variant tartibi, flag va absolyut deadline bilan har harakatdan keyin saqlanadi.

## Lokal ishga tushirish

ES modules va service worker HTTP secure context talab qiladi; `index.html`ni `file://` orqali emas, lokal server orqali oching:

```bash
cd webapp
python3 -m http.server 8000
```

Brauzerda `http://localhost:8000` manzilini oching.

## Deploy

Ilova statik hostingga tayyor: GitHub Pages, Cloudflare Pages, Netlify yoki Vercel. Hash router ishlatilgani sabab server rewrite qoidasi talab qilinmaydi.

Service worker cache nomi va katalog versiyasini release vaqtida birga yangilang:

```text
avtosmart-shell-2026.09.2
CATALOG_META.version = 2026.09.2
```

## Muhim cheklov

Bu repository’dagi savollar professional platforma arxitekturasini namoyish qiladi, lekin davlat imtihonining litsenziyalangan rasmiy biletlar bazasi emas. Production relizdan oldin barcha savollar soha mutaxassisi tomonidan amaldagi hujjat tahriri bo‘yicha tekshirilishi kerak.
