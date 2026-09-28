# AvtoSmart Professional Upgrade Plan

## Maqsad

AvtoSmart MVP'ni ishonchli imtihon simulyatori va kundalik o‘quv platformasiga aylantirish. Ilova tashqi runtime bog‘liqliklarsiz ishlaydi, ammo domen mantiqi, saqlash qatlami, accessibility va offline imkoniyatlari professional mahsulot tamoyillariga mos bo‘ladi.

## P0 — Ishonchli domen modeli

- Savollar barqaror `questionId` va `choiceId` bilan ishlaydi.
- Catalog ishga tushishda validatsiyadan o‘tadi: noyob ID, mavjud mavzu, tarjimalar, variantlar va to‘g‘ri javob tekshiriladi.
- Qat’iy imtihonda 20 ta **noyob** savol ishlatiladi; yetarli savol bo‘lmasa noto‘g‘ri test yaratilmaydi.
- Variantlar har sessiyada aralashtiriladi va aynan shu tartib resume uchun saqlanadi.

## P1 — Ikki xil aniq o‘quv siyosati

### Qat’iy imtihon

- 20 savol, 25 daqiqa, 18 ta to‘g‘ri javob mezoni.
- Javob berilganda to‘g‘ri/noto‘g‘ri ko‘rsatilmaydi.
- Oldingi/keyingi savolga o‘tish, javobni almashtirish, savolni belgilash va navigator mavjud.
- Yakunlashdan oldin javob berilmagan/belgilangan savollar bo‘yicha tasdiqlash oynasi ko‘rsatiladi.
- Timer `deadlineAt` asosida ishlaydi; sahifa yangilansa sessiya tiklanadi.

### Mashq rejimi

- Mavzu, xatolar, bookmark va tezkor mashq to‘plamlari.
- Javobdan so‘ng darhol feedback, izoh va manba bo‘limi ko‘rsatiladi.
- Har bir javob question/topic statistikasi va activity hisobiga yoziladi.

## P2 — Versiyalangan progress repository

- `avtosmart:v2` envelope: settings, active session, attempts, question stats, daily activity, mistakes va bookmarks.
- `avtosmart:v1` ma’lumotlarini xavfsiz migratsiya qilish.
- Buzilgan payloadlar chuqur validatsiya qilinadi; storage xatosi UI orqali bildiriladi.
- Attempts cheklangan hajmda saqlanadi, submit session ID bo‘yicha idempotent.

## P3 — Natija va analitika

- Har bir urinishda savol, tanlangan variant, to‘g‘ri variant, flag va vaqt saqlanadi.
- Natijada hammasi/noto‘g‘ri/javobsiz/belgilangan filtrlari.
- Topic mastery, aniqlik foizi, zaif mavzular, kunlik maqsad va streak.
- Dashboard: resume, readiness, bugungi progress, tavsiya etilgan keyingi mashq va so‘nggi urinishlar.

## P4 — UX, accessibility va PWA

- Mobile bottom navigation, desktop sidebar/header, sticky exam actions va question palette.
- Semantik `nav`, `main`, `fieldset`, `progress`, `dialog`; aniq `:focus-visible` va 44px touch target.
- Klaviatura: `1–4` javob, `←/→` navigatsiya, `F` flag, `B` bookmark.
- `uz-Latn`, `uz-Cyrl`, `ru` hujjat tili va lokal sana formatlari.
- Manifest, service worker, offline fallback, install va update holati.

## Qabul mezonlari

1. Strict examda hech qanday javob natijasi submitgacha oshkor bo‘lmaydi.
2. 20 savolning IDlari takrorlanmaydi.
3. Refreshdan keyin javoblar, flags, variant tartibi va timer tiklanadi.
4. Practice feedback darhol ishlaydi va noto‘g‘ri savol keyin to‘g‘ri bajarilganda xatolardan chiqadi.
5. Har bir yakunlangan urinish batafsil review qilinadi.
6. Kunlik progress, streak va topic mastery deterministik hisoblanadi.
7. Telefon va desktopda klaviatura hamda touch orqali barcha asosiy oqimlar ishlaydi.
8. Ilova offline qayta ochiladi va service worker katalog versiyasini sessiya o‘rtasida almashtirmaydi.
