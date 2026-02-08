const DEFAULT_ADMIN_USERS = [];
const MIN_CONTENT_DATE = "2025-01-01";
const SEASONAL_MIN_DATE = "2025-10-01";
const QUESTION_TIMEOUT_SECONDS = 30;
const QUESTION_WARNING_AFTER_SECONDS = 15;
const MAX_POINTS_PER_QUESTION = 120;
const MIN_POINTS_PER_CORRECT = 20;
const MUSIC_DEFAULT_VOLUME = 0.12;
const QUALITY_MIN_QUESTION_LEN = 24;
const QUALITY_MIN_EXPLANATION_LEN = 42;
const LONG_TEXT_MIN_CHARS = 300;
const LONG_TEXT_PREVIEW_FACTS = 6;
const LONG_TEXT_QUESTION_STEMS = [
  "לפי הטקסט שהוזן, איזו מהטענות מופיעה בו במפורש?",
  "מה מהבאים תואם במדויק את הכתוב בטקסט?",
  "איזו קביעה מוצגת בטקסט כעובדה מרכזית?",
  "בהתאם לטקסט, מהו הניסוח הנכון?",
  "איזו אמירה נתמכת ישירות בטקסט?",
];

const STORAGE_KEYS = {
  attempts: "mqg_trivia_attempts_v3",
  activities: "mqg_trivia_activities_v3",
  drafts: "mqg_trivia_drafts_v3",
  customQuestions: "mqg_trivia_custom_questions_v3",
  disabledQuestionIds: "mqg_trivia_disabled_questions_v1",
  questionOverrides: "mqg_trivia_question_overrides_v1",
  musicSettings: "mqg_music_settings_v1",
  questionCycleUsedIds: "mqg_question_cycle_used_ids_v1",
  familyCycleUsedIds: "mqg_family_cycle_used_ids_v1",
  adminUsers: "mqg_admin_users_v1",
};
const REMOTE_SYNCABLE_KEYS = [
  STORAGE_KEYS.attempts,
  STORAGE_KEYS.activities,
  STORAGE_KEYS.drafts,
  STORAGE_KEYS.customQuestions,
  STORAGE_KEYS.disabledQuestionIds,
  STORAGE_KEYS.questionOverrides,
  STORAGE_KEYS.questionCycleUsedIds,
  STORAGE_KEYS.familyCycleUsedIds,
];
const BACKEND_DEFAULT_CONFIG = {
  enabled: false,
  baseUrl: "",
  syncIntervalMs: 15000,
  publicWriteKey: "",
  allowInsecureLocalFallback: false,
};

const CATEGORY_COLORS = {
  "מערכת המשפט ומינויים": { start: "#0B427A", end: "#072D57", code: "LAW" },
  "שוויון בנטל": { start: "#0F5F9A", end: "#11497B", code: "EQL" },
  "תקשורת ושקיפות": { start: "#0A6178", end: "#0E4658", code: "MED" },
  "כלכלה ותחרות": { start: "#B2550A", end: "#8E3E06", code: "ECO" },
  "חברות ממשלתיות": { start: "#334155", end: "#1E293B", code: "GOV" },
  "חושפי שחיתות": { start: "#9A3412", end: "#7C2D12", code: "WBL" },
  "פעילות ציבורית": { start: "#1D4E89", end: "#163A64", code: "CIV" },
};

const ALL_CATEGORIES = Object.keys(CATEGORY_COLORS);
const SOURCE_TEXT_FRAGMENT_MAX_LEN = 92;
const CATEGORY_DISTRACTOR_FALLBACKS = {
  "מערכת המשפט ומינויים": [
    "הוגשה בקשה לעדכון בית המשפט",
    "המדינה ביקשה ארכה להגשת תגובה",
    "נקבע דיון המשך בפני ההרכב",
    "התקבלה תגובה מקדמית של היועצת המשפטית",
  ],
  "שוויון בנטל": [
    "יעד גיוס מדורג ללא סנקציות",
    "יישום חלקי של מנגנון אכיפה",
    "דחיית ההכרעה לשלב חקיקה נוסף",
    "הגברת מנגנוני פיקוח ויישום",
  ],
  "תקשורת ושקיפות": [
    "צו ביניים עד לבירור מלא",
    "חובת פרסום נתונים לציבור",
    "המשך בירור סמכות הגורמים",
    "הקפאה זמנית של המהלך",
  ],
  "כלכלה ותחרות": [
    "בדיקה רגולטורית משלימה",
    "קידום תהליך תחרותי פתוח",
    "פרסום עמדת גורמי המקצוע",
    "החזרת הנושא לבחינה במשרד האוצר",
  ],
  "חברות ממשלתיות": [
    "בדיקת ניגוד עניינים במינוי",
    "השלמת הליך ועדת המינויים",
    "פרסום נימוקים להחלטה",
    "העברת הנושא לבחינת רשות החברות",
  ],
  "חושפי שחיתות": [
    "פתיחת בדיקה מינהלית",
    "הגנת ביניים מפני פגיעה תעסוקתית",
    "קביעת מנגנון פיקוח בלתי תלוי",
    "בחינת התנהלות הגורם המדווח",
  ],
  "פעילות ציבורית": [
    "פנייה רשמית לרשויות הרלוונטיות",
    "דרישה לפרסום נתונים לציבור",
    "המשך מעקב ציבורי ומשפטי",
    "קידום מהלך תיקון מוסדי",
  ],
};
// For maximum source accuracy, fill `canonicalUrl` when you have a verified direct article URL.
const SOURCE_REGISTRY_BY_QUESTION_ID = {
  b01: {
    canonicalUrl: "https://mqg.org.il/%D7%AA%D7%92%D7%95%D7%91%D7%AA-%D7%94%D7%A2%D7%95%D7%AA%D7%A8%D7%AA-%D7%9C%D7%94%D7%97%D7%9C%D7%98%D7%AA-%D7%91%D7%92%D7%A5-%D7%A0%D7%99%D7%A6%D7%97%D7%95%D7%9F-%D7%9C%D7%A9%D7%9C%D7%98%D7%95/",
    searchQuery: "תגובת העותרת להחלטת בגץ ניצחון לשלטון החוק הדחת ראש השבכ 04.08.2025",
    anchorText: "בג\"ץ עצר את ההדחה והקפיא את החלטת הממשלה",
  },
  b02: {
    canonicalUrl: "https://mqg.org.il/%D7%AA%D7%92%D7%95%D7%91%D7%AA-%D7%94%D7%A2%D7%95%D7%AA%D7%A8%D7%AA-%D7%9C%D7%94%D7%97%D7%9C%D7%98%D7%AA-%D7%91%D7%92%D7%A5-%D7%A0%D7%99%D7%A6%D7%97%D7%95%D7%9F-%D7%9C%D7%A9%D7%9C%D7%98%D7%95/",
    searchQuery: "תגובת העותרת להחלטת בגץ 15000 עותרים 04.08.2025",
    anchorText: "התנועה ייצגה למעלה מ-15,000 עותרים",
  },
  b03: {
    canonicalUrl: "https://mqg.org.il/%D7%91%D7%92%D7%A5-%D7%99%D7%A7%D7%91%D7%A2-%D7%93%D7%99%D7%95%D7%9F-%D7%91%D7%A2%D7%AA%D7%99%D7%A8%D7%AA-%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C/",
    searchQuery: "בג\"ץ יקבע דיון בעתירה נגד מינוי דוד זיני 03.10.2025",
    anchorText: "בג\"ץ יקבע דיון בעתירה עד סוף נובמבר 2025",
  },
  b04: {
    canonicalUrl: "https://mqg.org.il/%D7%91%D7%92%D7%A5-%D7%99%D7%A7%D7%91%D7%A2-%D7%93%D7%99%D7%95%D7%9F-%D7%91%D7%A2%D7%AA%D7%99%D7%A8%D7%AA-%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C/",
    searchQuery: "מינוי דוד זיני 7 ימים לפני הדיון תגובות מקדמיות",
    anchorText: "התגובות המקדמיות נדרשו 7 ימים לפני הדיון",
  },
  b05: {
    canonicalUrl: "https://mqg.org.il/7055/",
    searchQuery: "מדובר במינוי מתריס ומחוצף נעתור לבג\"ץ 22.05.2025",
    anchorText: "התנועה תעתור לבג\"ץ נגד המינוי",
  },
  b06: {
    canonicalUrl: "https://mqg.org.il/%D7%91%D7%92%D7%A5-%D7%99%D7%A7%D7%99%D7%99%D7%9D-%D7%93%D7%99%D7%95%D7%9F-%D7%93%D7%97%D7%95%D7%A3-%D7%99%D7%95%D7%9D-%D7%91%D7%B3-13-1-%D7%91%D7%A2%D7%AA%D7%99%D7%A8%D7%AA-%D7%94%D7%AA%D7%A0/",
    searchQuery: "בג\"ץ יקיים דיון דחוף בעתירת התנועה 06.01.2025 רואי כחלון",
    anchorText: "הדיון הדחוף נקבע ל-13 בינואר 2025",
  },
  b07: {
    canonicalUrl: "https://mqg.org.il/%D7%A2%D7%93%D7%9B%D7%95%D7%9F-%D7%91%D7%92%D7%A5-%D7%93%D7%97%D7%94-%D7%90%D7%AA-%D7%A2%D7%AA%D7%99%D7%A8%D7%AA-%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94/",
    searchQuery: "תגובת התנועה להחלטת בג\"ץ 18.03.2025 עתירה מוקדמת ראש השב\"כ",
    anchorText: "לא התקבלה החלטת ממשלה סופית",
  },
  b08: {
    canonicalUrl: "https://mqg.org.il/%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%91%D7%92%D7%A5-%D7%94%D7%A7%D7%A4%D7%99%D7%90-%D7%90%D7%AA-%D7%A1%D7%92%D7%99/",
    searchQuery: "בג\"ץ הקפיא את סגירת גלי צה\"ל 28.12.2025",
    anchorText: "בג\"ץ הקפיא את החלטת הממשלה על סגירת גל\"צ",
  },
  b09: {
    canonicalUrl: "https://mqg.org.il/%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%91%D7%92%D7%A5-%D7%94%D7%A7%D7%A4%D7%99%D7%90-%D7%90%D7%AA-%D7%A1%D7%92%D7%99/",
    searchQuery: "בג\"ץ הקפיא את סגירת גל\"צ ניצחון לחופש הביטוי ולעצמאות התקשורת",
    anchorText: "ניצחון חשוב לחופש הביטוי ולעצמאות התקשורת",
  },
  b10: {
    canonicalUrl: "https://mqg.org.il/%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%94%D7%97%D7%9C%D7%98%D7%AA-%D7%91%D7%92%D7%A5-%D7%9C%D7%94%D7%A7%D7%A4%D7%99/",
    searchQuery: "צו על תנאי וצו ביניים חקירת מבקר המדינה 31.12.2025",
    anchorText: "צו על תנאי וצו ביניים שהקפיאו את החקירה",
  },
  b11: {
    canonicalUrl: "https://mqg.org.il/%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%94%D7%97%D7%9C%D7%98%D7%AA-%D7%91%D7%92%D7%A5-%D7%9C%D7%94%D7%A7%D7%A4%D7%99/",
    searchQuery: "ועדת חקירה ממלכתית ולא הליך חלופי 7 באוקטובר",
    anchorText: "יש צורך בוועדת חקירה ממלכתית",
  },
  b12: {
    canonicalUrl: "https://mqg.org.il/%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%91%D7%AA%D7%92%D7%95%D7%91%D7%94-%D7%9C%D7%A4%D7%A1%D7%99%D7%A7%D7%AA-%D7%91%D7%92/",
    searchQuery: "תגובת התנועה לפסיקת בג\"ץ בנושא הגיוס 04.01.2026 12000",
    anchorText: "התנועה דרשה לגייס 12,000 לוחמים",
  },
  b13: {
    canonicalUrl: "https://mqg.org.il/%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%91%D7%AA%D7%92%D7%95%D7%91%D7%94-%D7%9C%D7%A4%D7%A1%D7%99%D7%A7%D7%AA-%D7%91%D7%92/",
    searchQuery: "פסיקת בג\"ץ בנושא הגיוס אכיפה פלילית וכלכלית 04.01.2026",
    anchorText: "נדרשה אכיפה פלילית וכלכלית",
  },
  b14: {
    canonicalUrl: "https://mqg.org.il/%D7%95%D7%A2%D7%93%D7%AA-%D7%93%D7%95%D7%AA%D7%9F-%D7%A4%D7%A1%D7%9C%D7%94-%D7%90%D7%AA-%D7%9E%D7%99%D7%A0%D7%95%D7%99%D7%95-%D7%A9%D7%9C-%D7%AA%D7%9E%D7%99%D7%A8-%D7%A4%D7%A8%D7%A5-%D7%9C%D7%9E%D7%A9/",
    searchQuery: "ועדת דותן פסלה את מינוי תמיר פרץ שלוש פניות 15.01.2026",
    anchorText: "הפסילה באה בעקבות שלוש פניות",
  },
  b15: {
    canonicalUrl: "https://mqg.org.il/%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%93%D7%95%D7%A8%D7%A9%D7%AA-%D7%9E%D7%A8%D7%90%D7%A9-%D7%94%D7%9E%D7%9E%D7%A9%D7%9C-2/",
    searchQuery: "דרישה לבטל את מינוי נ לסגן ראש השב\"כ 18.01.2026",
    anchorText: "לבטל את המינוי בשל אי תקינות ההליך וחשש לניגוד עניינים",
  },
  b16: {
    canonicalUrl: "https://mqg.org.il/%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%91%D7%AA%D7%92%D7%95%D7%91%D7%94-%D7%9C%D7%97%D7%95%D7%95%D7%AA-%D7%94%D7%93%D7%A2/",
    searchQuery: "תגובה לחוות דעת היועמ\"שית 25.01.2026 שינוי תקנון עבודת הממשלה",
    anchorText: "להחלטות ללא בחינה משפטית מספקת",
  },
  b17: {
    searchQuery: "פנייה לרה\"מ ולשר אמסלם רשות החברות הממשלתיות 05.02.2026",
    anchorText: "הפנייה הופנתה לרה\"מ ולשר דודי אמסלם",
  },
  b18: {
    canonicalUrl: "https://mqg.org.il/%D7%A7%D7%A8%D7%90%D7%95-%D7%90%D7%AA-%D7%AA%D7%92%D7%95%D7%91%D7%AA-%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%A2%D7%9C-%D7%94/",
    searchQuery: "תגובה להודעת לשכת רה\"מ בנושא מינוי ראש השב\"כ 12.06.2025",
    anchorText: "בג\"ץ כבר פסק לראש הממשלה ניגוד עניינים",
  },
  b19: {
    canonicalUrl: "https://mqg.org.il/%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%A4%D7%95%D7%A0%D7%94-%D7%A0%D7%92%D7%93-%D7%94%D7%9B%D7%95%D7%95%D7%A0%D7%94-%D7%9C/",
    searchQuery: "התראה בנושא תוכנית הגבלת טיסות יציאה 18.06.2025 סעיף 6",
    anchorText: "הזכות לצאת מישראל המעוגנת בסעיף 6",
  },
  b20: {
    canonicalUrl: "https://mqg.org.il/%D7%94%D7%AA%D7%A0%D7%95%D7%A2%D7%94-%D7%9C%D7%90%D7%99%D7%9B%D7%95%D7%AA-%D7%94%D7%A9%D7%9C%D7%98%D7%95%D7%9F-%D7%A2%D7%9C-%D7%93%D7%91%D7%A8%D7%99-%D7%A9%D7%A8-%D7%94%D7%91%D7%99%D7%98%D7%97%D7%95/",
    searchQuery: "תגובה לדברי שר הביטחון בנושא שוויון בנטל 15.03.2025",
    anchorText: "לא התקיימה אכיפה רצינית לאורך השנים",
  },
};
const EDUCATIONAL_KEYWORDS = [
  "תוצאה",
  "השפעה",
  "משמעות",
  "הישג",
  "ביקורת",
  "דרישה",
  "ציבור",
  "שלטון",
  "אכיפה",
  "אחריות",
  "שקיפות",
  "יישום",
  "פעולה",
  "מהלך",
];
const LOW_QUALITY_DISTRACTOR_PATTERNS = [
  /משאל\s*עם/i,
  /יועץ\s*חינוכי/i,
  /ועדת\s*הבחירות/i,
  /בית\s*דין\s*צבאי/i,
];
const OFFICIAL_BANNER_IMAGES = [
  "https://mqg.org.il/wp-content/uploads/old/2015/10/rsz_mg_8514.jpg",
  "https://mqg.org.il/wp-content/uploads/old/2015/01/New-Rights-with-Nitzan.jpg",
  "https://mqg.org.il/wp-content/uploads/2017/03/Training-session-for-activists.jpg",
  "https://mqg.org.il/wp-content/uploads/2016/02/cityoflaw.jpg",
  "https://mqg.org.il/wp-content/uploads/2017/11/36906678_2090317451211576_7722012771540928512_o.jpg",
];
const HE_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

const QUESTION_VARIANT_PREFIXES = [
  "לפי פעילות התנועה,",
  "בהתאם לעמדת התנועה,",
  "לאור ההתערבות של התנועה,",
  "בהמשך לעתירה או לפנייה הציבורית,",
  "במבט מעשי על האירוע,",
  "בהיבט של שמירה על מנהל תקין,",
  "בהקשר של שלטון החוק,",
  "בבחינה אזרחית של המקרה,",
  "לפי המסר המרכזי של התנועה,",
  "בהתאם לעקרונות שהתנועה קידמה,",
  "במיקוד על התוצאה לציבור,",
  "בהמשך למהלך שהובילה התנועה,",
  "בפרשנות פשוטה לציבור הרחב,",
  "מתוך היעד שהתנועה הגדירה,",
  "בהיבט של אחריות שלטונית,",
  "בהתאם לפעולה שנדרשה מהרשויות,",
  "בקריאה מעשית של המהלך,",
  "לפי הקו הציבורי שהתנועה הציגה,",
  "בהמשך לפעילות האכיפה והפיקוח,",
  "בהתאם להישג שהתנועה ביקשה לקבע,",
  "במיקוד על היישום בפועל,",
  "בהסתכלות על טובת הציבור,",
  "בהמשך למסר נגד שחיתות שלטונית,",
  "בהתאם לפעילות הנוכחית של התנועה,",
];

const BASE_QUESTIONS = [
  {
    id: "b01",
    category: "מערכת המשפט ומינויים",
    kind: "success",
    date: "2025-08-04",
    learn:
      "בהודעת התנועה מ-04.08.2025 הודגש שבית המשפט עצר מהלך שלטענתם היה בלתי חוקי.",
    question:
      "לפי הודעת התנועה, מה הייתה התוצאה המרכזית בהחלטת בג\"ץ בעניין הדחת ראש השב\"כ?",
    options: [
      "בג\"ץ אישר את ההדחה המיידית",
      "בג\"ץ עצר את ההדחה והקפיא את החלטת הממשלה",
      "בג\"ץ קבע שהממשלה חייבת להשלים הליך תקין לפני כל החלטה",
      "בג\"ץ קבע שהנושא אינו שפיט ולכן לא התערב",
    ],
    answer: 1,
    explanation:
      "לפי הודעת התנועה, בג\"ץ עצר את ההדחה הבלתי חוקית והקפיא את החלטת הממשלה.",
    sources: [
      {
        label: "תגובת העותרת להחלטת בג\"ץ (04.08.2025)",
        url: "https://mqg.org.il/%d7%aa%d7%92%d7%95%d7%91%d7%aa-%d7%94%d7%a2%d7%95%d7%aa%d7%a8%d7%aa-%d7%9c%d7%94%d7%97%d7%9c%d7%98%d7%aa-%d7%91%d7%92%d7%a5-%d7%a0%d7%99%d7%a6%d7%97%d7%95%d7%9f-%d7%9c%d7%a9%d7%9c/",
      },
    ],
  },
  {
    id: "b02",
    category: "פעילות ציבורית",
    kind: "activity",
    date: "2025-08-04",
    learn:
      "התנועה הדגישה שהעתירה נשענה גם על היקף ציבורי רחב.",
    question:
      "כמה עותרים ייצגה התנועה בעתירה, לפי ההודעה מ-04.08.2025?",
    options: ["כ-1,500", "כ-5,000", "מעל 15,000", "מעל 150,000"],
    answer: 2,
    explanation:
      "בהודעה נכתב כי התנועה ייצגה למעלה מ-15,000 עותרים.",
    sources: [
      {
        label: "תגובת העותרת להחלטת בג\"ץ (04.08.2025)",
        url: "https://mqg.org.il/%d7%aa%d7%92%d7%95%d7%91%d7%aa-%d7%94%d7%a2%d7%95%d7%aa%d7%a8%d7%aa-%d7%9c%d7%94%d7%97%d7%9c%d7%98%d7%aa-%d7%91%d7%92%d7%a5-%d7%a0%d7%99%d7%a6%d7%97%d7%95%d7%9f-%d7%9c%d7%a9%d7%9c/",
      },
    ],
  },
  {
    id: "b03",
    category: "מערכת המשפט ומינויים",
    kind: "activity",
    date: "2025-10-03",
    learn:
      "עתירת התנועה נגד מינוי דוד זיני קיבלה מסלול דיון מהיר יחסית בבג\"ץ.",
    question:
      "מה נקבע לגבי מועד הדיון בעתירה נגד מינוי דוד זיני?",
    options: [
      "הדיון נקבע עד סוף נובמבר 2025",
      "הדיון נקבע לאפריל 2026",
      "העתירה נמחקה ללא דיון",
      "הדיון עוכב עד להשלמת חוות דעת משלימה של המדינה",
    ],
    answer: 0,
    explanation:
      "בהודעה צוין שבג\"ץ יקבע דיון בעתירה עד סוף נובמבר 2025.",
    sources: [
      {
        label: "בג\"ץ יקבע דיון בעתירה נגד מינוי דוד זיני (03.10.2025)",
        url: "https://mqg.org.il/%d7%91%d7%92%d7%a5-%d7%99%d7%a7%d7%91%d7%a2-%d7%93%d7%99%d7%95%d7%9f-%d7%91%d7%a2%d7%aa%d7%99%d7%a8%d7%aa-%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94/",
      },
    ],
  },
  {
    id: "b04",
    category: "מערכת המשפט ומינויים",
    kind: "activity",
    date: "2025-10-03",
    learn:
      "בהליך זה בג\"ץ חייב גם לוח זמנים להגשת תגובות מקדמיות של המדינה.",
    question:
      "כמה זמן לפני הדיון נדרשה המדינה להגיש תגובות מקדמיות בעתירת זיני?",
    options: [
      "48 שעות לפני הדיון",
      "3 ימים לפני הדיון",
      "7 ימים לפני הדיון",
      "30 ימים לפני הדיון",
    ],
    answer: 2,
    explanation:
      "לפי ההודעה, התגובות המקדמיות נדרשו 7 ימים לפני הדיון.",
    sources: [
      {
        label: "בג\"ץ יקבע דיון בעתירה נגד מינוי דוד זיני (03.10.2025)",
        url: "https://mqg.org.il/%d7%91%d7%92%d7%a5-%d7%99%d7%a7%d7%91%d7%a2-%d7%93%d7%99%d7%95%d7%9f-%d7%91%d7%a2%d7%aa%d7%99%d7%a8%d7%aa-%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94/",
      },
    ],
  },
  {
    id: "b05",
    category: "מערכת המשפט ומינויים",
    kind: "activity",
    date: "2025-05-22",
    learn:
      "בעקבות הודעה על מינוי דוד זיני, התנועה הודיעה על צעד משפטי מיידי.",
    question: "איזה צעד הודיעה התנועה שתנקוט בעקבות מינוי דוד זיני?",
    options: [
      "הקמת ועדת בדיקה פנימית",
      "עתירה לבג\"ץ",
      "פנייה ליועצת המשפטית לממשלה ללא הליך שיפוטי",
      "פנייה לוועדת המינויים בלבד ללא עתירה",
    ],
    answer: 1,
    explanation:
      "בכותרת ההודעה נכתב במפורש שהתנועה תעתור לבג\"ץ נגד המינוי.",
    sources: [
      {
        label: "מדובר במינוי מתריס ומחוצף - נעתור לבג\"ץ (22.05.2025)",
        url: "https://mqg.org.il/%d7%93%d7%a8-%d7%90%d7%9c%d7%99%d7%a2%d7%93-%d7%a9%d7%a8%d7%92%d7%90-%d7%9e%d7%93%d7%95%d7%91%d7%a8-%d7%91%d7%9e%d7%99%d7%a0%d7%95%d7%99-%d7%9e%d7%aa%d7%a8%d7%99%d7%a1-%d7%95%d7%9e%d7%97%d7%95/",
      },
    ],
  },
  {
    id: "b06",
    category: "מערכת המשפט ומינויים",
    kind: "activity",
    date: "2025-01-06",
    learn:
      "בעתירת התנועה נגד מינוי רואי כחלון נקבע דיון דחוף כבר בתחילת ינואר.",
    question:
      "לאיזה תאריך נקבע הדיון הדחוף בבג\"ץ בעתירה נגד מינוי רואי כחלון?",
    options: ["13.01.2025", "26.01.2025", "13.02.2025", "01.03.2025"],
    answer: 0,
    explanation:
      "לפי ההודעה, הדיון הדחוף נקבע ל-13 בינואר 2025.",
    sources: [
      {
        label: "בג\"ץ יקיים דיון דחוף בעתירת התנועה (06.01.2025)",
        url: "https://mqg.org.il/%d7%91%d7%92%d7%a5-%d7%99%d7%a7%d7%99%d7%99%d7%9d-%d7%93%d7%99%d7%95%d7%9f-%d7%93%d7%97%d7%95%d7%a3-%d7%91%d7%a2%d7%aa%d7%99%d7%a8%d7%aa-%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b/",
      },
    ],
  },
  {
    id: "b07",
    category: "מערכת המשפט ומינויים",
    kind: "activity",
    date: "2025-03-18",
    learn:
      "העתירה בנושא ראש השב\"כ נדחתה אז כמוקדמת, אבל התנועה הדגישה שהסוגיה לא הסתיימה.",
    question:
      "מה הייתה הסיבה לדחיית העתירה כמוקדמת בהחלטת בג\"ץ מ-18.03.2025?",
    options: [
      "לא הייתה לתנועה זכות עמידה",
      "המדינה כבר יישמה את הסעדים",
      "הממשלה טרם קיבלה החלטה סופית",
      "בג\"ץ הפנה את הנושא לבחינה מקדמית בממשלה",
    ],
    answer: 2,
    explanation:
      "בהודעה צוין שהעתירה נדחתה כמוקדמת משום שבאותו שלב לא התקבלה החלטת ממשלה סופית.",
    sources: [
      {
        label: "תגובת התנועה להחלטת בג\"ץ (18.03.2025)",
        url: "https://mqg.org.il/%d7%aa%d7%92%d7%95%d7%91%d7%aa-%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%9c%d7%94%d7%97%d7%9c%d7%98%d7%aa-%d7%91%d7%92/",
      },
    ],
  },
  {
    id: "b08",
    category: "תקשורת ושקיפות",
    kind: "success",
    date: "2025-12-28",
    learn:
      "התנועה הובילה עתירה בסוגיית סגירת גל\"צ, וביקשה בלימת צעד מיידי.",
    question: "מה הייתה תוצאת הביניים המרכזית בעתירה בעניין גל\"צ?",
    options: [
      "בג\"ץ הקפיא את החלטת הסגירה",
      "בג\"ץ אישר את הסגירה המיידית",
      "התיק הועבר לבית משפט מחוזי",
      "העתירה נמחקה בהסכמה",
    ],
    answer: 0,
    explanation:
      "בהודעת התנועה מ-28.12.2025 נכתב שבג\"ץ הקפיא את החלטת הממשלה על סגירת גל\"צ.",
    sources: [
      {
        label: "בג\"ץ הקפיא את סגירת גל\"צ (28.12.2025)",
        url: "https://mqg.org.il/%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%91%d7%92%d7%a5-%d7%94%d7%a7%d7%a4%d7%99%d7%90-%d7%90%d7%aa-%d7%a1%d7%92%d7%99/",
      },
    ],
  },
  {
    id: "b09",
    category: "תקשורת ושקיפות",
    kind: "success",
    date: "2025-12-28",
    learn:
      "התנועה תיארה את ההחלטה לא רק משפטית אלא גם ציבורית-ערכית.",
    question: "לפי הודעת התנועה, הקפאת סגירת גל\"צ הוגדרה כניצחון עבור מה?",
    options: [
      "חופש הביטוי ועצמאות התקשורת",
      "חיזוק רציפות השידור המבצעי בלבד",
      "העברת ניהול התחנה למודל ממשלתי מרוכז",
      "דחיית הדיון הציבורי בסוגיית עצמאות התקשורת",
    ],
    answer: 0,
    explanation:
      "בהודעת התנועה נכתב שמדובר בניצחון חשוב לחופש הביטוי ולעצמאות התקשורת.",
    sources: [
      {
        label: "בג\"ץ הקפיא את סגירת גל\"צ (28.12.2025)",
        url: "https://mqg.org.il/%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%91%d7%92%d7%a5-%d7%94%d7%a7%d7%a4%d7%99%d7%90-%d7%90%d7%aa-%d7%a1%d7%92%d7%99/",
      },
    ],
  },
  {
    id: "b10",
    category: "תקשורת ושקיפות",
    kind: "success",
    date: "2025-12-31",
    learn:
      "במהלך נפרד בסוף 2025 התנועה תקפה את סמכות מבקר המדינה לחקור את אירועי 7 באוקטובר.",
    question:
      "איזו החלטה פרוצדורלית קיבל בג\"ץ בעתירה נגד חקירת מבקר המדינה בנושא מחדל 7 באוקטובר?",
    options: [
      "צו על תנאי וצו ביניים שהקפיאו את עבודת המבקר בנושא",
      "דחיית העתירה על הסף",
      "הפניית הסוגיה לבחינת היועצת המשפטית לממשלה בלבד",
      "החלטה שאין סמכות שיפוטית לבג\"ץ",
    ],
    answer: 0,
    explanation:
      "לפי הודעת התנועה, בג\"ץ הוציא צו על תנאי וצו ביניים שהקפיאו את החקירה של המבקר בנושא זה.",
    sources: [
      {
        label: "צו על תנאי וצו ביניים בנושא חקירת המבקר (31.12.2025)",
        url: "https://mqg.org.il/%d7%91%d7%92%d7%a5-%d7%94%d7%95%d7%a8%d7%94-%d7%9c%d7%94%d7%95%d7%a6%d7%99%d7%90-%d7%a6%d7%95-%d7%a2%d7%9c-%d7%aa%d7%a0%d7%90%d7%99-%d7%95%d7%a6%d7%95-%d7%91%d7%99%d7%a0%d7%99%d7%99%d7%9d-%d7%94%d7%9e/",
      },
    ],
  },
  {
    id: "b11",
    category: "תקשורת ושקיפות",
    kind: "activity",
    date: "2025-12-31",
    learn:
      "בעתירה הודגש ההבדל בין עבודת ביקורת לבין חקירה ממלכתית רחבה של כשל לאומי.",
    question:
      "מה הייתה הטענה המבנית המרכזית של התנועה ביחס לבדיקת מחדל 7 באוקטובר?",
    options: [
      "רק ועדת חקירה ממלכתית מוסמכת לבדוק את הכשלים לעומק",
      "אין צורך בבדיקה מוסדית כלשהי",
      "יש להסתפק בדוח פנימי של משרד הביטחון",
      "המבקר הוא הגוף היחיד שמוסמך לכך בחוק",
    ],
    answer: 0,
    explanation:
      "לפי ההודעה, התנועה טענה שיש צורך בוועדת חקירה ממלכתית ולא בהליך חלופי.",
    sources: [
      {
        label: "צו על תנאי וצו ביניים בנושא חקירת המבקר (31.12.2025)",
        url: "https://mqg.org.il/%d7%91%d7%92%d7%a5-%d7%94%d7%95%d7%a8%d7%94-%d7%9c%d7%94%d7%95%d7%a6%d7%99%d7%90-%d7%a6%d7%95-%d7%a2%d7%9c-%d7%aa%d7%a0%d7%90%d7%99-%d7%95%d7%a6%d7%95-%d7%91%d7%99%d7%a0%d7%99%d7%99%d7%9d-%d7%94%d7%9e/",
      },
    ],
  },
  {
    id: "b12",
    category: "שוויון בנטל",
    kind: "activity",
    date: "2026-01-04",
    learn:
      "בתגובה לפסיקת בג\"ץ בנושא הגיוס, התנועה הדגישה דרישות יישום מיידיות במספרים ברורים.",
    question: "איזה יעד גיוס הודגש בהודעת התנועה מ-04.01.2026?",
    options: [
      "יעד גיוס של 3,000 מתגייסים",
      "יעד גיוס של 6,000 מתגייסים",
      "יעד גיוס של 12,000 מתגייסים",
      "יעד גיוס של 24,000 מתגייסים",
    ],
    answer: 2,
    explanation:
      "לפי ההודעה, התנועה דרשה לגייס 12,000 לוחמים ולגנוז את מה שכונה חוק ההשתמטות.",
    sources: [
      {
        label: "תגובת התנועה לפסיקת בג\"ץ בנושא הגיוס (04.01.2026)",
        url: "https://mqg.org.il/%d7%aa%d7%92%d7%95%d7%91%d7%aa-%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%9c%d7%a4%d7%a1%d7%99%d7%a7%d7%aa-%d7%91%d7%92/",
      },
    ],
  },
  {
    id: "b13",
    category: "שוויון בנטל",
    kind: "activity",
    date: "2026-01-04",
    learn:
      "בנוסף ליעדי הגיוס, ההודעה כללה דרישה לאכיפה מעשית.",
    question:
      "איזו אכיפה דרשה התנועה בהמשך להודעתה על יישום פסיקת בג\"ץ בגיוס?",
    options: [
      "אכיפה פלילית וכלכלית",
      "אכיפה הסברתית בלבד",
      "אכיפה פנימית בצה\"ל בלבד",
      "ללא אכיפה, רק המלצות",
    ],
    answer: 0,
    explanation:
      "בהודעה נדרשה אכיפה פלילית וכלכלית כחלק מיישום שוויון בנטל.",
    sources: [
      {
        label: "תגובת התנועה לפסיקת בג\"ץ בנושא הגיוס (04.01.2026)",
        url: "https://mqg.org.il/%d7%aa%d7%92%d7%95%d7%91%d7%aa-%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%9c%d7%a4%d7%a1%d7%99%d7%a7%d7%aa-%d7%91%d7%92/",
      },
    ],
  },
  {
    id: "b14",
    category: "מערכת המשפט ומינויים",
    kind: "success",
    date: "2026-01-15",
    learn:
      "סדרת פניות של התנועה הביאה להכרעת ועדת המינויים בעניינו של תמיר פרץ.",
    question: "כמה פניות של התנועה הוזכרו כבסיס לפסילת מינוי תמיר פרץ?",
    options: ["פנייה אחת", "שתי פניות", "שלוש פניות", "חמש פניות"],
    answer: 2,
    explanation:
      "בהודעת התנועה נכתב שהפסילה באה בעקבות שלוש פניות שהוגשו על ידה.",
    sources: [
      {
        label: "ועדת דותן פסלה את מינוי תמיר פרץ (15.01.2026)",
        url: "https://mqg.org.il/%d7%95%d7%a2%d7%93%d7%aa-%d7%93%d7%95%d7%aa%d7%9f-%d7%a4%d7%a1%d7%9c%d7%94-%d7%90%d7%aa-%d7%9e%d7%99%d7%a0%d7%95%d7%99%d7%95-%d7%a9%d7%9c-%d7%aa%d7%9e%d7%99%d7%a8-%d7%a4%d7%a8%d7%a5-%d7%9c%d7%9e%d7%a9/",
      },
    ],
  },
  {
    id: "b15",
    category: "מערכת המשפט ומינויים",
    kind: "activity",
    date: "2026-01-18",
    learn:
      "בתחילת 2026 התנועה דרשה לבטל מינוי בכיר בשב\"כ בעקבות טענות להליך לא תקין.",
    question: "מה הייתה דרישת התנועה בעניין מינוי נ' לסגן ראש השב\"כ?",
    options: [
      "לאשר את המינוי בכפוף לשימוע",
      "לבטל את המינוי עקב פגמים וניגוד עניינים",
      "להעביר את המינוי לאישור הכנסת",
      "לדחות את הבדיקה בשנה",
    ],
    answer: 1,
    explanation:
      "בהודעה התנועה קראה לבטל את המינוי בשל אי תקינות ההליך וחשש לניגוד עניינים.",
    sources: [
      {
        label: "דרישה לבטל את מינוי נ' לסגן ראש השב\"כ (18.01.2026)",
        url: "https://mqg.org.il/%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%93%d7%95%d7%a8%d7%a9%d7%aa-%d7%9c%d7%91%d7%98%d7%9c-%d7%90%d7%aa-%d7%9e%d7%99/",
      },
    ],
  },
  {
    id: "b16",
    category: "מערכת המשפט ומינויים",
    kind: "activity",
    date: "2026-01-25",
    learn:
      "בתגובה לחוות דעת היועמ\"שית, התנועה טענה לניסיון לשנות את כללי עבודת הממשלה.",
    question:
      "מה הייתה טענת התנועה לגבי שינוי תקנון עבודת הממשלה, לפי ההודעה מ-25.01.2026?",
    options: [
      "להרחיב פיקוח משפטי על החלטות",
      "לאפשר קבלת החלטות ללא בחינה משפטית מספקת",
      "להעביר סמכויות ליועצים חיצוניים",
      "להגדיל את סמכויות הכנסת על הממשלה",
    ],
    answer: 1,
    explanation:
      "בהודעה נטען שהמהלך נועד לאפשר החלטות ללא בחינה משפטית מספקת ולצמצם בלמים מקצועיים.",
    sources: [
      {
        label: "תגובה לחוות דעת היועמ\"שית (25.01.2026)",
        url: "https://mqg.org.il/%d7%aa%d7%92%d7%95%d7%91%d7%aa-%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%9c%d7%97%d7%95%d7%95%d7%aa-%d7%93%d7%a2%d7%aa/",
      },
    ],
  },
  {
    id: "b17",
    category: "חברות ממשלתיות",
    kind: "activity",
    date: "2026-02-05",
    learn:
      "בפנייה לרה\"מ ולשר האחראי, התנועה התנגדה למינויי מקורבים ברשות החברות הממשלתיות.",
    question:
      "למי הופנתה הפנייה המרכזית נגד מינויי מקורבים ברשות החברות הממשלתיות?",
    options: [
      "ליועצת המשפטית לממשלה ולמבקר המדינה",
      "לראש הממשלה ולשר דודי אמסלם",
      "ליו\"ר רשות החברות ולשר המשפטים",
      "לוועדת המינויים בשירות המדינה",
    ],
    answer: 1,
    explanation:
      "לפי ההודעה מ-05.02.2026, הפנייה הופנתה לרה\"מ ולשר דודי אמסלם.",
    sources: [
      {
        label: "פנייה לרה\"מ ולשר אמסלם (05.02.2026)",
        url: "https://mqg.org.il/%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%91%d7%a4%d7%a0%d7%99%d7%99%d7%94-%d7%9c%d7%a8%d7%94%d7%9e-%d7%95%d7%9c%d7%a9/",
      },
    ],
  },
  {
    id: "b18",
    category: "מערכת המשפט ומינויים",
    kind: "activity",
    date: "2025-06-12",
    learn:
      "בתגובה להודעת לשכת רה\"מ על מינוי ראש השב\"כ, התנועה הפנתה לפסיקת בג\"ץ קודמת.",
    question:
      "מה נטען בהודעת התנועה לגבי מעורבות רה\"מ במינוי ראש השב\"כ?",
    options: [
      "הנושא נתון לשיקול דעתו של רה\"מ בכפוף לאישור ממשלה",
      "בג\"ץ כבר קבע שיש ניגוד עניינים ולכן אסור לו לעסוק בכך",
      "הנושא חייב לעבור הכרעה מוקדמת של ועדת חוץ וביטחון",
      "התנועה דרשה להמתין לבחינה משפטית משלימה לפני הכרעה",
    ],
    answer: 1,
    explanation:
      "בהודעה נאמר שבג\"ץ כבר פסק לראש הממשלה ניגוד עניינים ולכן הוא מנוע מעיסוק בנושא.",
    sources: [
      {
        label: "תגובה להודעת לשכת רה\"מ בנושא מינוי ראש השב\"כ (12.06.2025)",
        url: "https://mqg.org.il/%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%91%d7%aa%d7%92%d7%95%d7%91%d7%94-%d7%9c%d7%94%d7%95%d7%93%d7%a2%d7%aa-%d7%9c%d7%a9/",
      },
    ],
  },
  {
    id: "b19",
    category: "פעילות ציבורית",
    kind: "activity",
    date: "2025-06-18",
    learn:
      "התנועה התריעה על פגיעה בזכות יסוד בעקבות תוכנית להגבלת טיסות יציאה מישראל.",
    question:
      "איזו זכות חוקתית צוין שעלולה להיפגע בתוכנית להגבלת טיסות יציאה מהארץ?",
    options: [
      "הזכות לבחור ולהיבחר",
      "הזכות לחופש העיסוק",
      "הזכות לצאת מישראל",
      "הזכות להתאגד",
    ],
    answer: 2,
    explanation:
      "בהודעת התנועה צוין שהתוכנית עלולה להפר את הזכות לצאת מישראל המעוגנת בסעיף 6 לחוק יסוד: כבוד האדם וחירותו.",
    sources: [
      {
        label: "התראה בנושא תוכנית הגבלת טיסות יציאה (18.06.2025)",
        url: "https://mqg.org.il/%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%9e%d7%aa%d7%a8%d7%99%d7%a2%d7%94-%d7%94%d7%aa%d7%95%d7%9b%d7%a0%d7%99%d7%aa-%d7%9c/",
      },
    ],
  },
  {
    id: "b20",
    category: "שוויון בנטל",
    kind: "activity",
    date: "2025-03-15",
    learn:
      "בתגובה לדברי שר הביטחון, התנועה טענה שהמדינה לא מיישמת אכיפה אפקטיבית לאורך זמן.",
    question:
      "מה הייתה הביקורת המרכזית של התנועה בעניין השוויון בנטל בתגובה מ-15.03.2025?",
    options: [
      "קיימת אכיפה מלאה וסנקציות אפקטיביות",
      "לא התקיימה אכיפה רצינית לאורך השנים והסנקציות לא יושמו",
      "האכיפה החלה רק לאחרונה ולכן מוקדם להסיק מסקנות",
      "יש להעדיף תמריצים בלבד ללא סנקציות מחייבות",
    ],
    answer: 1,
    explanation:
      "לפי הודעת התנועה, לאורך שנים לא התקיימה אכיפה רצינית של חובות הגיוס והסנקציות לא הופעלו בפועל.",
    sources: [
      {
        label: "תגובה לדברי שר הביטחון בנושא שוויון בנטל (15.03.2025)",
        url: "https://mqg.org.il/%d7%94%d7%aa%d7%a0%d7%95%d7%a2%d7%94-%d7%9c%d7%90%d7%99%d7%9b%d7%95%d7%aa-%d7%94%d7%a9%d7%9c%d7%98%d7%95%d7%9f-%d7%91%d7%aa%d7%92%d7%95%d7%91%d7%94-%d7%9c%d7%93%d7%91%d7%a8%d7%99-%d7%a9%d7%a8-3/",
      },
    ],
  },
];

const BASE_QUESTION_CONTENT_AUDIT = auditQuestionBankContent(BASE_QUESTIONS);
if (BASE_QUESTION_CONTENT_AUDIT.totalIssues > 0) {
  console.warn(
    `[MQG Quiz] נמצאו ${BASE_QUESTION_CONTENT_AUDIT.totalIssues} הערות איכות בבנק השאלות הבסיסי. מומלץ לבדוק במסך הניהול.`,
  );
}

const EXPANDED_BASE_QUESTIONS = buildExpandedQuestionBank(BASE_QUESTIONS);

const screenIds = [
  "screenLanding",
  "screenQuickSetup",
  "screenAdminLogin",
  "screenQuiz",
  "screenResult",
  "screenAdminPanel",
];

const gameState = {
  quickMode: "regular",
  playerName: "",
  questions: [],
  index: 0,
  score: 0,
  correctCount: 0,
  answerTimes: [],
  timeoutCount: 0,
  categoryStats: {},
  startAt: 0,
  questionStartedAt: 0,
  timerIntervalId: null,
  remainingSeconds: QUESTION_TIMEOUT_SECONDS,
  showLearning: true,
  locked: false,
  feedbackDeepOpen: false,
  wrong: [],
  musicStarted: false,
};

const adminState = {
  mode: "main",
  currentAdmin: null,
  longTextAnalysis: null,
  lastLongTextBatchDraftIds: [],
  questionAuditReport: null,
  syncTimerId: null,
  syncInFlight: false,
  isHydratingRemote: false,
};

const dom = {
  screenQuiz: document.getElementById("screenQuiz"),
  bgMusic: document.getElementById("bgMusic"),
  musicControls: document.getElementById("musicControls"),
  musicDownBtn: document.getElementById("musicDownBtn"),
  musicUpBtn: document.getElementById("musicUpBtn"),
  musicMuteBtn: document.getElementById("musicMuteBtn"),
  musicLevelText: document.getElementById("musicLevelText"),
  newGameAnytimeBtn: document.getElementById("newGameAnytimeBtn"),
  homeAnytimeBtn: document.getElementById("homeAnytimeBtn"),
  goQuickBtn: document.getElementById("goQuickBtn"),
  goSeasonalQuickBtn: document.getElementById("goSeasonalQuickBtn"),
  goAdminBtn: document.getElementById("goAdminBtn"),
  quickModeNote: document.getElementById("quickModeNote"),
  playerNameInput: document.getElementById("playerNameInput"),
  questionCountSelect: document.getElementById("questionCountSelect"),
  showLearningToggle: document.getElementById("showLearningToggle"),
  startQuickBtn: document.getElementById("startQuickBtn"),
  quickSetupError: document.getElementById("quickSetupError"),
  adminUsernameInput: document.getElementById("adminUsernameInput"),
  adminPasswordInput: document.getElementById("adminPasswordInput"),
  loginAdminBtn: document.getElementById("loginAdminBtn"),
  adminLoginError: document.getElementById("adminLoginError"),
  adminLogoutBtn: document.getElementById("adminLogoutBtn"),
  adminSessionInfo: document.getElementById("adminSessionInfo"),
  adminUserForm: document.getElementById("adminUserForm"),
  adminUserNewUsername: document.getElementById("adminUserNewUsername"),
  adminUserNewPassword: document.getElementById("adminUserNewPassword"),
  createAdminUserBtn: document.getElementById("createAdminUserBtn"),
  adminUserFormMsg: document.getElementById("adminUserFormMsg"),
  adminPasswordForm: document.getElementById("adminPasswordForm"),
  adminCurrentPassword: document.getElementById("adminCurrentPassword"),
  adminNewPassword: document.getElementById("adminNewPassword"),
  adminConfirmPassword: document.getElementById("adminConfirmPassword"),
  changeOwnPasswordBtn: document.getElementById("changeOwnPasswordBtn"),
  adminPasswordFormMsg: document.getElementById("adminPasswordFormMsg"),
  adminUsersList: document.getElementById("adminUsersList"),
  quizPlayerName: document.getElementById("quizPlayerName"),
  quizProgress: document.getElementById("quizProgress"),
  quizScore: document.getElementById("quizScore"),
  timerWrap: document.getElementById("timerWrap"),
  hourglassIcon: document.getElementById("hourglassIcon"),
  timerText: document.getElementById("timerText"),
  quizProgressFill: document.getElementById("quizProgressFill"),
  questionBanner: document.getElementById("questionBanner"),
  questionLearn: document.getElementById("questionLearn"),
  questionTitle: document.getElementById("questionTitle"),
  optionsWrap: document.getElementById("optionsWrap"),
  feedbackCard: document.getElementById("feedbackCard"),
  feedbackHeadline: document.getElementById("feedbackHeadline"),
  feedbackText: document.getElementById("feedbackText"),
  feedbackWrongReasons: document.getElementById("feedbackWrongReasons"),
  feedbackDeepExplainBtn: document.getElementById("feedbackDeepExplainBtn"),
  feedbackDeepReasons: document.getElementById("feedbackDeepReasons"),
  feedbackSources: document.getElementById("feedbackSources"),
  nextQuestionBtn: document.getElementById("nextQuestionBtn"),
  resultMain: document.getElementById("resultMain"),
  resultSub: document.getElementById("resultSub"),
  wrongAnswersWrap: document.getElementById("wrongAnswersWrap"),
  playAgainBtn: document.getElementById("playAgainBtn"),
  adminStats: document.getElementById("adminStats"),
  attemptsTableBody: document.getElementById("attemptsTableBody"),
  learningMetricsList: document.getElementById("learningMetricsList"),
  clearAttemptsBtn: document.getElementById("clearAttemptsBtn"),
  resetQuestionCyclesPublicBtn: document.getElementById("resetQuestionCyclesPublicBtn"),
  questionCycleResetMsg: document.getElementById("questionCycleResetMsg"),
  openQuestionBankBtn: document.getElementById("openQuestionBankBtn"),
  backToAdminMainBtn: document.getElementById("backToAdminMainBtn"),
  adminMainSections: document.getElementById("adminMainSections"),
  adminQuestionBankSection: document.getElementById("adminQuestionBankSection"),
  activityForm: document.getElementById("activityForm"),
  adminFilesInput: document.getElementById("adminFilesInput"),
  activityFormMsg: document.getElementById("activityFormMsg"),
  activitiesList: document.getElementById("activitiesList"),
  draftsList: document.getElementById("draftsList"),
  customQuestionsList: document.getElementById("customQuestionsList"),
  longTextInput: document.getElementById("longTextInput"),
  longTextFileInput: document.getElementById("longTextFileInput"),
  longTextQuestionCount: document.getElementById("longTextQuestionCount"),
  longTextCategory: document.getElementById("longTextCategory"),
  longTextKind: document.getElementById("longTextKind"),
  longTextDate: document.getElementById("longTextDate"),
  longTextSourceLabel: document.getElementById("longTextSourceLabel"),
  longTextSourceUrl: document.getElementById("longTextSourceUrl"),
  analyzeLongTextBtn: document.getElementById("analyzeLongTextBtn"),
  generateLongTextDraftsBtn: document.getElementById("generateLongTextDraftsBtn"),
  approveAllTextDraftsBtn: document.getElementById("approveAllTextDraftsBtn"),
  longTextMsg: document.getElementById("longTextMsg"),
  longTextDraftsPreview: document.getElementById("longTextDraftsPreview"),
  questionCountExact: document.getElementById("questionCountExact"),
  questionSearchInput: document.getElementById("questionSearchInput"),
  runQuestionAuditBtn: document.getElementById("runQuestionAuditBtn"),
  clearQuestionAuditBtn: document.getElementById("clearQuestionAuditBtn"),
  questionAuditStatus: document.getElementById("questionAuditStatus"),
  questionAuditResults: document.getElementById("questionAuditResults"),
  allQuestionsList: document.getElementById("allQuestionsList"),
};

const backendConfig = resolveBackendConfig();

ensureAdminUsersSeeded();
bindEvents();
setDefaultDateFields();
setQuickMode("regular");
showScreen("screenLanding");
updateTimerUI(QUESTION_TIMEOUT_SECONDS);
dom.hourglassIcon.style.animationPlayState = "paused";
initMusic();

function bindEvents() {
  dom.musicDownBtn.addEventListener("click", () => {
    updateMusicVolume((dom.bgMusic.volume || MUSIC_DEFAULT_VOLUME) - 0.06);
    ensureMusicPlayback();
  });
  dom.musicUpBtn.addEventListener("click", () => {
    updateMusicVolume((dom.bgMusic.volume || MUSIC_DEFAULT_VOLUME) + 0.06);
    ensureMusicPlayback();
  });
  dom.musicMuteBtn.addEventListener("click", () => {
    dom.bgMusic.muted = !dom.bgMusic.muted;
    saveMusicSettings();
    renderMusicUi();
    ensureMusicPlayback();
  });

  dom.newGameAnytimeBtn.addEventListener("click", () => {
    resetAndGoToNewGame();
    ensureMusicPlayback();
  });

  dom.homeAnytimeBtn.addEventListener("click", () => {
    stopQuestionTimer();
    showScreen("screenLanding");
    ensureMusicPlayback();
  });

  dom.goQuickBtn.addEventListener("click", () => {
    hideMessage(dom.quickSetupError);
    setQuickMode("regular");
    hideMessage(dom.questionCycleResetMsg);
    showScreen("screenQuickSetup");
    ensureMusicPlayback();
  });

  dom.goSeasonalQuickBtn.addEventListener("click", () => {
    hideMessage(dom.quickSetupError);
    setQuickMode("seasonal");
    hideMessage(dom.questionCycleResetMsg);
    showScreen("screenQuickSetup");
    ensureMusicPlayback();
  });

  dom.goAdminBtn.addEventListener("click", () => {
    dom.adminUsernameInput.value = "";
    dom.adminPasswordInput.value = "";
    hideMessage(dom.adminLoginError);
    showScreen("screenAdminLogin");
    ensureMusicPlayback();
  });

  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.go || "landing";
      showScreen(resolveScreenId(target));
    });
  });

  dom.startQuickBtn.addEventListener("click", startQuickGame);

  dom.loginAdminBtn.addEventListener("click", async () => {
    const username = normalizeSpace(dom.adminUsernameInput.value);
    const password = dom.adminPasswordInput.value.trim();
    try {
      if (isBackendEnabled()) {
        const payload = await loginWithBackend(username, password);
        const remoteUsername = normalizeSpace(payload?.admin?.username);
        if (!remoteUsername) {
          throw new Error("LOGIN_FAILED");
        }
        adminState.currentAdmin = {
          id: normalizeSpace(payload?.admin?.id) || uid("admin"),
          username: remoteUsername,
          role: normalizeAdminRole(payload?.admin?.role),
          isOwner: normalizeAdminRole(payload?.admin?.role) === "owner",
          createdAt: normalizeSpace(payload?.admin?.createdAt) || new Date().toISOString(),
          createdBy: normalizeSpace(payload?.admin?.createdBy) || "remote",
        };
        hideMessage(dom.adminLoginError);
        await hydrateFromBackendState();
        openAdminPanel();
        startRemoteSyncLoop();
        ensureMusicPlayback();
        return;
      }

      if (!backendConfig.allowInsecureLocalFallback) {
        showMessage(
          dom.adminLoginError,
          "ניהול מנהלים מאובטח דורש backend פעיל. הפעל backend ועדכן config.js.",
          false,
        );
        return;
      }

      const adminUser = authenticateAdminUser(username, password);
      if (!adminUser) {
        showMessage(dom.adminLoginError, "שם משתמש או סיסמה שגויים. נסה שוב.", false);
        return;
      }
      hideMessage(dom.adminLoginError);
      adminState.currentAdmin = adminUser;
      openAdminPanel();
      ensureMusicPlayback();
    } catch (_err) {
      showMessage(
        dom.adminLoginError,
        isBackendEnabled()
          ? "התחברות למערכת הענן נכשלה. בדוק חיבור או פרטי התחברות."
          : "שם משתמש או סיסמה שגויים. נסה שוב.",
        false,
      );
    }
  });

  dom.adminLogoutBtn.addEventListener("click", async () => {
    stopRemoteSyncLoop();
    if (isBackendEnabled()) {
      await logoutFromBackend();
    }
    adminState.currentAdmin = null;
    adminState.longTextAnalysis = null;
    adminState.lastLongTextBatchDraftIds = [];
    adminState.questionAuditReport = null;
    dom.adminUsernameInput.value = "";
    dom.adminPasswordInput.value = "";
    dom.adminUserForm.reset();
    dom.adminPasswordForm.reset();
    dom.longTextInput.value = "";
    dom.longTextSourceLabel.value = "";
    dom.longTextSourceUrl.value = "";
    hideMessage(dom.adminUserFormMsg);
    hideMessage(dom.adminPasswordFormMsg);
    hideMessage(dom.longTextMsg);
    setAdminMode("main");
    stopQuestionTimer();
    showScreen("screenLanding");
    ensureMusicPlayback();
  });

  dom.openQuestionBankBtn.addEventListener("click", () => {
    setAdminMode("questionBank");
    renderAllQuestionsManager();
  });

  dom.backToAdminMainBtn.addEventListener("click", () => {
    setAdminMode("main");
  });

  dom.resetQuestionCyclesPublicBtn.addEventListener("click", resetQuestionCyclesFlow);

  dom.nextQuestionBtn.addEventListener("click", () => {
    if (!gameState.locked) {
      return;
    }

    gameState.index += 1;
    gameState.locked = false;

    if (gameState.index >= gameState.questions.length) {
      finishGame();
      return;
    }

    renderQuestion();
  });

  dom.feedbackDeepExplainBtn.addEventListener("click", () => {
    gameState.feedbackDeepOpen = !gameState.feedbackDeepOpen;
    dom.feedbackDeepReasons.classList.toggle("hidden", !gameState.feedbackDeepOpen);
    dom.feedbackDeepExplainBtn.textContent = gameState.feedbackDeepOpen
      ? "סגור הסבר מעמיק"
      : "הסבר יותר לעומק";
  });

  dom.playAgainBtn.addEventListener("click", () => {
    dom.playerNameInput.value = gameState.playerName;
    hideMessage(dom.questionCycleResetMsg);
    stopQuestionTimer();
    showScreen("screenQuickSetup");
    ensureMusicPlayback();
  });

  dom.clearAttemptsBtn.addEventListener("click", () => {
    const shouldClear = window.confirm("למחוק את כל נתוני הניסיונות של השחקנים?");
    if (!shouldClear) {
      return;
    }

    const saved = writeStorage(STORAGE_KEYS.attempts, []);
    if (!saved) {
      showMessage(
        dom.activityFormMsg,
        "ניקוי הנתונים נכשל בגלל מגבלת אחסון בדפדפן.",
        false,
      );
      return;
    }

    renderAdminStats();
    renderAttemptsTable();
    renderLearningMetrics();
  });

  dom.activityForm.addEventListener("submit", handleActivitySubmit);
  dom.adminUserForm.addEventListener("submit", handleAdminUserCreate);
  dom.adminPasswordForm.addEventListener("submit", handleOwnPasswordChange);
  dom.longTextFileInput.addEventListener("change", handleLongTextFileUpload);
  dom.longTextInput.addEventListener("input", markLongTextAsChangedAfterAnalysis);
  dom.analyzeLongTextBtn.addEventListener("click", analyzeLongTextInput);
  dom.generateLongTextDraftsBtn.addEventListener("click", generateDraftsFromLongTextInput);
  dom.approveAllTextDraftsBtn.addEventListener("click", approveAllLongTextDrafts);
  dom.questionSearchInput.addEventListener("input", () => {
    renderAllQuestionsManager();
  });
  dom.runQuestionAuditBtn.addEventListener("click", runQuestionBankAudit);
  dom.clearQuestionAuditBtn.addEventListener("click", clearQuestionBankAuditReport);

  window.addEventListener(
    "pointerdown",
    () => {
      ensureMusicPlayback();
    },
    { passive: true },
  );
}

function resetQuestionCyclesFlow() {
  const shouldReset = window.confirm(
    "לאתחל את מחזור השאלות ולהתחיל ערבוב מחדש כבר עכשיו?",
  );
  if (!shouldReset) {
    return;
  }

  const savedQuestions = writeStorage(STORAGE_KEYS.questionCycleUsedIds, []);
  const savedFamilies = writeStorage(STORAGE_KEYS.familyCycleUsedIds, []);
  if (!savedQuestions || !savedFamilies) {
    showMessage(
      dom.questionCycleResetMsg,
      "האיפוס נכשל בגלל מגבלת אחסון בדפדפן.",
      false,
    );
    return;
  }

  showMessage(
    dom.questionCycleResetMsg,
    "האיפוס הצליח. מחזור השאלות אותחל והמערכת תתחיל ערבוב חדש.",
    true,
  );
}

function showScreen(screenId) {
  if (screenId !== "screenQuiz") {
    stopQuestionTimer();
    dom.screenQuiz.classList.remove("time-warning", "time-critical");
    hideMessage(dom.questionCycleResetMsg);
  }

  screenIds.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) {
      return;
    }

    if (id === screenId) {
      node.classList.remove("hidden");
    } else {
      node.classList.add("hidden");
    }
  });

  if (screenId === "screenQuiz") {
    dom.newGameAnytimeBtn.textContent = "התחל משחק חדש";
  } else {
    dom.newGameAnytimeBtn.textContent = "משחק חדש בכל שלב";
  }

  const hideMusicControls = screenId === "screenAdminPanel" || screenId === "screenAdminLogin";
  dom.musicControls.classList.toggle("hidden", hideMusicControls);
}

function resolveScreenId(shortName) {
  if (!shortName) {
    return "screenLanding";
  }

  if (shortName.startsWith("screen")) {
    return shortName;
  }

  const mapping = {
    landing: "screenLanding",
    quicksetup: "screenQuickSetup",
    adminlogin: "screenAdminLogin",
    quiz: "screenQuiz",
    result: "screenResult",
    adminpanel: "screenAdminPanel",
  };

  return mapping[shortName.toLowerCase()] || "screenLanding";
}

function initMusic() {
  const settings = readObjectStorage(STORAGE_KEYS.musicSettings, {});
  const volume = clampNumber(
    Number.isFinite(settings.volume) ? settings.volume : MUSIC_DEFAULT_VOLUME,
    0,
    1,
  );
  const muted = Boolean(settings.muted);

  dom.bgMusic.volume = volume;
  dom.bgMusic.muted = muted;
  dom.bgMusic.loop = true;
  renderMusicUi();
}

function ensureMusicPlayback() {
  if (!dom.bgMusic.paused) {
    return;
  }
  const playPromise = dom.bgMusic.play();
  if (playPromise && typeof playPromise.then === "function") {
    playPromise
      .then(() => {
        gameState.musicStarted = true;
      })
      .catch(() => {});
  }
}

function updateMusicVolume(nextValue) {
  const volume = clampNumber(nextValue, 0, 1);
  dom.bgMusic.volume = volume;
  if (volume > 0 && dom.bgMusic.muted) {
    dom.bgMusic.muted = false;
  }
  saveMusicSettings();
  renderMusicUi();
}

function saveMusicSettings() {
  writeStorage(STORAGE_KEYS.musicSettings, {
    volume: dom.bgMusic.volume,
    muted: dom.bgMusic.muted,
  });
}

function renderMusicUi() {
  const volumePercent = Math.round((dom.bgMusic.volume || 0) * 100);
  dom.musicLevelText.textContent = dom.bgMusic.muted
    ? `עוצמה: ${volumePercent}% (מושתק)`
    : `עוצמה: ${volumePercent}%`;
  dom.musicMuteBtn.textContent = dom.bgMusic.muted ? "בטל השתקה" : "השתק";
}

function resetAndGoToNewGame() {
  stopQuestionTimer();
  gameState.locked = false;
  gameState.index = 0;
  gameState.questions = [];
  gameState.score = 0;
  gameState.correctCount = 0;
  gameState.answerTimes = [];
  gameState.timeoutCount = 0;
  gameState.categoryStats = {};
  gameState.wrong = [];
  gameState.feedbackDeepOpen = false;
  gameState.questionStartedAt = 0;
  gameState.remainingSeconds = QUESTION_TIMEOUT_SECONDS;
  dom.screenQuiz.classList.remove("time-warning", "time-critical");
  hideMessage(dom.questionCycleResetMsg);
  hideMessage(dom.quickSetupError);
  showScreen("screenQuickSetup");
}

function startQuickGame() {
  hideMessage(dom.quickSetupError);
  hideMessage(dom.questionCycleResetMsg);
  stopQuestionTimer();

  const playerName = dom.playerNameInput.value.trim();
  if (!playerName) {
    showMessage(dom.quickSetupError, "יש להזין שם כדי להתחיל משחק.", false);
    return;
  }

  const isSeasonal = gameState.quickMode === "seasonal";
  const questionPool = isSeasonal
    ? getSeasonalPlayableQuestions()
    : getPlayableQuestions();
  if (!questionPool.length) {
    showMessage(
      dom.quickSetupError,
      isSeasonal
        ? "אין כרגע שאלות זמינות במצב עונתי (מאוקטובר 2025 ומעלה)."
        : "אין כרגע שאלות זמינות במאגר.",
      false,
    );
    return;
  }

  const countValue = dom.questionCountSelect.value;
  const count = countValue === "all" ? questionPool.length : Number(countValue);
  const gameQuestions = pickGameQuestions(questionPool, Math.min(count, questionPool.length));

  gameState.playerName = playerName;
  gameState.questions = gameQuestions;
  gameState.index = 0;
  gameState.score = 0;
  gameState.correctCount = 0;
  gameState.answerTimes = [];
  gameState.timeoutCount = 0;
  gameState.categoryStats = {};
  gameState.startAt = Date.now();
  gameState.questionStartedAt = 0;
  gameState.remainingSeconds = QUESTION_TIMEOUT_SECONDS;
  gameState.showLearning = dom.showLearningToggle.checked;
  gameState.locked = false;
  gameState.feedbackDeepOpen = false;
  gameState.wrong = [];

  showScreen("screenQuiz");
  renderQuestion();
}

function pickGameQuestions(questionPool, count) {
  const targetCount = Math.min(questionPool.length, Math.max(1, Number(count) || 1));
  const families = groupQuestionsByFamily(questionPool);
  const familyKeys = Array.from(families.keys());
  const allQuestionIds = questionPool
    .map((question) => String(question?.id || "").trim())
    .filter(Boolean);

  let usedQuestionIds = readCycleSet(STORAGE_KEYS.questionCycleUsedIds, allQuestionIds);
  if (usedQuestionIds.size >= questionPool.length) {
    usedQuestionIds = new Set();
  }

  let usedFamilyIds = readCycleSet(STORAGE_KEYS.familyCycleUsedIds, familyKeys);
  if (usedFamilyIds.size >= familyKeys.length) {
    usedFamilyIds = new Set();
  }

  let freshPool = questionPool.filter((question) => !usedQuestionIds.has(question.id));
  if (freshPool.length < targetCount) {
    usedQuestionIds = new Set();
    freshPool = questionPool.slice();
  }

  const freshFamilies = groupQuestionsByFamily(freshPool);
  let availableFreshFamilyKeys = familyKeys.filter(
    (familyKey) => freshFamilies.has(familyKey) && !usedFamilyIds.has(familyKey),
  );
  if (!availableFreshFamilyKeys.length) {
    usedFamilyIds = new Set();
    availableFreshFamilyKeys = familyKeys.filter((familyKey) => freshFamilies.has(familyKey));
  }

  const selected = [];
  const selectedIds = new Set();
  const selectedFamilies = [];
  const maxDiversified = Math.min(targetCount, availableFreshFamilyKeys.length);
  const diversifiedFamilyOrder = pickRandom(
    availableFreshFamilyKeys,
    availableFreshFamilyKeys.length,
  );

  for (let i = 0; i < diversifiedFamilyOrder.length; i += 1) {
    if (selected.length >= maxDiversified) {
      break;
    }

    const familyKey = diversifiedFamilyOrder[i];
    const familyQuestions = (freshFamilies.get(familyKey) || []).filter(
      (question) => !selectedIds.has(question.id),
    );
    if (!familyQuestions.length) {
      continue;
    }

    const picked = pickRandom(familyQuestions, 1)[0];
    if (!picked) {
      continue;
    }

    selected.push(picked);
    selectedIds.add(picked.id);
    selectedFamilies.push(familyKey);
  }

  if (selected.length < targetCount) {
    const leftovers = freshPool.filter((question) => !selectedIds.has(question.id));
    const extra = pickRandom(leftovers, targetCount - selected.length);
    extra.forEach((question) => {
      selected.push(question);
      selectedIds.add(question.id);
      const family = getQuestionFamilyKey(question);
      if (!selectedFamilies.includes(family)) {
        selectedFamilies.push(family);
      }
    });
  }

  selected.forEach((question) => {
    usedQuestionIds.add(question.id);
  });
  writeStorage(STORAGE_KEYS.questionCycleUsedIds, Array.from(usedQuestionIds));

  selectedFamilies.forEach((family) => {
    usedFamilyIds.add(family);
  });
  writeStorage(
    STORAGE_KEYS.familyCycleUsedIds,
    Array.from(usedFamilyIds).slice(-Math.max(1, familyKeys.length)),
  );

  return selected;
}

function groupQuestionsByFamily(questionPool) {
  const families = new Map();
  questionPool.forEach((question) => {
    const family = getQuestionFamilyKey(question);
    if (!families.has(family)) {
      families.set(family, []);
    }
    families.get(family).push(question);
  });
  return families;
}

function getQuestionFamilyKey(question) {
  const id = String((question && question.id) || "").trim();
  if (!id) {
    return clampText(question?.question || "unknown_question", 80);
  }

  if (/_v\d+$/.test(id)) {
    return id.replace(/_v\d+$/, "");
  }
  if (/_base$/.test(id)) {
    return id.replace(/_base$/, "");
  }

  return id;
}

function readCycleSet(storageKey, allowedValues) {
  const allowed = new Set(
    (allowedValues || [])
      .map((value) => String(value || "").trim())
      .filter(Boolean),
  );
  const current = readStorage(storageKey, []);
  const filtered = (current || [])
    .map((value) => String(value || "").trim())
    .filter((value) => allowed.has(value));
  return new Set(filtered);
}

function renderQuestion() {
  const question = gameState.questions[gameState.index];
  const current = gameState.index + 1;
  const total = gameState.questions.length;

  dom.quizPlayerName.textContent = `שחקן: ${gameState.playerName}`;
  dom.quizProgress.textContent = `שאלה ${current}/${total}`;
  dom.quizScore.textContent = `ניקוד: ${Math.round(gameState.score)} נק'`;
  dom.quizProgressFill.style.width = `${Math.round((current / total) * 100)}%`;
  dom.questionBanner.onerror = () => {
    dom.questionBanner.onerror = null;
    dom.questionBanner.src = buildFallbackBannerImage(question);
  };
  dom.questionBanner.src = buildBannerImage(question);
  dom.questionTitle.textContent = question.question;

  if (gameState.showLearning) {
    dom.questionLearn.textContent = `רקע קצר: ${question.learn}`;
    dom.questionLearn.classList.remove("hidden");
  } else {
    dom.questionLearn.classList.add("hidden");
  }

  dom.feedbackCard.classList.add("hidden");
  dom.feedbackWrongReasons.innerHTML = "";
  dom.feedbackDeepReasons.innerHTML = "";
  dom.feedbackDeepReasons.classList.add("hidden");
  dom.feedbackDeepExplainBtn.classList.add("hidden");
  dom.feedbackDeepExplainBtn.textContent = "הסבר יותר לעומק";
  gameState.feedbackDeepOpen = false;
  dom.optionsWrap.innerHTML = "";
  dom.screenQuiz.classList.remove("time-warning", "time-critical");

  question.options.forEach((optionText, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.textContent = optionText;
    btn.addEventListener("click", () => answerQuestion(index));
    dom.optionsWrap.appendChild(btn);
  });

  startQuestionTimer();
}

function answerQuestion(selectedIndex, options = {}) {
  const { timedOut = false } = options;

  if (gameState.locked) {
    return;
  }

  gameState.locked = true;
  stopQuestionTimer();
  dom.screenQuiz.classList.remove("time-warning", "time-critical");

  const question = gameState.questions[gameState.index];
  const elapsedSeconds = timedOut ? QUESTION_TIMEOUT_SECONDS : getCurrentElapsedSeconds();
  gameState.answerTimes.push(elapsedSeconds);
  if (timedOut) {
    gameState.timeoutCount += 1;
  }
  const isCorrect = !timedOut && selectedIndex === question.answer;
  updateCategoryPerformance(question, isCorrect, timedOut, elapsedSeconds);
  const optionButtons = Array.from(dom.optionsWrap.querySelectorAll(".option-btn"));

  optionButtons.forEach((button, index) => {
    button.disabled = true;

    if (index === question.answer) {
      button.classList.add("correct");
    } else if (index === selectedIndex) {
      button.classList.add("wrong");
    }
  });

  if (isCorrect) {
    const earnedPoints = calcPointsForSpeed(elapsedSeconds);
    gameState.score += earnedPoints;
    gameState.correctCount += 1;
    dom.feedbackHeadline.textContent = `נכון מאוד (+${earnedPoints} נק')`;
  } else {
    gameState.wrong.push({ question, selectedIndex, timedOut });
    dom.feedbackHeadline.textContent = timedOut
      ? "נגמר הזמן - השאלה נפסלה"
      : "לא מדויק";
  }

  dom.quizScore.textContent = `ניקוד: ${Math.round(gameState.score)} נק'`;
  if (timedOut) {
    dom.feedbackText.textContent = `לא נענתה תשובה בתוך ${QUESTION_TIMEOUT_SECONDS} שניות, ולכן לא התקבל ניקוד. ${question.explanation}`;
  } else {
    dom.feedbackText.textContent = question.explanation;
  }
  renderAnswerFeedbackDetails({
    question,
    isCorrect,
    timedOut,
    selectedIndex,
  });
  renderSources(dom.feedbackSources, question.sources, question);
  dom.feedbackCard.classList.remove("hidden");
}

function updateCategoryPerformance(question, isCorrect, timedOut, elapsedSeconds) {
  const category = String(question?.category || "ללא קטגוריה");
  if (!gameState.categoryStats[category]) {
    gameState.categoryStats[category] = {
      total: 0,
      correct: 0,
      timeouts: 0,
      totalAnswerSec: 0,
    };
  }

  const stat = gameState.categoryStats[category];
  stat.total += 1;
  stat.totalAnswerSec += Number(elapsedSeconds || 0);
  if (isCorrect) {
    stat.correct += 1;
  }
  if (timedOut) {
    stat.timeouts += 1;
  }
}

function renderAnswerFeedbackDetails(payload) {
  const {
    question,
    isCorrect = false,
    timedOut = false,
    selectedIndex = -1,
  } = payload || {};

  dom.feedbackWrongReasons.innerHTML = "";
  dom.feedbackDeepReasons.innerHTML = "";
  dom.feedbackDeepReasons.classList.add("hidden");
  dom.feedbackDeepExplainBtn.classList.add("hidden");
  dom.feedbackDeepExplainBtn.textContent = "הסבר יותר לעומק";
  gameState.feedbackDeepOpen = false;

  if (!question || !Array.isArray(question.options) || question.options.length < 2) {
    return;
  }

  const reasons = getOptionExplanations(question);

  if (!isCorrect) {
    const shortItems = buildShortWrongFeedbackItems({
      question,
      selectedIndex,
      timedOut,
      reasons,
    });
    shortItems.forEach((text) => {
      const li = document.createElement("li");
      li.className = "option-reason compact";
      li.textContent = text;
      dom.feedbackWrongReasons.appendChild(li);
    });
  }

  question.options.forEach((optionText, index) => {
    const li = document.createElement("li");
    const isAnswer = index === question.answer;
    li.className = `option-reason ${isAnswer ? "correct-note" : "detail-note"}`;
    if (isAnswer) {
      li.textContent = `למה "${optionText}" נכונה: ${reasons[index] || "זו האפשרות שתואמת למקור ולפעילות המתוארת."}`;
    } else {
      li.textContent = `למה "${optionText}" שגויה: ${reasons[index] || buildFallbackWrongReason(question, index)}`;
    }
    dom.feedbackDeepReasons.appendChild(li);
  });

  if (dom.feedbackDeepReasons.children.length) {
    dom.feedbackDeepExplainBtn.classList.remove("hidden");
  }
}

function buildShortWrongFeedbackItems(payload) {
  const {
    question,
    selectedIndex,
    timedOut,
    reasons,
  } = payload || {};
  const items = [];

  if (timedOut) {
    items.push("לא נבחרה תשובה בזמן, ולכן השאלה נפסלה.");
    items.push(`התשובה הנכונה: ${question.options[question.answer]}`);
    return items;
  }

  const selectedText = question.options[selectedIndex];
  if (typeof selectedText === "string") {
    const rawReason = reasons[selectedIndex] || buildFallbackWrongReason(question, selectedIndex);
    const shortReason = clampText(rawReason, 135);
    items.push(`"${selectedText}" לא מדויקת: ${shortReason}`);
  } else {
    items.push("התשובה שנבחרה לא תואמת למידע המתואר בשאלה.");
  }
  items.push(`מה נכון לזכור: ${question.options[question.answer]}`);
  return items;
}

function getOptionExplanations(question) {
  return ensureOptionExplanations(question);
}

function buildFallbackWrongReason(question, index) {
  const correct = String(question?.options?.[question.answer] || "").trim();
  const option = String(question?.options?.[index] || "").trim();
  const explanation = clampText(String(question?.explanation || "").trim(), 150);

  if (option && correct) {
    return `האפשרות הזו לא תואמת למידע במקור. המסקנה הנכונה היא "${correct}". ${explanation}`;
  }

  return `האפשרות הזו לא נתמכת במידע המתואר. ${explanation}`;
}

function ensureOptionExplanations(question) {
  const options = Array.isArray(question?.options)
    ? question.options.map((option) => String(option || "").trim())
    : [];
  const answer = Number(question?.answer);
  if (!options.length || !Number.isInteger(answer) || answer < 0 || answer >= options.length) {
    return [];
  }

  const existing = Array.isArray(question?.optionExplanations)
    ? question.optionExplanations.map((value) => String(value || "").trim())
    : [];

  if (existing.length === options.length && existing.every(Boolean)) {
    return existing;
  }

  return options.map((_, index) => {
    if (index === answer) {
      return `זו התשובה הנכונה לפי המקור: ${clampText(question.explanation || "", 150)}`;
    }
    return buildFallbackWrongReason(question, index);
  });
}

function startQuestionTimer() {
  stopQuestionTimer();
  gameState.questionStartedAt = Date.now();
  gameState.remainingSeconds = QUESTION_TIMEOUT_SECONDS;
  dom.hourglassIcon.style.animationPlayState = "running";
  updateTimerUI(gameState.remainingSeconds);

  gameState.timerIntervalId = window.setInterval(() => {
    const elapsed = (Date.now() - gameState.questionStartedAt) / 1000;
    const remaining = Math.max(0, QUESTION_TIMEOUT_SECONDS - elapsed);
    gameState.remainingSeconds = remaining;
    updateTimerUI(remaining);

    if (elapsed >= QUESTION_WARNING_AFTER_SECONDS) {
      dom.screenQuiz.classList.add("time-warning");
    }
    if (remaining <= 5) {
      dom.screenQuiz.classList.add("time-critical");
    }

    if (remaining <= 0) {
      stopQuestionTimer();
      if (!gameState.locked) {
        handleQuestionTimeout();
      }
    }
  }, 100);
}

function stopQuestionTimer() {
  if (gameState.timerIntervalId) {
    window.clearInterval(gameState.timerIntervalId);
    gameState.timerIntervalId = null;
  }
  dom.hourglassIcon.style.animationPlayState = "paused";
}

function updateTimerUI(remainingSeconds) {
  const sec = Math.max(0, remainingSeconds);
  dom.timerText.textContent = `${Math.ceil(sec)}`;
}

function getCurrentElapsedSeconds() {
  if (!gameState.questionStartedAt) {
    return 0;
  }

  return Math.min(
    QUESTION_TIMEOUT_SECONDS,
    Math.max(0, (Date.now() - gameState.questionStartedAt) / 1000),
  );
}

function calcPointsForSpeed(elapsedSeconds) {
  const earlyPenaltyPerSecond = 4;
  const latePenaltyPerSecond = 3;
  const pointsAtWarning = MAX_POINTS_PER_QUESTION - QUESTION_WARNING_AFTER_SECONDS * earlyPenaltyPerSecond;

  if (elapsedSeconds <= QUESTION_WARNING_AFTER_SECONDS) {
    return Math.max(
      MIN_POINTS_PER_CORRECT,
      Math.round(MAX_POINTS_PER_QUESTION - elapsedSeconds * earlyPenaltyPerSecond),
    );
  }

  const afterWarning = elapsedSeconds - QUESTION_WARNING_AFTER_SECONDS;
  return Math.max(
    MIN_POINTS_PER_CORRECT,
    Math.round(pointsAtWarning - afterWarning * latePenaltyPerSecond),
  );
}

function handleQuestionTimeout() {
  answerQuestion(-1, { timedOut: true });
}

function finishGame() {
  stopQuestionTimer();
  dom.screenQuiz.classList.remove("time-warning", "time-critical");

  const total = gameState.questions.length;
  const percent = total ? Math.round((gameState.correctCount / total) * 100) : 0;
  const durationSec = Math.max(1, Math.round((Date.now() - gameState.startAt) / 1000));
  const totalAnswerSec = gameState.answerTimes.reduce((sum, value) => sum + value, 0);
  const avgAnswerSec = gameState.answerTimes.length
    ? Number((totalAnswerSec / gameState.answerTimes.length).toFixed(2))
    : 0;

  saveAttempt({
    id: uid("attempt"),
    playerName: gameState.playerName,
    score: Math.round(gameState.score),
    correct: gameState.correctCount,
    total,
    percent,
    durationSec,
    avgAnswerSec,
    timeoutCount: gameState.timeoutCount,
    categoryStats: gameState.categoryStats,
    playedAt: new Date().toISOString(),
  });

  dom.resultMain.textContent = resultHeadline(percent);
  dom.resultSub.textContent = `ענית נכון על ${gameState.correctCount} מתוך ${total} שאלות (${percent}%). ניקוד סופי: ${Math.round(gameState.score)} נק'. זמן משחק: ${formatDuration(durationSec)} | זמן מענה ממוצע: ${avgAnswerSec.toFixed(1)} שניות | פקיעות זמן: ${gameState.timeoutCount}.`;

  renderWrongAnswers();
  showScreen("screenResult");
}

function resultHeadline(percent) {
  if (percent >= 90) {
    return "בקיאות גבוהה מאוד בפעילות העדכנית";
  }

  if (percent >= 70) {
    return "תוצאה טובה, יש עוד כמה נקודות לחידוד";
  }

  if (percent >= 50) {
    return "בסיס טוב, כדאי לחזור על ההסברים והמקורות";
  }

  return "מומלץ לעבור שוב על כרטיסי הלמידה ולנסות סבב נוסף";
}

function renderWrongAnswers() {
  dom.wrongAnswersWrap.innerHTML = "";

  if (!gameState.wrong.length) {
    const successLine = document.createElement("p");
    successLine.textContent = "לא היו טעויות בסבב הזה.";
    dom.wrongAnswersWrap.appendChild(successLine);
    return;
  }

  gameState.wrong.forEach((item) => {
    const card = document.createElement("article");
    card.className = "wrong-card";

    const title = document.createElement("strong");
    title.textContent = item.question.question;

    const answerLine = document.createElement("p");
    const status = item.timedOut ? "סטטוס: נגמר הזמן." : "סטטוס: תשובה שגויה.";
    answerLine.textContent = `${status} תשובה נכונה: ${item.question.options[item.question.answer]}`;

    const explainLine = document.createElement("p");
    explainLine.textContent = item.question.explanation;
    const compactLine = document.createElement("p");
    if (item.timedOut) {
      compactLine.textContent = "לא נבחרה תשובה בזמן לשאלה הזו.";
    } else {
      const reasons = getOptionExplanations(item.question);
      const selectedReason = reasons[item.selectedIndex]
        || buildFallbackWrongReason(item.question, item.selectedIndex);
      compactLine.textContent = `למה התשובה שנבחרה הייתה שגויה: ${clampText(selectedReason, 140)}`;
    }

    card.appendChild(title);
    card.appendChild(answerLine);
    card.appendChild(compactLine);
    card.appendChild(explainLine);
    dom.wrongAnswersWrap.appendChild(card);
  });
}

function buildExpandedQuestionBank(seedQuestions) {
  const normalizedSeeds = seedQuestions.map((question, idx) => {
    const seedOptions = sanitizeOptionsList(question?.options);
    const resolvedAnswerIndex = resolveAnswerIndex(
      question?.answer,
      seedOptions,
      question?.options,
    );
    const correctAnswer = seedOptions[resolvedAnswerIndex] || seedOptions[0] || "אין נתון";
    const safeOptions = ensureVariantOptions(seedOptions, correctAnswer, question?.category);
    const safeAnswer = safeOptions.indexOf(correctAnswer);
    return {
      ...question,
      id: question.id || `seed_${idx + 1}`,
      options: safeOptions,
      answer: safeAnswer >= 0 ? safeAnswer : 0,
      sources: normalizeQuestionSources(question?.sources, question),
    };
  });
  const expanded = [];

  normalizedSeeds.forEach((seed, index) => {
    const seedId = `${seed.id}_${index + 1}`;
    const correctAnswer = seed.options[seed.answer];

    expanded.push({
      ...seed,
      id: `${seedId}_base`,
      isGeneratedVariant: false,
    });


    QUESTION_VARIANT_PREFIXES.forEach((prefix, stemIndex) => {
      const mixedOptions = shuffleArray(seed.options.slice());
      expanded.push({
        id: `${seedId}_v${stemIndex + 1}`,
        kind: seed.kind,
        date: seed.date,
        category: seed.category,
        learn: seed.learn,
        question: buildSingleQuestionVariant(seed.question, prefix),
        options: mixedOptions,
        answer: mixedOptions.indexOf(correctAnswer),
        explanation: `${seed.explanation} זהו הרעיון המרכזי שכדאי לזכור מהאירוע הזה.`,
        sources: seed.sources,
        isGeneratedVariant: true,
      });
    });
  });

  return expanded.slice(0, 500);
}

function sanitizeOptionsList(options) {
  if (!Array.isArray(options)) {
    return [];
  }

  const seen = new Set();
  const uniqueOptions = [];

  options.forEach((option) => {
    const normalized = normalizeSpace(option);
    if (!normalized) {
      return;
    }
    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    uniqueOptions.push(normalized);
  });

  return uniqueOptions;
}

function resolveAnswerIndex(answer, sanitizedOptions, originalOptions) {
  const parsed = Number(answer);
  const originalList = Array.isArray(originalOptions) ? originalOptions : [];
  const correctTextFromOriginal =
    Number.isInteger(parsed) && parsed >= 0 && parsed < originalList.length
      ? normalizeSpace(originalList[parsed])
      : "";

  if (correctTextFromOriginal) {
    const foundByText = sanitizedOptions.findIndex((option) => option === correctTextFromOriginal);
    if (foundByText >= 0) {
      return foundByText;
    }
  }

  if (Number.isInteger(parsed) && parsed >= 0 && parsed < sanitizedOptions.length) {
    return parsed;
  }

  return 0;
}

function ensureVariantOptions(options, correctAnswer, category) {
  const safeOptions = sanitizeOptionsList(options);
  const correct = normalizeSpace(correctAnswer);
  const finalOptions = safeOptions.slice();

  if (correct && !finalOptions.includes(correct)) {
    finalOptions.unshift(correct);
  }

  const categoryPool = CATEGORY_DISTRACTOR_FALLBACKS[category] || CATEGORY_DISTRACTOR_FALLBACKS["פעילות ציבורית"];
  for (let i = 0; i < categoryPool.length && finalOptions.length < 4; i += 1) {
    const candidate = normalizeSpace(categoryPool[i]);
    if (!candidate || finalOptions.includes(candidate)) {
      continue;
    }
    finalOptions.push(candidate);
  }

  while (finalOptions.length < 4) {
    finalOptions.push(`חלופה עניינית ${finalOptions.length + 1}`);
  }

  return finalOptions;
}

function buildSingleQuestionVariant(questionText, prefixText) {
  const normalizedQuestion = String(questionText || "")
    .replace(/\s+/g, " ")
    .replace(/^[\s"“”']+|[\s"“”']+$/g, "")
    .trim();
  if (!normalizedQuestion) {
    return "מה הייתה עמדת התנועה במקרה המתואר?";
  }

  const withQuestionMark = /[?؟]$/.test(normalizedQuestion)
    ? normalizedQuestion
    : `${normalizedQuestion}?`;
  const prefix = String(prefixText || "").trim();
  if (!prefix) {
    return withQuestionMark;
  }

  return `${prefix} ${withQuestionMark}`.replace(/\s+/g, " ").trim();
}

function getPlayableQuestions() {
  const { activeQuestions } = getQuestionInventory();
  return activeQuestions.filter((question) => {
    if (!question.date) {
      return false;
    }

    if (question.date >= MIN_CONTENT_DATE) {
      return true;
    }

    return question.kind === "success" || question.allowLegacySuccess === true;
  });
}

function getSeasonalPlayableQuestions() {
  return getPlayableQuestions().filter((question) => question.date >= SEASONAL_MIN_DATE);
}

function setQuickMode(mode) {
  gameState.quickMode = mode === "seasonal" ? "seasonal" : "regular";
  if (gameState.quickMode === "seasonal") {
    dom.quickModeNote.textContent = "מצב עונתי: רק שאלות מאוקטובר 2025 ומעלה.";
  } else {
    dom.quickModeNote.textContent = "מצב רגיל: כלל המאגר הפעיל (2025+ והישגים מאושרים).";
  }
}

function resolveBackendConfig() {
  const incoming =
    typeof window !== "undefined" && window.MQG_BACKEND_CONFIG && typeof window.MQG_BACKEND_CONFIG === "object"
      ? window.MQG_BACKEND_CONFIG
      : {};
  const merged = {
    ...BACKEND_DEFAULT_CONFIG,
    ...incoming,
  };
  merged.enabled = Boolean(merged.enabled && normalizeSpace(merged.baseUrl));
  merged.baseUrl = normalizeSpace(merged.baseUrl).replace(/\/+$/, "");
  merged.syncIntervalMs = Math.max(5000, Number(merged.syncIntervalMs) || BACKEND_DEFAULT_CONFIG.syncIntervalMs);
  merged.publicWriteKey = normalizeSpace(merged.publicWriteKey);
  merged.allowInsecureLocalFallback = Boolean(merged.allowInsecureLocalFallback);
  return merged;
}

function isBackendEnabled() {
  return Boolean(backendConfig.enabled && backendConfig.baseUrl);
}

async function apiRequest(path, options = {}) {
  const baseUrl = backendConfig.baseUrl;
  if (!baseUrl) {
    throw new Error("BACKEND_NOT_CONFIGURED");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers,
    credentials: "include",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.ok === false) {
    const msg = normalizeSpace(payload?.error || payload?.message) || `HTTP_${response.status}`;
    throw new Error(msg);
  }

  return payload;
}

async function loginWithBackend(username, password) {
  const payload = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { username, password },
  });
  return payload;
}

async function logoutFromBackend() {
  await apiRequest("/api/auth/logout", {
    method: "POST",
  }).catch(() => {});
}

async function changeOwnBackendPassword(currentPassword, newPassword) {
  await apiRequest("/api/auth/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}

async function fetchBackendAdmins() {
  const payload = await apiRequest("/api/admins");
  return Array.isArray(payload?.admins) ? payload.admins : [];
}

async function createBackendAdmin(username, password) {
  const payload = await apiRequest("/api/admins", {
    method: "POST",
    body: { username, password },
  });
  return Array.isArray(payload?.admins) ? payload.admins : [];
}

async function deleteBackendAdmin(adminId) {
  const payload = await apiRequest(`/api/admins/${encodeURIComponent(String(adminId || ""))}`, {
    method: "DELETE",
  });
  return Array.isArray(payload?.admins) ? payload.admins : [];
}

async function fetchBackendStateSnapshot() {
  const payload = await apiRequest("/api/state");
  return payload?.state && typeof payload.state === "object" ? payload.state : {};
}

async function upsertBackendStateKey(key, value) {
  await apiRequest(`/api/state/${encodeURIComponent(String(key || ""))}`, {
    method: "PUT",
    body: { value },
  });
}

async function pushPublicAttemptToBackend(attempt) {
  if (!isBackendEnabled() || !backendConfig.publicWriteKey || adminState.currentAdmin?.id) {
    return;
  }

  try {
    await fetch(`${backendConfig.baseUrl}/api/public/attempt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-public-key": backendConfig.publicWriteKey,
      },
      body: JSON.stringify({ attempt }),
    });
  } catch (_err) {
    // ignore temporary network issues for public attempt logging
  }
}

async function hydrateFromBackendState() {
  if (!isBackendEnabled() || !adminState.currentAdmin?.id) {
    return;
  }

  adminState.isHydratingRemote = true;
  try {
    const snapshot = await fetchBackendStateSnapshot();
    REMOTE_SYNCABLE_KEYS.forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(snapshot, key)) {
        return;
      }
      writeStorage(key, snapshot[key]);
    });

    const backendAdmins = await fetchBackendAdmins().catch(() => []);
    if (backendAdmins.length) {
      writeStorage(STORAGE_KEYS.adminUsers, backendAdmins.map((item) => ({
        id: item.id,
        username: item.username,
        role: normalizeAdminRole(item.role),
        createdAt: item.createdAt || new Date().toISOString(),
        createdBy: item.createdBy || "remote",
      })));
    }
  } finally {
    adminState.isHydratingRemote = false;
  }
}

async function runRemoteSyncPull() {
  if (!isBackendEnabled() || !adminState.currentAdmin?.id || adminState.syncInFlight) {
    return;
  }

  adminState.syncInFlight = true;
  try {
    await hydrateFromBackendState();
    renderAdminStats();
    renderAttemptsTable();
    renderLearningMetrics();
    renderActivities();
    renderDrafts();
    renderCustomQuestions();
    renderAllQuestionsManager();
    renderAdminUsers();
    renderLongTextDraftsPreview();
  } catch (_err) {
    // ignore temporary sync errors
  } finally {
    adminState.syncInFlight = false;
  }
}

function startRemoteSyncLoop() {
  if (!isBackendEnabled() || !adminState.currentAdmin?.id) {
    return;
  }
  stopRemoteSyncLoop();
  adminState.syncTimerId = window.setInterval(() => {
    runRemoteSyncPull();
  }, backendConfig.syncIntervalMs);
}

function stopRemoteSyncLoop() {
  if (adminState.syncTimerId) {
    window.clearInterval(adminState.syncTimerId);
    adminState.syncTimerId = null;
  }
}

function queueRemoteStateSync(key, value) {
  if (!isBackendEnabled() || !adminState.currentAdmin?.id) {
    return;
  }
  if (adminState.isHydratingRemote) {
    return;
  }
  if (!REMOTE_SYNCABLE_KEYS.includes(key)) {
    return;
  }
  upsertBackendStateKey(key, value).catch(() => {});
}

async function refreshAdminUsersFromBackend() {
  if (!isBackendEnabled() || !adminState.currentAdmin?.id) {
    return;
  }

  const admins = await fetchBackendAdmins();
  const normalized = admins.map((item) => ({
    id: item.id,
    username: item.username,
    role: normalizeAdminRole(item.role),
    createdAt: item.createdAt || new Date().toISOString(),
    createdBy: item.createdBy || "remote",
  }));
  writeStorage(STORAGE_KEYS.adminUsers, normalized);
}

function setAdminMode(mode) {
  adminState.mode = mode === "questionBank" ? "questionBank" : "main";
  const showQuestionBank = adminState.mode === "questionBank";

  dom.adminMainSections.classList.toggle("hidden", showQuestionBank);
  dom.adminQuestionBankSection.classList.toggle("hidden", !showQuestionBank);
  dom.openQuestionBankBtn.classList.toggle("hidden", showQuestionBank);
  dom.backToAdminMainBtn.classList.toggle("hidden", !showQuestionBank);
}

function normalizeAdminUsername(value) {
  return normalizeSpace(value).toLowerCase();
}

function normalizeAdminRole(value) {
  return normalizeSpace(value).toLowerCase() === "owner" ? "owner" : "admin";
}

function sanitizeAdminUser(user) {
  const username = normalizeSpace(user?.username);
  if (!username) {
    return null;
  }

  const role = normalizeAdminRole(user?.role);
  return {
    id: normalizeSpace(user?.id) || uid("admin"),
    username,
    password: String(user?.password || "").trim(),
    role,
    isOwner: role === "owner",
    createdAt: normalizeSpace(user?.createdAt) || new Date().toISOString(),
    createdBy: normalizeSpace(user?.createdBy) || "system",
  };
}

function readAdminUsers() {
  if (isBackendEnabled() && adminState.currentAdmin?.id) {
    const cached = readStorage(STORAGE_KEYS.adminUsers, []);
    if (Array.isArray(cached) && cached.length) {
      return cached.map(sanitizeAdminUser).filter(Boolean);
    }
  }

  const saved = readStorage(STORAGE_KEYS.adminUsers, []);
  const normalized = Array.isArray(saved)
    ? saved.map(sanitizeAdminUser).filter(Boolean)
    : [];

  if (!normalized.length) {
    const seeded = DEFAULT_ADMIN_USERS.map((user) => ({ ...user }));
    writeStorage(STORAGE_KEYS.adminUsers, seeded);
    return seeded;
  }

  if (normalized.length !== saved.length) {
    writeStorage(STORAGE_KEYS.adminUsers, normalized);
  }

  return normalized;
}

function ensureAdminUsersSeeded() {
  readAdminUsers();
}

function authenticateAdminUser(username, password) {
  const safeUsername = normalizeAdminUsername(username);
  const safePassword = String(password || "").trim();
  if (!safeUsername || !safePassword) {
    return null;
  }

  const adminUsers = readAdminUsers();
  return adminUsers.find((user) =>
    normalizeAdminUsername(user.username) === safeUsername
    && user.password
    && String(user.password) === safePassword,
  ) || null;
}

function renderAdminSessionInfo() {
  if (!dom.adminSessionInfo) {
    return;
  }
  if (adminState.currentAdmin?.username) {
    dom.adminSessionInfo.textContent = adminState.currentAdmin?.isOwner
      ? `מחובר כעת: ${adminState.currentAdmin.username} (מנהל ראשי)`
      : `מחובר כעת: ${adminState.currentAdmin.username}`;
    return;
  }
  dom.adminSessionInfo.textContent = "לא זוהה מנהל מחובר.";
}

function renderAdminUsers() {
  if (!dom.adminUsersList) {
    return;
  }

  const adminUsers = readAdminUsers();
  dom.adminUsersList.innerHTML = "";

  adminUsers.forEach((user) => {
    const card = document.createElement("article");
    card.className = "info-card";

    const title = document.createElement("h4");
    title.textContent = `שם משתמש: ${user.username}`;

    const createdLine = document.createElement("p");
    createdLine.className = "muted tight";
    createdLine.textContent =
      `הרשאה: ${user.isOwner ? "מנהל ראשי" : "מנהל"} | ` +
      `נוצר על ידי: ${user.createdBy} | ${formatDateTime(user.createdAt)}`;

    card.appendChild(title);
    card.appendChild(createdLine);

    if (adminUsers.length > 1 && !user.isOwner) {
      const actions = document.createElement("div");
      actions.className = "inline-actions";
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "ghost-btn";
      removeBtn.textContent = "מחק מנהל";
      removeBtn.addEventListener("click", () => removeAdminUser(user.id));
      actions.appendChild(removeBtn);
      card.appendChild(actions);
    }

    dom.adminUsersList.appendChild(card);
  });
}

async function handleAdminUserCreate(event) {
  event.preventDefault();
  hideMessage(dom.adminUserFormMsg);

  const username = normalizeSpace(dom.adminUserNewUsername.value);
  const password = String(dom.adminUserNewPassword.value || "").trim();

  if (username.length < 2 || password.length < 8) {
    showMessage(dom.adminUserFormMsg, "יש להזין שם משתמש וסיסמה חזקה (לפחות 8 תווים).", false);
    return;
  }

  const adminUsers = readAdminUsers();
  const exists = adminUsers.some((user) => normalizeAdminUsername(user.username) === normalizeAdminUsername(username));
  if (exists) {
    showMessage(dom.adminUserFormMsg, "שם המשתמש כבר קיים. בחר שם אחר.", false);
    return;
  }

  const nextUser = {
    id: uid("admin"),
    username,
    password,
    role: "admin",
    createdAt: new Date().toISOString(),
    createdBy: adminState.currentAdmin?.username || "system",
  };
  if (isBackendEnabled() && adminState.currentAdmin?.id) {
    try {
      const remoteAdmins = await createBackendAdmin(username, password);
      const normalizedRemote = remoteAdmins.map((item) => ({
        id: item.id,
        username: item.username,
        role: normalizeAdminRole(item.role),
        createdAt: item.createdAt || new Date().toISOString(),
        createdBy: item.createdBy || "remote",
      }));
      writeStorage(STORAGE_KEYS.adminUsers, normalizedRemote);
    } catch (_err) {
      showMessage(dom.adminUserFormMsg, "יצירת המנהל בענן נכשלה.", false);
      return;
    }
  } else {
    const saved = writeStorage(STORAGE_KEYS.adminUsers, [nextUser, ...adminUsers]);
    if (!saved) {
      showMessage(dom.adminUserFormMsg, "יצירת המנהל נכשלה בגלל מגבלת אחסון בדפדפן.", false);
      return;
    }
  }

  dom.adminUserForm.reset();
  showMessage(dom.adminUserFormMsg, `המנהל "${username}" נוצר בהצלחה.`, true);
  renderAdminUsers();
}

async function handleOwnPasswordChange(event) {
  event.preventDefault();
  hideMessage(dom.adminPasswordFormMsg);

  const currentPassword = String(dom.adminCurrentPassword.value || "").trim();
  const newPassword = String(dom.adminNewPassword.value || "").trim();
  const confirmPassword = String(dom.adminConfirmPassword.value || "").trim();

  if (newPassword.length < 8) {
    showMessage(dom.adminPasswordFormMsg, "הסיסמה החדשה חייבת להכיל לפחות 8 תווים.", false);
    return;
  }

  if (newPassword !== confirmPassword) {
    showMessage(dom.adminPasswordFormMsg, "אימות הסיסמה החדשה לא תואם.", false);
    return;
  }

  if (!isBackendEnabled() || !adminState.currentAdmin?.id) {
    showMessage(dom.adminPasswordFormMsg, "שינוי סיסמה מאובטח זמין רק דרך Backend פעיל.", false);
    return;
  }

  try {
    await changeOwnBackendPassword(currentPassword, newPassword);
    dom.adminPasswordForm.reset();
    showMessage(dom.adminPasswordFormMsg, "הסיסמה עודכנה בהצלחה.", true);
  } catch (err) {
    const code = normalizeSpace(err?.message);
    if (code === "INVALID_CURRENT_PASSWORD") {
      showMessage(dom.adminPasswordFormMsg, "הסיסמה הנוכחית שגויה.", false);
      return;
    }
    if (code === "INVALID_NEW_PASSWORD") {
      showMessage(dom.adminPasswordFormMsg, "הסיסמה החדשה לא עומדת בדרישות המינימום.", false);
      return;
    }
    if (code === "PASSWORD_UNCHANGED") {
      showMessage(dom.adminPasswordFormMsg, "הסיסמה החדשה חייבת להיות שונה מהנוכחית.", false);
      return;
    }
    showMessage(dom.adminPasswordFormMsg, "עדכון הסיסמה נכשל. נסה שוב בעוד רגע.", false);
  }
}

async function removeAdminUser(userId) {
  const adminUsers = readAdminUsers();
  if (adminUsers.length <= 1) {
    showMessage(dom.adminUserFormMsg, "אי אפשר למחוק את המנהל האחרון במערכת.", false);
    return;
  }

  const target = adminUsers.find((user) => user.id === userId);
  if (!target) {
    return;
  }

  const shouldRemove = window.confirm(`למחוק את המנהל "${target.username}"?`);
  if (!shouldRemove) {
    return;
  }

  if (target.isOwner) {
    showMessage(dom.adminUserFormMsg, "לא ניתן למחוק את המנהל הראשי.", false);
    return;
  }

  if (isBackendEnabled() && adminState.currentAdmin?.id) {
    try {
      const remoteAdmins = await deleteBackendAdmin(userId);
      const normalizedRemote = remoteAdmins.map((item) => ({
        id: item.id,
        username: item.username,
        role: normalizeAdminRole(item.role),
        createdAt: item.createdAt || new Date().toISOString(),
        createdBy: item.createdBy || "remote",
      }));
      writeStorage(STORAGE_KEYS.adminUsers, normalizedRemote);
    } catch (err) {
      const code = normalizeSpace(err?.message);
      if (code === "OWNER_PROTECTED") {
        showMessage(dom.adminUserFormMsg, "לא ניתן למחוק את המנהל הראשי.", false);
        return;
      }
      showMessage(dom.adminUserFormMsg, "מחיקת מנהל בענן נכשלה.", false);
      return;
    }
  } else {
    const nextUsers = adminUsers.filter((user) => user.id !== userId);
    const saved = writeStorage(STORAGE_KEYS.adminUsers, nextUsers);
    if (!saved) {
      showMessage(dom.adminUserFormMsg, "מחיקת מנהל נכשלה.", false);
      return;
    }
  }

  if (adminState.currentAdmin?.id === userId) {
    adminState.currentAdmin = null;
    showScreen("screenAdminLogin");
    showMessage(dom.adminLoginError, "החשבון שלך נמחק. יש להתחבר מחדש.", false);
    return;
  }

  showMessage(dom.adminUserFormMsg, `המנהל "${target.username}" נמחק.`, true);
  renderAdminUsers();
}

function openAdminPanel() {
  setAdminMode("main");
  setDefaultDateFields();
  renderAdminSessionInfo();
  renderAdminUsers();
  if (isBackendEnabled() && adminState.currentAdmin?.id) {
    refreshAdminUsersFromBackend()
      .then(() => renderAdminUsers())
      .catch(() => {});
  }
  renderAdminStats();
  renderAttemptsTable();
  renderLearningMetrics();
  renderActivities();
  renderDrafts();
  renderCustomQuestions();
  renderLongTextDraftsPreview();
  renderQuestionAuditReport();
  dom.adminPasswordForm.reset();
  hideMessage(dom.activityFormMsg);
  hideMessage(dom.adminUserFormMsg);
  hideMessage(dom.adminPasswordFormMsg);
  hideMessage(dom.longTextMsg);
  showScreen("screenAdminPanel");
}

function renderAdminStats() {
  const attempts = readStorage(STORAGE_KEYS.attempts, []);
  const activities = readStorage(STORAGE_KEYS.activities, []);
  const drafts = readStorage(STORAGE_KEYS.drafts, []);
  const inventory = getQuestionInventory();
  const totalQuestions = inventory.activeQuestions.length;
  const disabledQuestions = inventory.disabledIds.size;

  const uniquePlayers = new Set(attempts.map((item) => item.playerName)).size;
  const avgPercent =
    attempts.length === 0
      ? 0
      : Math.round(attempts.reduce((sum, item) => sum + (item.percent || 0), 0) / attempts.length);
  const avgAnswerSec =
    attempts.length === 0
      ? 0
      : Number(
          (
            attempts.reduce((sum, item) => sum + Number(item.avgAnswerSec || 0), 0) / attempts.length
          ).toFixed(1),
        );
  const totalTimeouts = attempts.reduce((sum, item) => sum + Number(item.timeoutCount || 0), 0);

  const stats = [
    { label: "ניסיונות", value: attempts.length },
    { label: "שחקנים ייחודיים", value: uniquePlayers },
    { label: "ממוצע אחוז", value: `${avgPercent}%` },
    { label: "שאלות פעילות", value: totalQuestions },
    { label: "שאלות מוסתרות", value: disabledQuestions },
    { label: "זמן מענה ממוצע", value: `${avgAnswerSec} ש׳` },
    { label: "פקיעות זמן", value: totalTimeouts },
    { label: "טיוטות ממתינות", value: drafts.length },
    { label: "פעילויות שהוזנו", value: activities.length },
  ];

  dom.adminStats.innerHTML = "";
  stats.forEach((stat) => {
    const card = document.createElement("article");
    card.className = "stat-card";

    const label = document.createElement("p");
    label.className = "label";
    label.textContent = stat.label;

    const value = document.createElement("p");
    value.className = "value";
    value.textContent = String(stat.value);

    card.appendChild(label);
    card.appendChild(value);
    dom.adminStats.appendChild(card);
  });

  dom.questionCountExact.textContent = `שאלות פעילות במאגר: ${totalQuestions} | מוסתרות: ${disabledQuestions} | סך הכול: ${inventory.allQuestions.length}`;
}

function renderAttemptsTable() {
  const attempts = readStorage(STORAGE_KEYS.attempts, []);
  dom.attemptsTableBody.innerHTML = "";

  if (!attempts.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "אין נתוני משחק עדיין.";
    row.appendChild(cell);
    dom.attemptsTableBody.appendChild(row);
    return;
  }

  attempts.forEach((attempt) => {
    const row = document.createElement("tr");
    const points = Number.isFinite(attempt.score) ? attempt.score : 0;
    const correct = Number.isFinite(attempt.correct) ? attempt.correct : attempt.score;
    const total = Number.isFinite(attempt.total) ? attempt.total : 0;
    const avgAnswerSec = Number(attempt.avgAnswerSec || 0);
    const timeoutCount = Number(attempt.timeoutCount || 0);

    row.appendChild(makeCell(attempt.playerName));
    row.appendChild(makeCell(`${points} נק' (${correct}/${total})`));
    row.appendChild(makeCell(`${attempt.percent}%`));
    row.appendChild(
      makeCell(
        `${formatDuration(attempt.durationSec || 0)} | ממוצע ${avgAnswerSec.toFixed(1)} ש׳ | פקיעות ${timeoutCount}`,
      ),
    );
    row.appendChild(makeCell(formatDateTime(attempt.playedAt)));
    dom.attemptsTableBody.appendChild(row);
  });
}

function renderLearningMetrics() {
  const attempts = readStorage(STORAGE_KEYS.attempts, []);
  dom.learningMetricsList.innerHTML = "";

  const categorySummary = new Map();
  attempts.forEach((attempt) => {
    const byCategory =
      attempt?.categoryStats && typeof attempt.categoryStats === "object"
        ? attempt.categoryStats
        : null;
    if (!byCategory) {
      return;
    }

    Object.entries(byCategory).forEach(([category, stat]) => {
      const safeCategory = normalizeSpace(category) || "ללא קטגוריה";
      const total = Number(stat?.total || 0);
      if (total <= 0) {
        return;
      }

      const correct = clampNumber(Number(stat?.correct || 0), 0, total);
      const timeouts = clampNumber(Number(stat?.timeouts || 0), 0, total);
      const totalAnswerSec = Math.max(0, Number(stat?.totalAnswerSec || 0));

      if (!categorySummary.has(safeCategory)) {
        categorySummary.set(safeCategory, {
          total: 0,
          correct: 0,
          timeouts: 0,
          totalAnswerSec: 0,
        });
      }

      const current = categorySummary.get(safeCategory);
      current.total += total;
      current.correct += correct;
      current.timeouts += timeouts;
      current.totalAnswerSec += totalAnswerSec;
    });
  });

  if (!categorySummary.size) {
    dom.learningMetricsList.appendChild(
      makeInfoMessage("עדיין אין מספיק נתונים למדד למידה. אחרי כמה משחקים יופיעו נקודות נפילה לפי נושא."),
    );
    return;
  }

  const rows = Array.from(categorySummary.entries())
    .map(([category, item]) => {
      const misses = Math.max(0, item.total - item.correct);
      const accuracy = item.total ? Math.round((item.correct / item.total) * 100) : 0;
      const timeoutRate = item.total ? Math.round((item.timeouts / item.total) * 100) : 0;
      const avgSec = item.total ? Number((item.totalAnswerSec / item.total).toFixed(1)) : 0;
      const learningIndex = Math.max(
        0,
        Math.min(100, Math.round(accuracy * 0.72 + (100 - timeoutRate) * 0.28)),
      );

      return {
        category,
        total: item.total,
        misses,
        accuracy,
        timeoutRate,
        avgSec,
        learningIndex,
      };
    })
    .sort((a, b) => {
      if (a.accuracy !== b.accuracy) {
        return a.accuracy - b.accuracy;
      }
      return b.total - a.total;
    });

  rows.forEach((row) => {
    const card = document.createElement("article");
    card.className = "info-card learning-card";

    const title = document.createElement("h4");
    title.textContent = row.category;

    const statLine = document.createElement("p");
    statLine.textContent = `דיוק: ${row.accuracy}% | נפילות: ${row.misses}/${row.total} | פקיעות זמן: ${row.timeoutRate}%`;

    const speedLine = document.createElement("p");
    speedLine.textContent = `זמן מענה ממוצע: ${row.avgSec} שניות | מדד למידה: ${row.learningIndex}/100`;

    const barWrap = document.createElement("div");
    barWrap.className = "learning-bar";

    const barFill = document.createElement("div");
    barFill.className = "learning-fill";
    barFill.style.width = `${row.learningIndex}%`;

    barWrap.appendChild(barFill);

    const priority = document.createElement("p");
    priority.className = "muted tight";
    if (row.accuracy < 55) {
      priority.textContent = "עדיפות חיזוק: גבוהה מאוד - זה נושא ששחקנים מתקשים בו כרגע.";
    } else if (row.accuracy < 72) {
      priority.textContent = "עדיפות חיזוק: בינונית - כדאי להוסיף דוגמאות והסברים בנושא.";
    } else {
      priority.textContent = "עדיפות חיזוק: נמוכה - הנושא מובן יחסית.";
    }

    card.appendChild(title);
    card.appendChild(statLine);
    card.appendChild(speedLine);
    card.appendChild(barWrap);
    card.appendChild(priority);
    dom.learningMetricsList.appendChild(card);
  });
}

function makeCell(text) {
  const cell = document.createElement("td");
  cell.textContent = text;
  return cell;
}

async function handleActivitySubmit(event) {
  event.preventDefault();

  hideMessage(dom.activityFormMsg);

  const formData = new FormData(dom.activityForm);
  const title = String(formData.get("title") || "").trim();
  const date = String(formData.get("date") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const kind = String(formData.get("kind") || "activity").trim();
  const context = String(formData.get("context") || "").trim();
  const outcome = String(formData.get("outcome") || "").trim();
  const sourceLabel = String(formData.get("sourceLabel") || "").trim();
  const sourceUrl = String(formData.get("sourceUrl") || "").trim();

  if (!title || !date || !category || !context || !outcome) {
    showMessage(dom.activityFormMsg, "יש למלא את כל השדות החיוניים לפני שמירה.", false);
    return;
  }

  if (kind === "activity" && date < MIN_CONTENT_DATE) {
    showMessage(
      dom.activityFormMsg,
      "פעילות שוטפת חייבת להיות מתאריך 2025 ומעלה. הישג יכול להיות גם מוקדם יותר.",
      false,
    );
    return;
  }

  if (sourceUrl && !isValidUrl(sourceUrl)) {
    showMessage(dom.activityFormMsg, "קישור המקור לא תקין. יש להזין URL מלא.", false);
    return;
  }

  const attachments = await extractFileMeta(dom.adminFilesInput.files);

  const activity = {
    id: uid("act"),
    title,
    date,
    category,
    kind,
    context,
    outcome,
    sourceLabel,
    sourceUrl,
    attachments,
    createdAt: new Date().toISOString(),
  };

  const activities = readStorage(STORAGE_KEYS.activities, []);
  activities.unshift(activity);

  const drafts = readStorage(STORAGE_KEYS.drafts, []);
  const generatedDrafts = generateDraftsFromActivity(activity);

  const savedActivities = writeStorage(STORAGE_KEYS.activities, activities.slice(0, 300));
  const savedDrafts = writeStorage(STORAGE_KEYS.drafts, [...generatedDrafts, ...drafts].slice(0, 500));
  if (!savedActivities || !savedDrafts) {
    showMessage(
      dom.activityFormMsg,
      "שמירה נכשלה (ייתכן שמגבלת האחסון בדפדפן התמלאה). נסה לצמצם קבצים/תמונות.",
      false,
    );
    return;
  }

  dom.activityForm.reset();
  setDefaultDateFields();

  showMessage(
    dom.activityFormMsg,
    `הפעילות נשמרה. נוצרו ${generatedDrafts.length} טיוטות שאלות לאישור מנהל.`,
    true,
  );

  renderAdminStats();
  renderActivities();
  renderDrafts();
}

function renderActivities() {
  const activities = readStorage(STORAGE_KEYS.activities, []);
  dom.activitiesList.innerHTML = "";

  if (!activities.length) {
    dom.activitiesList.appendChild(makeInfoMessage("עדיין לא הוזנו פעילויות."));
    return;
  }

  activities.forEach((activity) => {
    const card = document.createElement("article");
    card.className = "info-card";

    const title = document.createElement("h4");
    title.textContent = activity.title;

    const badgeRow = document.createElement("div");
    badgeRow.className = "badge-row";

    const dateBadge = document.createElement("span");
    dateBadge.className = "badge";
    dateBadge.textContent = formatDateDisplay(activity.date);

    const kindBadge = document.createElement("span");
    kindBadge.className = `badge ${activity.kind === "success" ? "success" : "activity"}`;
    kindBadge.textContent = activity.kind === "success" ? "הישג" : "פעילות";

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "badge";
    categoryBadge.textContent = activity.category;

    badgeRow.appendChild(dateBadge);
    badgeRow.appendChild(kindBadge);
    badgeRow.appendChild(categoryBadge);

    const context = document.createElement("p");
    context.textContent = `רקע: ${activity.context}`;

    const outcome = document.createElement("p");
    outcome.textContent = `תוצאה: ${activity.outcome}`;

    card.appendChild(title);
    card.appendChild(badgeRow);
    card.appendChild(context);
    card.appendChild(outcome);

    if (activity.sourceUrl) {
      const source = document.createElement("a");
      source.href = buildPreferredSourceHref(
        {
          label: activity.sourceLabel || "קישור חיצוני",
          url: activity.sourceUrl,
          anchorText: normalizeSpace(activity.outcome) || normalizeSpace(activity.context),
        },
        null,
      );
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = `מקור: ${activity.sourceLabel || "קישור חיצוני"}`;
      card.appendChild(source);
    }

    if (Array.isArray(activity.attachments) && activity.attachments.length) {
      const attachWrap = document.createElement("div");
      attachWrap.className = "attachments";

      activity.attachments.forEach((file) => {
        const line = document.createElement("p");
        line.className = "attach-line";
        line.textContent = `קובץ: ${file.name} (${formatBytes(file.size)})`;
        attachWrap.appendChild(line);

        if (file.previewDataUrl) {
          const preview = document.createElement("img");
          preview.className = "attach-preview";
          preview.src = file.previewDataUrl;
          preview.alt = file.name;
          attachWrap.appendChild(preview);
        }
      });

      card.appendChild(attachWrap);
    }

    dom.activitiesList.appendChild(card);
  });
}

function renderDrafts() {
  const drafts = readStorage(STORAGE_KEYS.drafts, []);
  dom.draftsList.innerHTML = "";

  if (!drafts.length) {
    dom.draftsList.appendChild(makeInfoMessage("אין כרגע טיוטות לאישור."));
    return;
  }

  drafts.forEach((draft) => {
    const quality = evaluateDraftQuality(draft);
    const card = document.createElement("article");
    card.className = "info-card";

    const title = document.createElement("h4");
    title.textContent = draft.question;

    const badgeRow = document.createElement("div");
    badgeRow.className = "badge-row";

    const dateBadge = document.createElement("span");
    dateBadge.className = "badge";
    dateBadge.textContent = formatDateDisplay(draft.date);

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "badge";
    categoryBadge.textContent = draft.category;

    badgeRow.appendChild(dateBadge);
    badgeRow.appendChild(categoryBadge);

    const learn = document.createElement("p");
    learn.textContent = `רקע לשאלה: ${draft.learn}`;

    const optionsList = document.createElement("ul");
    optionsList.className = "sources-list";

    draft.options.forEach((option, index) => {
      const li = document.createElement("li");
      const prefix = index === draft.answer ? "תשובה נכונה" : "תשובה";
      li.textContent = `${prefix}: ${option}`;
      optionsList.appendChild(li);
    });

    const explain = document.createElement("p");
    explain.textContent = draft.explanation;

    const qualitySummary = document.createElement("p");
    qualitySummary.className = quality.isReadyToApprove ? "quality-summary ok" : "quality-summary bad";
    qualitySummary.textContent = quality.isReadyToApprove
      ? "צ'קליסט איכות: תקין - אפשר לאשר."
      : "צ'קליסט איכות: חסרים סעיפים מחייבים, לא ניתן לאשר עדיין.";

    const qualityList = renderDraftQualityChecklist(quality);

    const actions = document.createElement("div");
    actions.className = "inline-actions";

    const approveBtn = document.createElement("button");
    approveBtn.type = "button";
    approveBtn.className = "primary-btn";
    approveBtn.textContent = "אשר והוסף למאגר";
    approveBtn.disabled = !quality.isReadyToApprove;
    if (!quality.isReadyToApprove) {
      approveBtn.title = "יש לתקן את כל סעיפי החובה בצ'קליסט לפני אישור.";
    }
    approveBtn.addEventListener("click", () => approveDraft(draft.id));

    const rejectBtn = document.createElement("button");
    rejectBtn.type = "button";
    rejectBtn.className = "ghost-btn";
    rejectBtn.textContent = "דחה טיוטה";
    rejectBtn.addEventListener("click", () => rejectDraft(draft.id));

    actions.appendChild(approveBtn);
    actions.appendChild(rejectBtn);

    card.appendChild(title);
    card.appendChild(badgeRow);
    card.appendChild(learn);
    card.appendChild(optionsList);
    card.appendChild(explain);
    card.appendChild(qualitySummary);
    card.appendChild(qualityList);

    if (Array.isArray(draft.sources) && draft.sources.length) {
      const sourceLine = document.createElement("a");
      sourceLine.href = buildPreferredSourceHref(draft.sources[0], draft);
      sourceLine.target = "_blank";
      sourceLine.rel = "noopener noreferrer";
      sourceLine.textContent = `מקור מוצע: ${draft.sources[0].label}`;
      card.appendChild(sourceLine);
    }

    card.appendChild(actions);
    dom.draftsList.appendChild(card);
  });
}

function approveDraft(draftId) {
  const drafts = readStorage(STORAGE_KEYS.drafts, []);
  const target = drafts.find((item) => item.id === draftId);
  if (!target) {
    return;
  }

  const quality = evaluateDraftQuality(target);
  if (!quality.isReadyToApprove) {
    showMessage(
      dom.activityFormMsg,
      "לא ניתן לאשר: טיוטה לא עברה את צ'קליסט האיכות (למשל שאלה מבוססת תאריך בלבד או הסבר חלש).",
      false,
    );
    renderDrafts();
    return;
  }

  const remainingDrafts = drafts.filter((item) => item.id !== draftId);
  const customQuestions = readStorage(STORAGE_KEYS.customQuestions, []);

  const customQuestion = {
    ...target,
    id: uid("cq"),
    optionExplanations: ensureOptionExplanations(target),
    approvedAt: new Date().toISOString(),
    allowLegacySuccess: target.kind === "success" && target.date < MIN_CONTENT_DATE,
  };

  const savedDrafts = writeStorage(STORAGE_KEYS.drafts, remainingDrafts);
  const savedCustom = writeStorage(
    STORAGE_KEYS.customQuestions,
    [customQuestion, ...customQuestions].slice(0, 500),
  );
  if (!savedDrafts || !savedCustom) {
    showMessage(
      dom.activityFormMsg,
      "אישור הטיוטה נכשל בגלל מגבלת אחסון בדפדפן. נסה לצמצם נתונים.",
      false,
    );
    return;
  }

  adminState.lastLongTextBatchDraftIds = adminState.lastLongTextBatchDraftIds
    .filter((item) => item !== draftId);
  dom.approveAllTextDraftsBtn.disabled = adminState.lastLongTextBatchDraftIds.length === 0;

  renderAdminStats();
  renderDrafts();
  renderCustomQuestions();
  renderAllQuestionsManager();
  renderLongTextDraftsPreview();
}

function rejectDraft(draftId) {
  const drafts = readStorage(STORAGE_KEYS.drafts, []);
  const remaining = drafts.filter((item) => item.id !== draftId);
  const saved = writeStorage(STORAGE_KEYS.drafts, remaining);
  if (!saved) {
    showMessage(
      dom.activityFormMsg,
      "דחיית הטיוטה נכשלה בגלל מגבלת אחסון בדפדפן.",
      false,
    );
    return;
  }

  adminState.lastLongTextBatchDraftIds = adminState.lastLongTextBatchDraftIds
    .filter((item) => item !== draftId);
  dom.approveAllTextDraftsBtn.disabled = adminState.lastLongTextBatchDraftIds.length === 0;

  renderAdminStats();
  renderDrafts();
  renderAllQuestionsManager();
  renderLongTextDraftsPreview();
}

function renderDraftQualityChecklist(quality) {
  const list = document.createElement("ul");
  list.className = "quality-checklist";

  quality.checks.forEach((check) => {
    const item = document.createElement("li");
    item.className = `quality-item ${check.pass ? "pass" : "fail"}`;

    const requiredTag = check.required ? " (חובה)" : " (מומלץ)";
    item.textContent = `${check.pass ? "✓" : "✕"} ${check.label}${requiredTag}`;
    list.appendChild(item);
  });

  return list;
}

function evaluateDraftQuality(draft) {
  const questionText = normalizeSpace(draft?.question);
  const explanationText = normalizeSpace(draft?.explanation);
  const options = Array.isArray(draft?.options)
    ? draft.options.map((option) => normalizeSpace(option)).filter(Boolean)
    : [];
  const uniqueOptions = new Set(options.map((option) => option.toLowerCase()));
  const answerIndex = Number(draft?.answer);
  const validAnswer = Number.isInteger(answerIndex) && answerIndex >= 0 && answerIndex < options.length;
  const hasSource = Array.isArray(draft?.sources) && draft.sources.some((source) => normalizeSpace(source?.url));
  const notDateOnly = !isDateOnlyQuestion(questionText);

  const checks = [
    {
      key: "question_len",
      label: "ניסוח ברור ומלמד (לא קצר מדי)",
      pass: questionText.length >= QUALITY_MIN_QUESTION_LEN,
      required: true,
    },
    {
      key: "not_date_only",
      label: "השאלה אינה מבוססת רק על תאריך",
      pass: notDateOnly,
      required: true,
    },
    {
      key: "options_count",
      label: "יש לפחות 4 אפשרויות תשובה",
      pass: options.length >= 4,
      required: true,
    },
    {
      key: "options_unique",
      label: "אפשרויות התשובה שונות זו מזו",
      pass: uniqueOptions.size >= 4,
      required: true,
    },
    {
      key: "answer_valid",
      label: "תשובה נכונה מוגדרת באופן תקין",
      pass: validAnswer,
      required: true,
    },
    {
      key: "explanation_len",
      label: "הסבר תשובה מפורט ללמידה",
      pass: explanationText.length >= QUALITY_MIN_EXPLANATION_LEN,
      required: true,
    },
    {
      key: "has_source",
      label: "מצורף מקור לבדיקה",
      pass: hasSource,
      required: false,
    },
  ];

  const isReadyToApprove = checks.filter((item) => item.required).every((item) => item.pass);
  return { checks, isReadyToApprove };
}

function isDateOnlyQuestion(questionText) {
  const text = normalizeSpace(questionText).toLowerCase();
  if (!text) {
    return true;
  }

  const asksDateDirectly = /(?:^|\s)(מתי|באיזה תאריך|מה התאריך|באיזה יום|באיזה חודש|באיזו שנה|באיזה שנה)(?:\s|$)/.test(
    text,
  );
  const dateLikeTokens =
    (text.match(/\b20\d{2}\b/g) || []).length +
    (text.match(/\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?/g) || []).length;
  const educationalHits = EDUCATIONAL_KEYWORDS.filter((keyword) =>
    text.includes(keyword.toLowerCase()),
  ).length;
  const conceptualPrompt = /(?:מה התוצאה|מה המשמעות|למה|איזו פעולה|איזה שינוי|מה הייתה הדרישה|מה הייתה הביקורת|מה המסקנה)/.test(
    text,
  );

  if (!asksDateDirectly) {
    return false;
  }

  if (conceptualPrompt || educationalHits > 0) {
    return false;
  }

  return dateLikeTokens > 0 || text.length <= 80;
}

function normalizeSpace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function looksLikeDateOption(text) {
  const value = normalizeSpace(text);
  return /^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/.test(value);
}

function looksLikeNumericOption(text) {
  const value = normalizeSpace(text);
  if (!value) {
    return false;
  }

  if (/^\d{1,3}(?:,\d{3})*$/.test(value)) {
    return true;
  }

  return /^\d+$/.test(value);
}

function inferExpectedOptionShape(questionText, answerText) {
  const safeQuestionText = normalizeSpace(questionText).toLowerCase();
  const safeAnswerText = normalizeSpace(answerText);

  if (looksLikeDateOption(safeAnswerText)) {
    return "date";
  }

  const asksNumeric = /(?:^|\s)(כמה|יעד|מספר|לכמה|כמה\s+זמן)(?:\s|$)/.test(safeQuestionText);
  if (asksNumeric && looksLikeNumericOption(safeAnswerText)) {
    return "number";
  }

  return "text";
}

function countWords(text) {
  return normalizeSpace(text).split(" ").filter(Boolean).length;
}

function isDistractorQualityAcceptable(optionText, shape) {
  const value = normalizeSpace(optionText);
  if (!value) {
    return false;
  }

  if (shape === "date") {
    return looksLikeDateOption(value);
  }

  if (shape === "number") {
    return looksLikeNumericOption(value);
  }

  if (value.length < 8 || countWords(value) < 2) {
    return false;
  }

  return !LOW_QUALITY_DISTRACTOR_PATTERNS.some((pattern) => pattern.test(value));
}

function getAuditIssueWeight(level) {
  if (level === "high") {
    return 2;
  }
  return 1;
}

function getAuditLevelLabel(level) {
  return level === "high" ? "חמור" : "בינוני";
}

function summarizeAuditIssueLevel(issues) {
  if (!Array.isArray(issues) || !issues.length) {
    return "none";
  }
  return issues.some((issue) => issue.level === "high") ? "high" : "medium";
}

function auditSingleQuestionDetailed(question) {
  const safeQuestion = question || {};
  const questionText = normalizeSpace(safeQuestion.question);
  const explanationText = normalizeSpace(safeQuestion.explanation);
  const options = sanitizeOptionsList(safeQuestion.options);
  const answerIndex = resolveAnswerIndex(
    safeQuestion.answer,
    options,
    safeQuestion.options,
  );
  const correctAnswer = options[answerIndex] || "";
  const issues = [];

  if (questionText.length < QUALITY_MIN_QUESTION_LEN) {
    issues.push({ level: "medium", message: "נוסח השאלה קצר מדי" });
  }

  if (isDateOnlyQuestion(questionText)) {
    issues.push({ level: "medium", message: "השאלה מבוססת בעיקר על תאריך ללא ערך מושגי" });
  }

  if (options.length < 4) {
    issues.push({ level: "high", message: "פחות מ-4 אפשרויות תשובה" });
  }

  if (new Set(options.map((option) => option.toLowerCase())).size < 4) {
    issues.push({ level: "high", message: "יש כפילות בין אפשרויות התשובה" });
  }

  if (!correctAnswer) {
    issues.push({ level: "high", message: "תשובה נכונה לא מוגדרת באופן תקין" });
  }

  if (explanationText.length < QUALITY_MIN_EXPLANATION_LEN) {
    issues.push({ level: "medium", message: "הסבר התשובה קצר מדי" });
  }

  const normalizedSources = normalizeQuestionSources(safeQuestion.sources, safeQuestion);
  const hasAnySource = normalizedSources.length > 0;
  if (!hasAnySource) {
    issues.push({ level: "high", message: "אין מקור תקין לשאלה" });
  } else {
    const hasPreciseSource = normalizedSources.some((source) => {
      const registry = getSourceRegistryEntry(source, safeQuestion);
      if (normalizeSpace(registry?.canonicalUrl)) {
        return true;
      }
      const directHref = buildDirectSourceHref(source, safeQuestion);
      return Boolean(directHref && !isLikelyBrokenMqgSourceUrl(directHref));
    });
    if (!hasPreciseSource) {
      issues.push({ level: "medium", message: "המקור אינו ממוקד דיו ודורש אימות ידני" });
    }
  }

  const shape = inferExpectedOptionShape(questionText, correctAnswer);
  const weakDistractors = [];
  options.forEach((optionText, index) => {
    if (index === answerIndex) {
      return;
    }
    if (!isDistractorQualityAcceptable(optionText, shape)) {
      weakDistractors.push(optionText);
    }
  });
  weakDistractors.slice(0, 2).forEach((optionText) => {
    issues.push({
      level: "medium",
      message: `מסיח חלש או לא עקבי: "${clampText(optionText, 40)}"`,
    });
  });
  if (weakDistractors.length > 2) {
    issues.push({
      level: "medium",
      message: `נמצאו עוד ${weakDistractors.length - 2} מסיחים חלשים נוספים`,
    });
  }

  if (shape === "number" && options.length >= 4 && options.every((optionText) => looksLikeNumericOption(optionText))) {
    issues.push({ level: "medium", message: "אפשרויות מספריות בלבד - מומלץ להוסיף הקשר טקסטואלי" });
  }

  return {
    id: normalizeSpace(safeQuestion.id) || "unknown",
    issues,
  };
}

function auditSingleQuestionContent(question) {
  const detailed = auditSingleQuestionDetailed(question);
  return {
    id: detailed.id,
    issues: detailed.issues.map((issue) => issue.message),
  };
}

function auditQuestionBankContent(questions) {
  const sourceList = Array.isArray(questions) ? questions : [];
  const issuesById = {};
  let totalIssues = 0;

  sourceList.forEach((question) => {
    const audit = auditSingleQuestionContent(question);
    if (!audit.issues.length) {
      return;
    }
    issuesById[audit.id] = audit.issues;
    totalIssues += audit.issues.length;
  });

  return {
    reviewedCount: sourceList.length,
    totalIssues,
    issuesById,
  };
}

function getQuestionQualityIssues(question) {
  const baseId = getBaseQuestionId(question);
  if (baseId && BASE_QUESTION_CONTENT_AUDIT.issuesById[baseId]) {
    return BASE_QUESTION_CONTENT_AUDIT.issuesById[baseId];
  }

  return auditSingleQuestionContent(question).issues;
}

function buildQuestionAuditFingerprint(inventory) {
  const safeInventory = inventory || getQuestionInventory();
  const questionSignature = safeInventory.allQuestions
    .map((question) => {
      const optionsText = sanitizeOptionsList(question.options).join("|");
      const sourcesText = normalizeQuestionSources(question.sources, question)
        .map((source) => `${normalizeSpace(source.label)}|${normalizeSpace(source.url)}`)
        .join("|");
      return [
        normalizeSpace(question.id),
        normalizeSpace(question.question),
        normalizeSpace(question.learn),
        normalizeSpace(question.explanation),
        optionsText,
        String(question.answer),
        sourcesText,
      ].join("~~");
    })
    .sort()
    .join("###");

  const disabledIdsText = Array.from(safeInventory.disabledIds || [])
    .sort()
    .join("|");
  return `${questionSignature}@@${disabledIdsText}`;
}

function buildQuestionBankAuditReport(inventory) {
  const safeInventory = inventory || getQuestionInventory();
  const findings = [];
  let highIssueCount = 0;
  let mediumIssueCount = 0;

  safeInventory.allQuestions.forEach((question) => {
    const detailed = auditSingleQuestionDetailed(question);
    if (!detailed.issues.length) {
      return;
    }

    detailed.issues.forEach((issue) => {
      if (issue.level === "high") {
        highIssueCount += 1;
      } else {
        mediumIssueCount += 1;
      }
    });

    findings.push({
      id: detailed.id,
      question: normalizeSpace(question.question),
      category: normalizeSpace(question.category) || "ללא קטגוריה",
      disabled: safeInventory.disabledIds.has(detailed.id),
      issues: detailed.issues,
      level: summarizeAuditIssueLevel(detailed.issues),
    });
  });

  findings.sort((a, b) => {
    const levelDiff = getAuditIssueWeight(b.level) - getAuditIssueWeight(a.level);
    if (levelDiff !== 0) {
      return levelDiff;
    }
    return a.id.localeCompare(b.id, "he");
  });

  const highQuestionCount = findings.filter((item) => item.level === "high").length;
  const reportLevel = findings.length === 0
    ? "ready"
    : highQuestionCount > 0
      ? "blocked"
      : "warning";

  return {
    generatedAt: new Date().toISOString(),
    reviewedCount: safeInventory.allQuestions.length,
    activeCount: safeInventory.activeQuestions.length,
    hiddenCount: safeInventory.disabledIds.size,
    findings,
    highIssueCount,
    mediumIssueCount,
    highQuestionCount,
    warningQuestionCount: Math.max(0, findings.length - highQuestionCount),
    reportLevel,
    fingerprint: buildQuestionAuditFingerprint(safeInventory),
  };
}

function setQuestionAuditStatus(text, tone) {
  dom.questionAuditStatus.textContent = text;
  dom.questionAuditStatus.classList.remove("hidden", "ok", "warn");
  if (tone === "ok") {
    dom.questionAuditStatus.classList.add("ok");
  } else if (tone === "warn") {
    dom.questionAuditStatus.classList.add("warn");
  }
}

function clearQuestionAuditStatus() {
  dom.questionAuditStatus.textContent = "";
  dom.questionAuditStatus.classList.add("hidden");
  dom.questionAuditStatus.classList.remove("ok", "warn");
}

function runQuestionBankAudit() {
  const inventory = getQuestionInventory();
  adminState.questionAuditReport = buildQuestionBankAuditReport(inventory);
  renderQuestionAuditReport(inventory);
}

function clearQuestionBankAuditReport() {
  adminState.questionAuditReport = null;
  renderQuestionAuditReport(getQuestionInventory());
}

function renderQuestionAuditReport(inventoryInput) {
  const inventory = inventoryInput || getQuestionInventory();
  const report = adminState.questionAuditReport;
  dom.questionAuditResults.innerHTML = "";

  if (!report) {
    dom.questionAuditResults.classList.add("hidden");
    clearQuestionAuditStatus();
    return;
  }

  const isStale = report.fingerprint !== buildQuestionAuditFingerprint(inventory);
  if (isStale) {
    setQuestionAuditStatus("דוח ה-Audit לא מעודכן: המאגר השתנה מאז הריצה האחרונה. מומלץ להריץ שוב.", "warn");
  } else if (report.reportLevel === "ready") {
    setQuestionAuditStatus("Audit הושלם: המאגר מוכן לפרסום.", "ok");
  } else if (report.reportLevel === "warning") {
    setQuestionAuditStatus(
      `Audit הושלם: נמצאו ${report.findings.length} שאלות לשיפור (ללא חריגות קריטיות).`,
      "warn",
    );
  } else {
    setQuestionAuditStatus(
      `Audit הושלם: נמצאו ${report.highQuestionCount} שאלות עם חריגות קריטיות. לא מומלץ לפרסם עדיין.`,
      "bad",
    );
  }

  dom.questionAuditResults.classList.remove("hidden");

  const summaryCard = document.createElement("article");
  summaryCard.className = "info-card audit-summary";

  const summaryTitle = document.createElement("h4");
  summaryTitle.textContent = "סיכום Audit";

  const generatedAt = new Date(report.generatedAt);
  const generatedAtText = Number.isNaN(generatedAt.getTime())
    ? report.generatedAt
    : generatedAt.toLocaleString("he-IL");

  const summaryMeta = document.createElement("p");
  summaryMeta.className = "muted";
  summaryMeta.textContent =
    `נבדקו ${report.reviewedCount} שאלות ` +
    `(פעילות: ${report.activeCount}, מוסתרות: ${report.hiddenCount}) | ` +
    `חריגות חמורות: ${report.highIssueCount}, חריגות בינוניות: ${report.mediumIssueCount} | ` +
    `עודכן: ${generatedAtText}`;

  summaryCard.appendChild(summaryTitle);
  summaryCard.appendChild(summaryMeta);
  dom.questionAuditResults.appendChild(summaryCard);

  if (!report.findings.length) {
    return;
  }

  report.findings.forEach((finding) => {
    const card = document.createElement("article");
    card.className = "info-card audit-item";

    const badgeRow = document.createElement("div");
    badgeRow.className = "badge-row";

    const levelBadge = document.createElement("span");
    levelBadge.className = `badge audit-level ${finding.level === "high" ? "bad" : "warn"}`;
    levelBadge.textContent = `רמת חומרה: ${getAuditLevelLabel(finding.level)}`;

    const statusBadge = document.createElement("span");
    statusBadge.className = "badge";
    statusBadge.textContent = finding.disabled ? "מוסתרת מהמשחק" : "פעילה במשחק";

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "badge";
    categoryBadge.textContent = finding.category;

    badgeRow.appendChild(levelBadge);
    badgeRow.appendChild(statusBadge);
    badgeRow.appendChild(categoryBadge);

    const title = document.createElement("h4");
    title.textContent = finding.question || `שאלה ${finding.id}`;

    const idLine = document.createElement("p");
    idLine.className = "muted";
    idLine.textContent = `מזהה: ${finding.id}`;

    const issuesList = document.createElement("ul");
    issuesList.className = "quality-checklist";
    finding.issues.forEach((issue) => {
      const item = document.createElement("li");
      item.className = "quality-item fail";
      item.textContent = `✕ [${getAuditLevelLabel(issue.level)}] ${issue.message}`;
      issuesList.appendChild(item);
    });

    const actions = document.createElement("div");
    actions.className = "inline-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "ghost-btn";
    editBtn.textContent = "ערוך שאלה";
    editBtn.addEventListener("click", () => editQuestion(finding.id));

    actions.appendChild(editBtn);

    card.appendChild(badgeRow);
    card.appendChild(title);
    card.appendChild(idLine);
    card.appendChild(issuesList);
    card.appendChild(actions);
    dom.questionAuditResults.appendChild(card);
  });
}

function renderCustomQuestions() {
  const customQuestions = readStorage(STORAGE_KEYS.customQuestions, []);
  dom.customQuestionsList.innerHTML = "";

  if (!customQuestions.length) {
    dom.customQuestionsList.appendChild(makeInfoMessage("אין עדיין שאלות מותאמות שאושרו."));
    return;
  }

  customQuestions.forEach((question) => {
    const card = document.createElement("article");
    card.className = "info-card";

    const title = document.createElement("h4");
    title.textContent = question.question;

    const badgeRow = document.createElement("div");
    badgeRow.className = "badge-row";

    const dateBadge = document.createElement("span");
    dateBadge.className = "badge";
    dateBadge.textContent = formatDateDisplay(question.date);

    const categoryBadge = document.createElement("span");
    categoryBadge.className = "badge";
    categoryBadge.textContent = question.category;

    badgeRow.appendChild(dateBadge);
    badgeRow.appendChild(categoryBadge);

    const answerLine = document.createElement("p");
    answerLine.textContent = `תשובה נכונה: ${question.options[question.answer]}`;

    card.appendChild(title);
    card.appendChild(badgeRow);
    card.appendChild(answerLine);

    if (Array.isArray(question.sources) && question.sources.length) {
      const source = document.createElement("a");
      source.href = buildPreferredSourceHref(question.sources[0], question);
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = `מקור: ${question.sources[0].label}`;
      card.appendChild(source);
    }

    dom.customQuestionsList.appendChild(card);
  });
}

function renderAllQuestionsManager() {
  const inventory = getQuestionInventory();
  const searchText = String(dom.questionSearchInput.value || "").trim().toLowerCase();

  const filtered = inventory.allQuestions.filter((question) => {
    if (!searchText) {
      return true;
    }
    const sourceText = Array.isArray(question.sources)
      ? question.sources.map((source) => `${source.label} ${source.url}`).join(" ")
      : "";
    const haystack = `${question.question} ${question.learn} ${question.explanation} ${sourceText}`.toLowerCase();
    return haystack.includes(searchText);
  });

  dom.allQuestionsList.innerHTML = "";

  if (!filtered.length) {
    dom.allQuestionsList.appendChild(makeInfoMessage("לא נמצאו שאלות לפי החיפוש."));
    renderQuestionAuditReport(inventory);
    return;
  }

  const renderCap = 160;
  const visibleList = filtered.slice(0, renderCap);
  visibleList.forEach((question) => {
    const disabled = inventory.disabledIds.has(question.id);
    const card = document.createElement("article");
    card.className = "info-card";

    const title = document.createElement("h4");
    title.textContent = question.question;

    const answerLine = document.createElement("p");
    answerLine.textContent = `תשובה נכונה: ${question.options[question.answer]}`;

    const metaLine = document.createElement("p");
    metaLine.textContent = disabled
      ? "סטטוס: מוסתר מהמשחק"
      : "סטטוס: פעיל במשחק";

    const qualityIssues = getQuestionQualityIssues(question);
    const qualityLine = document.createElement("p");
    qualityLine.className = "muted";
    qualityLine.textContent = qualityIssues.length
      ? `איכות תוכן: דורש שיפור (${qualityIssues[0]})`
      : "איכות תוכן: תקין (ניסוח, תשובה, מסיחים ומקור)";

    const actionRow = document.createElement("div");
    actionRow.className = "inline-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "ghost-btn";
    editBtn.textContent = "ערוך";
    editBtn.addEventListener("click", () => editQuestion(question.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = disabled ? "secondary-btn" : "ghost-btn";
    deleteBtn.textContent = disabled ? "החזר למשחק" : "הסר מהמאגר";
    deleteBtn.addEventListener("click", () => {
      if (disabled) {
        restoreQuestion(question.id);
      } else {
        removeQuestion(question.id);
      }
    });

    actionRow.appendChild(editBtn);
    actionRow.appendChild(deleteBtn);

    card.appendChild(title);
    card.appendChild(answerLine);
    card.appendChild(metaLine);
    card.appendChild(qualityLine);
    card.appendChild(actionRow);
    dom.allQuestionsList.appendChild(card);
  });

  if (filtered.length > renderCap) {
    const note = document.createElement("p");
    note.className = "muted";
    note.textContent = `מוצגות ${renderCap} שאלות ראשונות מתוך ${filtered.length}. השתמש בחיפוש לסינון מדויק.`;
    dom.allQuestionsList.appendChild(note);
  }

  renderQuestionAuditReport(inventory);
}

function getQuestionInventory() {
  const custom = readStorage(STORAGE_KEYS.customQuestions, []);
  const disabledIds = new Set(readStorage(STORAGE_KEYS.disabledQuestionIds, []));
  const overrides = readObjectStorage(STORAGE_KEYS.questionOverrides, {});

  const rawPool = [...EXPANDED_BASE_QUESTIONS, ...custom];
  const uniqueById = new Map();
  rawPool.forEach((question) => {
    if (!question?.id) {
      return;
    }
    if (!uniqueById.has(question.id)) {
      uniqueById.set(question.id, question);
      return;
    }

    const existing = uniqueById.get(question.id);
    if (existing?.isGeneratedVariant && !question?.isGeneratedVariant) {
      uniqueById.set(question.id, question);
    }
  });

  const allQuestions = Array.from(uniqueById.values()).map((question) =>
    applyQuestionOverride(question, overrides[question.id]),
  );

  const activeQuestions = allQuestions.filter((question) => !disabledIds.has(question.id));

  return { allQuestions, activeQuestions, disabledIds };
}

function applyQuestionOverride(question, override) {
  if (!override || typeof override !== "object") {
    return question;
  }

  const merged = {
    ...question,
    ...override,
  };

  if (!Array.isArray(merged.options) || merged.options.length < 2) {
    merged.options = question.options;
  }
  if (typeof merged.answer !== "number" || merged.answer < 0 || merged.answer > merged.options.length - 1) {
    merged.answer = question.answer;
  }
  merged.optionExplanations = ensureOptionExplanations(merged);

  return merged;
}

function removeQuestion(questionId) {
  const inventory = getQuestionInventory();
  const target = inventory.allQuestions.find((question) => question.id === questionId);
  if (!target) {
    return;
  }

  const custom = readStorage(STORAGE_KEYS.customQuestions, []);
  const isCustom = custom.some((question) => question.id === questionId);
  if (isCustom) {
    const nextCustom = custom.filter((question) => question.id !== questionId);
    const saved = writeStorage(STORAGE_KEYS.customQuestions, nextCustom);
    if (!saved) {
      showMessage(dom.activityFormMsg, "מחיקת השאלה נכשלה.", false);
      return;
    }
  } else {
    const disabledIds = new Set(readStorage(STORAGE_KEYS.disabledQuestionIds, []));
    disabledIds.add(questionId);
    const saved = writeStorage(STORAGE_KEYS.disabledQuestionIds, Array.from(disabledIds));
    if (!saved) {
      showMessage(dom.activityFormMsg, "הסתרת השאלה נכשלה.", false);
      return;
    }
  }

  renderAdminStats();
  renderCustomQuestions();
  renderAllQuestionsManager();
}

function restoreQuestion(questionId) {
  const disabledIds = new Set(readStorage(STORAGE_KEYS.disabledQuestionIds, []));
  if (!disabledIds.has(questionId)) {
    return;
  }
  disabledIds.delete(questionId);
  const saved = writeStorage(STORAGE_KEYS.disabledQuestionIds, Array.from(disabledIds));
  if (!saved) {
    showMessage(dom.activityFormMsg, "שחזור השאלה נכשל.", false);
    return;
  }

  renderAdminStats();
  renderAllQuestionsManager();
}

function editQuestion(questionId) {
  const inventory = getQuestionInventory();
  const question = inventory.allQuestions.find((item) => item.id === questionId);
  if (!question) {
    return;
  }

  const newQuestionText = window.prompt("עריכת נוסח השאלה:", question.question);
  if (newQuestionText === null) {
    return;
  }
  const newLearn = window.prompt("עריכת רקע קצר:", question.learn || "");
  if (newLearn === null) {
    return;
  }
  const newExplanation = window.prompt("עריכת הסבר תשובה:", question.explanation || "");
  if (newExplanation === null) {
    return;
  }

  const newOptions = [];
  for (let i = 0; i < question.options.length; i += 1) {
    const edited = window.prompt(`אפשרות ${i + 1}:`, question.options[i] || "");
    if (edited === null) {
      return;
    }
    newOptions.push(String(edited).trim() || question.options[i]);
  }

  const answerInput = window.prompt(
    `מספר התשובה הנכונה (1-${newOptions.length}):`,
    String((question.answer || 0) + 1),
  );
  if (answerInput === null) {
    return;
  }
  const parsedAnswer = Number(answerInput);
  if (!Number.isInteger(parsedAnswer) || parsedAnswer < 1 || parsedAnswer > newOptions.length) {
    window.alert("מספר תשובה לא תקין.");
    return;
  }

  const overrideMap = readObjectStorage(STORAGE_KEYS.questionOverrides, {});
  overrideMap[questionId] = {
    question: String(newQuestionText).trim() || question.question,
    learn: String(newLearn).trim() || question.learn,
    explanation: String(newExplanation).trim() || question.explanation,
    options: newOptions,
    answer: parsedAnswer - 1,
  };

  const saved = writeStorage(STORAGE_KEYS.questionOverrides, overrideMap);
  if (!saved) {
    showMessage(dom.activityFormMsg, "עריכת השאלה נכשלה.", false);
    return;
  }

  renderAllQuestionsManager();
}

function markLongTextAsChangedAfterAnalysis() {
  if (!adminState.longTextAnalysis) {
    return;
  }

  const currentText = normalizeLongTextInput(dom.longTextInput.value);
  if (currentText === adminState.longTextAnalysis.normalizedText) {
    return;
  }

  adminState.longTextAnalysis = null;
  adminState.lastLongTextBatchDraftIds = [];
  dom.generateLongTextDraftsBtn.disabled = true;
  dom.approveAllTextDraftsBtn.disabled = true;
  hideMessage(dom.longTextMsg);
  renderLongTextDraftsPreview();
}

function normalizeLongTextInput(rawText) {
  return String(rawText || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function splitLongTextToSentences(text) {
  const compact = normalizeLongTextInput(text).replace(/\n+/g, " ");
  if (!compact) {
    return [];
  }

  const rough = compact.match(/[^.!?]+[.!?]?/g) || [compact];
  return rough
    .map((line) => normalizeSpace(line))
    .map((line) => line.replace(/[.!?]+$/, "").trim())
    .filter((line) => line.length >= 36 && countWords(line) >= 6);
}

function splitLongTextToParagraphs(text) {
  return normalizeLongTextInput(text)
    .split(/\n{2,}/)
    .map((line) => normalizeSpace(line))
    .filter(Boolean);
}

function extractFactsFromLongText(text, minCount) {
  const target = Math.max(3, Number(minCount) || 3);
  const sentences = splitLongTextToSentences(text);
  const unique = [];
  const seen = new Set();

  sentences.forEach((sentence) => {
    const safe = clampText(sentence, 180);
    const key = safe.toLowerCase();
    if (!safe || seen.has(key)) {
      return;
    }
    seen.add(key);
    unique.push(safe);
  });

  if (unique.length >= target) {
    return unique;
  }

  const words = normalizeLongTextInput(text).replace(/\n+/g, " ").split(" ").filter(Boolean);
  for (let i = 0; i < words.length && unique.length < target; i += 18) {
    const chunk = normalizeSpace(words.slice(i, i + 24).join(" "));
    if (chunk.length < 48 || countWords(chunk) < 8) {
      continue;
    }
    const safe = clampText(chunk, 180);
    const key = safe.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(safe);
  }

  return unique;
}

function analyzeLongTextContent(text) {
  const normalizedText = normalizeLongTextInput(text);
  const words = normalizedText.split(/\s+/).filter(Boolean);
  const paragraphs = splitLongTextToParagraphs(normalizedText);
  const facts = extractFactsFromLongText(normalizedText, 18);
  const sentenceCount = splitLongTextToSentences(normalizedText).length;

  return {
    normalizedText,
    wordsCount: words.length,
    charsCount: normalizedText.length,
    paragraphs,
    sentenceCount,
    facts,
    analyzedAt: new Date().toISOString(),
    textHash: hashText(normalizedText),
  };
}

async function handleLongTextFileUpload(event) {
  const file = event?.target?.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    dom.longTextInput.value = normalizeLongTextInput(text);
    adminState.longTextAnalysis = null;
    adminState.lastLongTextBatchDraftIds = [];
    dom.generateLongTextDraftsBtn.disabled = true;
    dom.approveAllTextDraftsBtn.disabled = true;
    showMessage(dom.longTextMsg, `הקובץ "${file.name}" נטען. לחץ על "קרא והבן את הכל".`, true);
    renderLongTextDraftsPreview();
  } catch (_err) {
    showMessage(dom.longTextMsg, "טעינת קובץ הטקסט נכשלה.", false);
  } finally {
    dom.longTextFileInput.value = "";
  }
}

function analyzeLongTextInput() {
  hideMessage(dom.longTextMsg);
  const normalizedText = normalizeLongTextInput(dom.longTextInput.value);
  if (normalizedText.length < LONG_TEXT_MIN_CHARS) {
    showMessage(
      dom.longTextMsg,
      `הטקסט קצר מדי ליצירת שאלות איכותיות. נדרש מינימום ${LONG_TEXT_MIN_CHARS} תווים.`,
      false,
    );
    dom.generateLongTextDraftsBtn.disabled = true;
    return;
  }

  const analysis = analyzeLongTextContent(normalizedText);
  if (analysis.facts.length < 5) {
    showMessage(dom.longTextMsg, "לא זוהו מספיק עובדות בטקסט. הוסף פרטים ונסה שוב.", false);
    dom.generateLongTextDraftsBtn.disabled = true;
    return;
  }

  adminState.longTextAnalysis = analysis;
  adminState.lastLongTextBatchDraftIds = [];
  dom.generateLongTextDraftsBtn.disabled = false;
  dom.approveAllTextDraftsBtn.disabled = true;
  showMessage(
    dom.longTextMsg,
    `הטקסט נותח בהצלחה: ${analysis.wordsCount} מילים, ${analysis.sentenceCount} משפטים, ${analysis.facts.length} עובדות שמישות.`,
    true,
  );
  renderLongTextDraftsPreview();
}

function buildLongTextTopic(text) {
  const words = normalizeSpace(text).split(" ").filter(Boolean);
  return words.slice(0, 6).join(" ");
}

function mutateFactNumber(text, variant) {
  let mutated = false;
  const output = String(text).replace(/\d{1,4}(?:,\d{3})*/g, (match) => {
    if (mutated) {
      return match;
    }
    const numeric = Number(match.replace(/,/g, ""));
    if (!Number.isFinite(numeric)) {
      return match;
    }
    mutated = true;
    const delta = (variant % 2 === 0 ? 3 : 7) + variant;
    return String(numeric + delta);
  });
  return mutated ? output : text;
}

function mutateFactByRules(text, variant) {
  const rules = [
    ["אושר", "נדחה"],
    ["נדחה", "אושר"],
    ["התקבל", "נפסל"],
    ["נפסל", "התקבל"],
    ["הוגדל", "הוקטן"],
    ["הוקטן", "הוגדל"],
    ["הוקפא", "הואץ"],
    ["נקבע", "בוטל"],
    ["הממשלה", "הכנסת"],
    ["בג\"ץ", "בית משפט מחוזי"],
    ["התנועה", "גורם אחר"],
    ["המדינה", "רשות מקומית"],
    ["חובה", "רשות"],
  ];

  for (let i = 0; i < rules.length; i += 1) {
    const [from, to] = rules[(i + variant) % rules.length];
    if (text.includes(from)) {
      return text.replace(from, to);
    }
  }

  return text;
}

function mutateFactToDistractor(factText, variant) {
  const fact = normalizeSpace(factText);
  if (!fact) {
    return "";
  }

  const withNumberTwist = mutateFactNumber(fact, variant);
  const withRuleTwist = mutateFactByRules(withNumberTwist, variant);
  if (withRuleTwist !== fact) {
    return clampText(withRuleTwist, 120);
  }

  const topic = buildLongTextTopic(fact);
  const fallbackLines = [
    `בהקשר של "${topic}", נטען שהמהלך בוטל לפני יישום.`,
    `לפי הטקסט, בנושא "${topic}" הוחלט לדחות את הביצוע ללא מועד חדש.`,
    `בהמשך ל-"${topic}", צוין כי לא נקבעה מסגרת יישום מחייבת.`,
  ];
  return fallbackLines[variant % fallbackLines.length];
}

function buildLongTextDistractors(correctFact, allFacts) {
  const unique = new Set();
  const output = [];

  const candidates = [];
  for (let i = 0; i < 4; i += 1) {
    candidates.push(mutateFactToDistractor(correctFact, i + 1));
  }

  const alternateFacts = pickRandom(
    allFacts.filter((item) => normalizeSpace(item) !== normalizeSpace(correctFact)),
    6,
  );
  alternateFacts.forEach((fact, idx) => {
    candidates.push(mutateFactToDistractor(fact, idx + 3));
  });

  candidates.forEach((candidate) => {
    const safe = clampText(normalizeSpace(candidate), 120);
    if (!safe || safe === normalizeSpace(correctFact)) {
      return;
    }
    const key = safe.toLowerCase();
    if (unique.has(key)) {
      return;
    }
    unique.add(key);
    output.push(safe);
  });

  while (output.length < 3) {
    output.push(`בטקסט צוין שהמהלך נשאר ללא יישום מחייב בשלב זה (${output.length + 1}).`);
  }

  return output.slice(0, 3);
}

function buildSourcesFromLongTextInput(sourceLabel, sourceUrl, analysis) {
  if (!normalizeSpace(sourceUrl)) {
    return [];
  }

  return [
    {
      label: normalizeSpace(sourceLabel) || "מקור טקסט שהוזן",
      url: normalizeSpace(sourceUrl),
      anchorText: analysis?.facts?.[0] || clampText(analysis?.normalizedText || "", 120),
    },
  ];
}

function generateDraftsFromLongTextAnalysis(payload) {
  const {
    analysis,
    count,
    category,
    kind,
    date,
    sourceLabel,
    sourceUrl,
  } = payload;

  const safeCount = Math.min(15, Math.max(1, Number(count) || 5));
  const factsPool = pickRandom(analysis.facts.slice(), analysis.facts.length);
  const batchId = uid("text_batch");
  const drafts = [];
  const sourceList = buildSourcesFromLongTextInput(sourceLabel, sourceUrl, analysis);
  const learnBase = clampText(analysis.paragraphs[0] || analysis.facts[0] || analysis.normalizedText, 180);

  for (let i = 0; i < safeCount; i += 1) {
    const correctFact = factsPool[i % factsPool.length];
    const correctOption = clampText(correctFact, 120);
    const distractors = buildLongTextDistractors(correctFact, analysis.facts);
    const options = shuffleArray([correctOption, ...distractors]).slice(0, 4);
    const answer = options.indexOf(correctOption);
    const stem = LONG_TEXT_QUESTION_STEMS[i % LONG_TEXT_QUESTION_STEMS.length];
    const topic = buildLongTextTopic(correctFact);

    drafts.push({
      id: uid("draft"),
      originLongTextBatchId: batchId,
      kind,
      date,
      category,
      learn: `קטע רקע: ${learnBase}`,
      question: `${stem} (${topic})`,
      options,
      answer: answer >= 0 ? answer : 0,
      explanation: `בטקסט שהוזן מופיעה במפורש הטענה: ${correctOption}`,
      sources: sourceList,
    });
  }

  return { batchId, drafts };
}

function generateDraftsFromLongTextInput() {
  hideMessage(dom.longTextMsg);

  const normalizedText = normalizeLongTextInput(dom.longTextInput.value);
  if (!adminState.longTextAnalysis || adminState.longTextAnalysis.normalizedText !== normalizedText) {
    showMessage(dom.longTextMsg, "יש ללחוץ קודם על 'קרא והבן את הכל' אחרי עדכון הטקסט.", false);
    return;
  }

  const sourceUrl = normalizeSpace(dom.longTextSourceUrl.value);
  if (sourceUrl && !isValidUrl(sourceUrl)) {
    showMessage(dom.longTextMsg, "קישור המקור לא תקין. יש להזין URL מלא.", false);
    return;
  }

  const kind = normalizeSpace(dom.longTextKind.value) || "activity";
  const date = normalizeSpace(dom.longTextDate.value);
  const category = normalizeSpace(dom.longTextCategory.value) || "פעילות ציבורית";
  const count = Number(dom.longTextQuestionCount.value || 10);

  if (!date) {
    showMessage(dom.longTextMsg, "יש לבחור תאריך ייחוס לשאלות.", false);
    return;
  }

  if (kind === "activity" && date < MIN_CONTENT_DATE) {
    showMessage(
      dom.longTextMsg,
      "בשאלות מסוג פעילות, תאריך הייחוס חייב להיות 2025 ומעלה.",
      false,
    );
    return;
  }

  const generated = generateDraftsFromLongTextAnalysis({
    analysis: adminState.longTextAnalysis,
    count,
    category,
    kind,
    date,
    sourceLabel: normalizeSpace(dom.longTextSourceLabel.value),
    sourceUrl,
  });

  const existingDrafts = readStorage(STORAGE_KEYS.drafts, []);
  const mergedDrafts = [...generated.drafts, ...existingDrafts].slice(0, 500);
  const saved = writeStorage(STORAGE_KEYS.drafts, mergedDrafts);
  if (!saved) {
    showMessage(dom.longTextMsg, "יצירת הטיוטות נכשלה בגלל מגבלת אחסון בדפדפן.", false);
    return;
  }

  adminState.lastLongTextBatchDraftIds = generated.drafts.map((draft) => draft.id);
  dom.approveAllTextDraftsBtn.disabled = adminState.lastLongTextBatchDraftIds.length === 0;
  showMessage(
    dom.longTextMsg,
    `נוצרו ${generated.drafts.length} טיוטות מהטקסט. אפשר לאשר אחת-אחת או להוסיף את כולן בלחיצה אחת.`,
    true,
  );

  renderAdminStats();
  renderDrafts();
  renderLongTextDraftsPreview();
}

function approveDraftsBulk(draftIds) {
  const idSet = new Set((draftIds || []).map((id) => normalizeSpace(id)).filter(Boolean));
  if (!idSet.size) {
    return { approvedCount: 0, skippedCount: 0, remainingDraftIds: [] };
  }

  const drafts = readStorage(STORAGE_KEYS.drafts, []);
  const customQuestions = readStorage(STORAGE_KEYS.customQuestions, []);
  const nextCustom = customQuestions.slice();
  const remainingDrafts = [];
  const remainingBatch = [];
  let approvedCount = 0;
  let skippedCount = 0;

  drafts.forEach((draft) => {
    if (!idSet.has(normalizeSpace(draft.id))) {
      remainingDrafts.push(draft);
      return;
    }

    const quality = evaluateDraftQuality(draft);
    if (!quality.isReadyToApprove) {
      skippedCount += 1;
      remainingDrafts.push(draft);
      remainingBatch.push(draft.id);
      return;
    }

    approvedCount += 1;
    nextCustom.unshift({
      ...draft,
      id: uid("cq"),
      optionExplanations: ensureOptionExplanations(draft),
      approvedAt: new Date().toISOString(),
      allowLegacySuccess: draft.kind === "success" && draft.date < MIN_CONTENT_DATE,
    });
  });

  const savedDrafts = writeStorage(STORAGE_KEYS.drafts, remainingDrafts.slice(0, 500));
  const savedCustom = writeStorage(STORAGE_KEYS.customQuestions, nextCustom.slice(0, 500));
  if (!savedDrafts || !savedCustom) {
    return null;
  }

  return { approvedCount, skippedCount, remainingDraftIds: remainingBatch };
}

function approveAllLongTextDrafts() {
  hideMessage(dom.longTextMsg);
  const batchIds = adminState.lastLongTextBatchDraftIds.slice();
  if (!batchIds.length) {
    showMessage(dom.longTextMsg, "אין כרגע טיוטות מטקסט להוספה מרוכזת.", false);
    return;
  }

  const result = approveDraftsBulk(batchIds);
  if (!result) {
    showMessage(dom.longTextMsg, "הוספה מרוכזת נכשלה בגלל מגבלת אחסון בדפדפן.", false);
    return;
  }

  adminState.lastLongTextBatchDraftIds = result.remainingDraftIds;
  dom.approveAllTextDraftsBtn.disabled = adminState.lastLongTextBatchDraftIds.length === 0;

  showMessage(
    dom.longTextMsg,
    `הושלמה הוספה מרוכזת: ${result.approvedCount} שאלות נוספו למאגר. ${
      result.skippedCount ? `דולגו ${result.skippedCount} טיוטות שלא עברו צ'קליסט.` : ""
    }`,
    true,
  );

  renderAdminStats();
  renderDrafts();
  renderCustomQuestions();
  renderAllQuestionsManager();
  renderLongTextDraftsPreview();
}

function renderLongTextDraftsPreview() {
  if (!dom.longTextDraftsPreview) {
    return;
  }

  dom.longTextDraftsPreview.innerHTML = "";
  const idSet = new Set(adminState.lastLongTextBatchDraftIds);
  const allDrafts = readStorage(STORAGE_KEYS.drafts, []);
  const batchDrafts = allDrafts.filter((draft) => idSet.has(draft.id));

  if (batchDrafts.length) {
    batchDrafts.forEach((draft) => {
      const quality = evaluateDraftQuality(draft);
      const card = document.createElement("article");
      card.className = "info-card";

      const title = document.createElement("h4");
      title.textContent = draft.question;

      const answerLine = document.createElement("p");
      answerLine.textContent = `תשובה נכונה: ${draft.options[draft.answer]}`;

      const qualityLine = document.createElement("p");
      qualityLine.className = quality.isReadyToApprove ? "quality-summary ok" : "quality-summary bad";
      qualityLine.textContent = quality.isReadyToApprove
        ? "טיוטה מוכנה לאישור."
        : "טיוטה דורשת תיקונים לפני אישור.";

      const actions = document.createElement("div");
      actions.className = "inline-actions";

      const approveBtn = document.createElement("button");
      approveBtn.type = "button";
      approveBtn.className = "primary-btn";
      approveBtn.textContent = "אשר שאלה זו";
      approveBtn.disabled = !quality.isReadyToApprove;
      approveBtn.addEventListener("click", () => {
        approveDraft(draft.id);
      });

      const rejectBtn = document.createElement("button");
      rejectBtn.type = "button";
      rejectBtn.className = "ghost-btn";
      rejectBtn.textContent = "דחה שאלה זו";
      rejectBtn.addEventListener("click", () => {
        rejectDraft(draft.id);
      });

      actions.appendChild(approveBtn);
      actions.appendChild(rejectBtn);

      card.appendChild(title);
      card.appendChild(answerLine);
      card.appendChild(qualityLine);
      card.appendChild(actions);
      dom.longTextDraftsPreview.appendChild(card);
    });

    dom.approveAllTextDraftsBtn.disabled = false;
    return;
  }

  if (adminState.longTextAnalysis?.facts?.length) {
    const info = makeInfoMessage(
      `הטקסט נותח. זוהו ${adminState.longTextAnalysis.facts.length} עובדות אפשריות ליצירת שאלות. לחץ על "צור שאלות מהטקסט".`,
    );
    dom.longTextDraftsPreview.appendChild(info);

    const factsPreview = document.createElement("article");
    factsPreview.className = "info-card";
    const title = document.createElement("h4");
    title.textContent = "דוגמאות לעובדות שזוהו בטקסט";
    factsPreview.appendChild(title);

    const list = document.createElement("ul");
    list.className = "sources-list";
    adminState.longTextAnalysis.facts.slice(0, LONG_TEXT_PREVIEW_FACTS).forEach((fact) => {
      const item = document.createElement("li");
      item.textContent = clampText(fact, 150);
      list.appendChild(item);
    });
    factsPreview.appendChild(list);
    dom.longTextDraftsPreview.appendChild(factsPreview);
    dom.approveAllTextDraftsBtn.disabled = true;
    return;
  }

  dom.longTextDraftsPreview.appendChild(
    makeInfoMessage("אין עדיין טיוטות מטקסט. הדבק טקסט, לחץ 'קרא והבן את הכל', ואז צור שאלות."),
  );
  dom.approveAllTextDraftsBtn.disabled = true;
}

function generateDraftsFromActivity(activity) {
  const sourceList = buildSourcesFromActivity(activity);

  const primaryCorrect = clampText(activity.outcome, 96);
  const questionOne = {
    id: uid("draft"),
    originActivityId: activity.id,
    kind: activity.kind,
    date: activity.date,
    category: activity.category,
    learn: activity.context,
    question: `מה הייתה התוצאה המרכזית של "${activity.title}"?`,
    options: shuffleArray([
      primaryCorrect,
      "הנושא הועבר לבחינה בלבד ללא תוצאה אופרטיבית",
      "הדיון נדחה למועד לא ידוע ללא החלטה",
      "הוחלט לסגור את המהלך ללא המשך טיפול",
    ]),
    explanation: `לפי ההזנה, התוצאה המרכזית הייתה: ${activity.outcome}`,
    sources: sourceList,
  };
  questionOne.answer = questionOne.options.indexOf(primaryCorrect);

  const wrongCategories = pickRandom(
    ALL_CATEGORIES.filter((item) => item !== activity.category),
    3,
  );
  const questionTwo = {
    id: uid("draft"),
    originActivityId: activity.id,
    kind: activity.kind,
    date: activity.date,
    category: activity.category,
    learn: activity.context,
    question: `לאיזה תחום ציבורי שויכה הפעילות "${activity.title}"?`,
    options: shuffleArray([activity.category, ...wrongCategories]),
    explanation: `הפעילות סווגה כ-${activity.category} לפי נתוני המנהל שהוזנו בטופס.`,
    sources: sourceList,
  };
  questionTwo.answer = questionTwo.options.indexOf(activity.category);

  const actionType = detectActionType(activity);
  const questionThree = {
    id: uid("draft"),
    originActivityId: activity.id,
    kind: activity.kind,
    date: activity.date,
    category: activity.category,
    learn: activity.context,
    question: `מה היה כלי הפעולה המרכזי במסגרת "${activity.title}"?`,
    options: shuffleArray([
      actionType,
      "מהלך תקשורתי בלבד ללא פעולה מוסדית",
      "קמפיין גיוס תרומות ללא פנייה לרשויות",
      "הליך מחקר אקדמי בלבד",
    ]),
    explanation: `מתוך הטקסט שהוזן, כלי הפעולה המרכזי סווג כ: ${actionType}.`,
    sources: sourceList,
  };
  questionThree.answer = questionThree.options.indexOf(actionType);

  return [questionOne, questionTwo, questionThree];
}

function detectActionType(activity) {
  const text = `${activity.title} ${activity.context} ${activity.outcome}`;

  if (/עתיר|בג"ץ|בג״ץ|בית המשפט/i.test(text)) {
    return "הליך משפטי / עתירה";
  }

  if (/מכתב|פנייה|פניה|דרישה|פנינו/i.test(text)) {
    return "פנייה רשמית לגורמי ממשל";
  }

  if (/חקיקה|חוק|תקנון|תזכיר/i.test(text)) {
    return "מהלך חקיקה / רגולציה";
  }

  if (/ועדה|דיון|מינויים|שימוע/i.test(text)) {
    return "עבודה מוסדית מול ועדות ומנגנוני מינוי";
  }

  return "שילוב פעולה ציבורית ומשפטית";
}

function buildSourcesFromActivity(activity) {
  if (!activity.sourceUrl) {
    return [];
  }

  return [
    {
      label: activity.sourceLabel || "מקור שהוזן על ידי מנהל",
      url: activity.sourceUrl,
      anchorText: normalizeSpace(activity.outcome) || normalizeSpace(activity.context),
    },
  ];
}

function saveAttempt(attempt) {
  const attempts = readStorage(STORAGE_KEYS.attempts, []);
  const nextAttempts = [attempt, ...attempts].slice(0, 500);
  writeStorage(STORAGE_KEYS.attempts, nextAttempts);
  pushPublicAttemptToBackend(attempt);
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (_err) {
    return fallback;
  }
}

function readObjectStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return fallback;
    }
    return parsed;
  } catch (_err) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    queueRemoteStateSync(key, value);
    return true;
  } catch (_err) {
    return false;
  }
}

function normalizeQuestionSources(sources, question) {
  if (!Array.isArray(sources)) {
    return [];
  }

  return sources
    .map((source) => {
      const url = normalizeSpace(source?.url);
      if (!url) {
        return null;
      }

      return {
        ...source,
        label: normalizeSpace(source?.label) || "מקור",
        url,
        anchorText:
          normalizeSpace(source?.anchorText)
          || normalizeSpace(source?.quote)
          || deriveSourceAnchorText(question, source),
      };
    })
    .filter(Boolean);
}

function deriveSourceAnchorText(question, source) {
  const explicit = normalizeSpace(source?.anchorText) || normalizeSpace(source?.quote);
  if (explicit) {
    return trimForTextFragment(explicit);
  }

  const candidates = [
    normalizeSpace(question?.explanation),
    normalizeSpace(question?.learn),
    normalizeSpace(question?.question),
  ];

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = trimForTextFragment(candidates[i]);
    if (candidate) {
      return candidate;
    }
  }

  return "";
}

function trimForTextFragment(text) {
  const clean = normalizeSpace(text);
  if (!clean) {
    return "";
  }

  if (clean.length <= SOURCE_TEXT_FRAGMENT_MAX_LEN) {
    return clean;
  }

  const hardSlice = clean.slice(0, SOURCE_TEXT_FRAGMENT_MAX_LEN + 24);
  const punctuationCut = Math.max(
    hardSlice.lastIndexOf("."),
    hardSlice.lastIndexOf(","),
    hardSlice.lastIndexOf(";"),
    hardSlice.lastIndexOf(" "),
  );
  const cutIndex = punctuationCut >= 36 ? punctuationCut : SOURCE_TEXT_FRAGMENT_MAX_LEN;
  return hardSlice.slice(0, cutIndex).trim();
}

function buildSourceHref(source, question) {
  const rawUrl = normalizeSpace(source?.url);
  if (!rawUrl) {
    return "";
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (_err) {
    return rawUrl;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return rawUrl;
  }

  const fragmentText =
    trimForTextFragment(normalizeSpace(source?.anchorText))
    || deriveSourceAnchorText(question, source);
  if (!fragmentText) {
    return parsed.toString();
  }

  parsed.hash = `:~:text=${encodeURIComponent(fragmentText)}`;
  return parsed.toString();
}

function stripDateFromLabel(labelText) {
  return normalizeSpace(labelText).replace(/\(\s*\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\s*\)/g, "").trim();
}

function getBaseQuestionId(question) {
  const rawId = normalizeSpace(question?.id).toLowerCase();
  const match = rawId.match(/b\d{2}/);
  return match ? match[0] : "";
}

function getSourceRegistryEntry(source, question) {
  const baseQuestionId = getBaseQuestionId(question);
  if (baseQuestionId && SOURCE_REGISTRY_BY_QUESTION_ID[baseQuestionId]) {
    return SOURCE_REGISTRY_BY_QUESTION_ID[baseQuestionId];
  }

  return null;
}

function buildSourceSearchQuery(source, question) {
  const entry = getSourceRegistryEntry(source, question);
  if (normalizeSpace(entry?.searchQuery)) {
    return normalizeSpace(entry.searchQuery);
  }

  const label = stripDateFromLabel(source?.label);
  const anchor =
    trimForTextFragment(normalizeSpace(source?.anchorText))
    || deriveSourceAnchorText(question, source);
  return normalizeSpace(`${label} ${anchor}`);
}

function buildInternalSourceSearchHref(source, question) {
  const query = buildSourceSearchQuery(source, question);
  if (!query) {
    return "https://mqg.org.il/";
  }
  return `https://mqg.org.il/?s=${encodeURIComponent(query)}`;
}

function isLikelyBrokenMqgSourceUrl(rawUrl) {
  const normalized = normalizeSpace(rawUrl);
  if (!normalized) {
    return true;
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch (_err) {
    return true;
  }

  if (!/(\.|^)mqg\.org\.il$/i.test(parsed.hostname)) {
    return false;
  }

  const path = parsed.pathname || "/";
  if (path === "/" || path === "") {
    return true;
  }

  const lastSegment = path.split("/").filter(Boolean).pop() || "";
  if (!lastSegment) {
    return true;
  }

  if (/%d7%[0-9a-f]{2}$/i.test(lastSegment) && /-$/.test(lastSegment.replace(/%d7%[0-9a-f]{2}$/i, ""))) {
    return true;
  }

  const decoded = (() => {
    try {
      return decodeURIComponent(lastSegment);
    } catch (_err) {
      return lastSegment;
    }
  })();

  return decoded.length < 4;
}

function buildDirectSourceHref(source, question) {
  const entry = getSourceRegistryEntry(source, question);
  if (normalizeSpace(entry?.canonicalUrl)) {
    const sourceWithCanonical = {
      ...source,
      url: entry.canonicalUrl,
      anchorText: normalizeSpace(entry.anchorText) || normalizeSpace(source?.anchorText),
    };
    return buildSourceHref(sourceWithCanonical, question);
  }

  return buildSourceHref(source, question);
}

function buildPreferredSourceHref(source, question) {
  const entry = getSourceRegistryEntry(source, question);
  const directHref = buildDirectSourceHref(source, question);
  const searchHref = buildInternalSourceSearchHref(source, question);

  if (normalizeSpace(entry?.canonicalUrl)) {
    return directHref;
  }

  if (isLikelyBrokenMqgSourceUrl(source?.url)) {
    return searchHref;
  }

  if (!directHref) {
    return searchHref;
  }

  // Without canonical URL, search results are usually more stable than raw slug links.
  return searchHref;
}

function renderSources(container, sources, question) {
  container.innerHTML = "";

  if (!Array.isArray(sources) || !sources.length) {
    const li = document.createElement("li");
    li.textContent = "לא נוסף מקור חיצוני לשאלה זו.";
    container.appendChild(li);
    return;
  }

  sources.forEach((source) => {
    const li = document.createElement("li");
    const link = document.createElement("a");
    const preferredHref = buildPreferredSourceHref(source, question);
    const directHref = buildDirectSourceHref(source, question);

    link.href = preferredHref;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `מקור: ${source.label}`;
    li.appendChild(link);

    const searchLink = document.createElement("a");
    searchLink.href = buildInternalSourceSearchHref(source, question);
    searchLink.target = "_blank";
    searchLink.rel = "noopener noreferrer";
    searchLink.textContent = "איתור באתר";
    li.appendChild(document.createTextNode(" · "));
    li.appendChild(searchLink);

    if (
      directHref
      && directHref !== preferredHref
      && !isLikelyBrokenMqgSourceUrl(directHref)
    ) {
      const directLink = document.createElement("a");
      directLink.href = directHref;
      directLink.target = "_blank";
      directLink.rel = "noopener noreferrer";
      directLink.textContent = "קישור ישיר";
      li.appendChild(document.createTextNode(" · "));
      li.appendChild(directLink);
    }

    container.appendChild(li);
  });
}

function makeInfoMessage(text) {
  const node = document.createElement("article");
  node.className = "info-card";

  const p = document.createElement("p");
  p.textContent = text;

  node.appendChild(p);
  return node;
}

function showMessage(node, text, isOk) {
  node.textContent = text;
  node.classList.remove("hidden");
  node.classList.toggle("ok", Boolean(isOk));
}

function hideMessage(node) {
  node.textContent = "";
  node.classList.add("hidden");
  node.classList.remove("ok");
}

function formatDateDisplay(dateValue) {
  if (!dateValue) {
    return "ללא תאריך";
  }

  const [year, month, day] = String(dateValue).split("-");
  if (!year || !month || !day) {
    return dateValue;
  }

  return `${day}.${month}.${year}`;
}

function monthYearLabel(dateValue) {
  const [year, month] = String(dateValue || "").split("-");
  const monthIndex = Number(month) - 1;
  const monthName = HE_MONTHS[monthIndex] || month;
  if (!monthName || !year) {
    return String(dateValue || "");
  }
  return `${monthName} ${year}`;
}

function formatDateTime(isoText) {
  try {
    return new Date(isoText).toLocaleString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (_err) {
    return isoText;
  }
}

function formatDuration(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const min = Math.floor(safe / 60);
  const sec = safe % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

function formatBytes(value) {
  const size = Number(value) || 0;
  if (size < 1024) {
    return `${size}B`;
  }

  if (size < 1024 * 1024) {
    return `${Math.round(size / 1024)}KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

function pickRandom(arr, count) {
  const clone = arr.slice();
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone.slice(0, count);
}

function shuffleArray(arr) {
  return pickRandom(arr, arr.length);
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function clampText(text, maxLength) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, maxLength - 1)}…`;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function setDefaultDateFields() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const value = `${yyyy}-${mm}-${dd}`;

  const activityDateInput = dom.activityForm?.querySelector('input[name="date"]');
  if (activityDateInput) {
    activityDateInput.value = value;
  }

  if (dom.longTextDate) {
    dom.longTextDate.value = value;
  }
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_err) {
    return false;
  }
}

async function extractFileMeta(fileList) {
  const files = Array.from(fileList || []).slice(0, 6);
  const output = [];

  for (const file of files) {
    const meta = {
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      previewDataUrl: "",
    };

    const canEmbedPreview = meta.type.startsWith("image/") && file.size <= 380000;
    if (canEmbedPreview) {
      try {
        meta.previewDataUrl = await fileToDataUrl(file);
      } catch (_err) {
        meta.previewDataUrl = "";
      }
    }

    output.push(meta);
  }

  return output;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function buildBannerImage(question) {
  const identity = `${question.id || ""}-${question.category || ""}`;
  const index = Math.abs(hashText(identity)) % OFFICIAL_BANNER_IMAGES.length;
  return OFFICIAL_BANNER_IMAGES[index];
}

function buildFallbackBannerImage(question) {
  const color = CATEGORY_COLORS[question.category] || {
    start: "#0B427A",
    end: "#072D57",
    code: "MQG",
  };
  const safeCategory = String(question.category || "התנועה לאיכות השלטון")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 375">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${color.start}" />
          <stop offset="100%" stop-color="${color.end}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="375" fill="url(#g)" />
      <text x="60" y="190" fill="#fff" font-family="Heebo, Arial" font-size="54" font-weight="800">${safeCategory}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function hashText(text) {
  let hash = 0;
  const safe = String(text || "");
  for (let i = 0; i < safe.length; i += 1) {
    hash = (hash << 5) - hash + safe.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
