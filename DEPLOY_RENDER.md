# פריסה ל-Render (Backend + Frontend)

הפרויקט כולל `render.yaml` מוכן לפריסה.

## 1) פריסה ראשונית

1. דחוף את התיקייה ל-GitHub.
2. ב-Render בחר `New +` -> `Blueprint`.
3. חבר את הריפו ובחר את `render.yaml`.
4. בזמן יצירה הגדר ערכים חזקים לשדות:
   - `DEFAULT_ADMIN_USERNAME`
   - `DEFAULT_ADMIN_PASSWORD`

## 2) כתובות ברירת מחדל (HTTPS)

- Frontend: `https://mqg-trivia-game.onrender.com`
- Backend: `https://mqg-trivia-backend.onrender.com`

`config.js` כבר מעודכן לכתובת ה-backend הזו.

## 3) דומיין מותאם אישית + CORS

אם אתה מחבר דומיין מותאם אישית ל-Frontend (למשל `https://trivia.yourdomain.com`):

1. ב-Render -> שירות `mqg-trivia-game` -> `Custom Domains` הוסף את הדומיין.
2. בשירות `mqg-trivia-backend` עדכן `CORS_ORIGIN` לערך המדויק:
   - `https://trivia.yourdomain.com`
   - ואם צריך גם כתובת נוספת, כתוב פסיק בין כתובות.
3. בצע redeploy לשירות backend.

## 4) התאמת publicWriteKey

הערך צריך להיות זהה בשני המקומות:

- Backend env: `PUBLIC_WRITE_KEY`
- Frontend file: `config.js` -> `publicWriteKey`

## 5) בדיקת תקינות מהירה

1. פתח את המשחק בכתובת הציבורית.
2. התחבר כמנהל.
3. צור מנהל חדש.
4. עדכן סיסמה דרך `עדכן את הסיסמה שלי`.
5. בצע משחק קצר ובדוק שהתוצאה נשמרת.
