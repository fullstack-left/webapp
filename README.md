# 🚗 AvtoSmart

O'zbekiston haydovchilarini **Yo'l harakati qoidalari (YHQ)** bo'yicha davlat imtihoniga tayyorlaydigan zamonaviy, tez va chiroyli veb-ilova.

> Modern, dependency-free web app to prepare Uzbek drivers for the official Road Traffic Rules (YHQ) exam.

## ✨ Imkoniyatlar (Features)

- **📚 Mavzular bo'yicha mashq** — savollar 35 ta mavzuga ajratilgan, faqat zaif tomonlaringizni mashq qiling.
- **📝 Imtihon simulyatsiyasi** — davlat formati bilan bir xil: **20 ta tasodifiy savol**, **25 daqiqa vaqt**, o'tish uchun **18 to'g'ri javob**.
- **❌ Xatolar ustida ishlash** — noto'g'ri javob berilgan savollar avtomatik yig'iladi va to'g'ri javob berilmaguncha ro'yxatdan chiqmaydi.
- **💡 Instant feedback** — har bir javobdan so'ng darhol to'g'ri/noto'g'ri ko'rsatiladi, tushuntirish va qonun bandiga havola bilan.
- **🌐 Ko'p tillilik** — O'zbekcha (lotin va kirill) hamda Ruscha.
- **🌙 Dark Mode** — yorug'/qorong'i rejim.
- **📊 Profil va progress** — natijalar `localStorage`da saqlanadi.
- **📱 Mobile-First** — smartfon uchun optimallashtirilgan responsiv dizayn.

## 🏗️ Arxitektura (Tech)

Hisobotdagi UX/dizayn tamoyillari asosida qurilgan, **tashqi bog'liqliklarsiz** (zero-dependency) — build yoki server talab qilmaydi, brauzerda bevosita ishlaydi.

- Vanilla **HTML5 + CSS3 + JavaScript (ES modules)**
- `localStorage` — progress va sozlamalar
- Utility-first, Tailwind-uslubidagi CSS o'zgaruvchilari va yordamchi klasslar
- Modul tuzilma: ma'lumot / mantiq / interfeys ajratilgan

## 🚀 Ishga tushirish (Run)

Hech narsa o'rnatish shart emas. `index.html` faylini brauzerda oching:

```bash
# Ixtiyoriy: lokal server orqali
python3 -m http.server 8000
# so'ng brauzerda: http://localhost:8000
```

## 📁 Tuzilma (Structure)

```
webapp/
├── index.html          # Asosiy sahifa (SPA qobig'i)
├── css/
│   └── styles.css      # Dizayn tizimi, Mobile-First, Dark Mode
├── js/
│   ├── i18n.js         # Ko'p tillilik satrlari
│   ├── app.js          # Ilova mantig'i (router, holat)
│   ├── exam.js         # Imtihon dvigateli
│   └── storage.js      # localStorage bilan ishlash
├── data/
│   ├── topics.js       # 35 ta mavzu
│   └── questions.js    # Savollar bazasi
└── README.md
```

## 📝 Litsenziya

Ta'limiy maqsadlar uchun namuna loyiha.
