const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

function cleanEnvText(value) {
  let output = String(value || "").trim();
  const hasWrappedSingleQuote = output.length >= 2 && output.startsWith("'") && output.endsWith("'");
  const hasWrappedDoubleQuote = output.length >= 2 && output.startsWith("\"") && output.endsWith("\"");
  if (hasWrappedSingleQuote || hasWrappedDoubleQuote) {
    output = output.slice(1, -1).trim();
  }
  return output;
}

function normalizeOrigin(value) {
  return cleanEnvText(value).replace(/\/+$/, "");
}

const PORT = Number(process.env.PORT || 8787);
const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.cwd(), process.env.DB_PATH)
  : path.resolve(__dirname, "data", "mqg.sqlite");
const DEFAULT_ADMIN_USERNAME = cleanEnvText(process.env.DEFAULT_ADMIN_USERNAME || "");
const DEFAULT_ADMIN_PASSWORD = cleanEnvText(process.env.DEFAULT_ADMIN_PASSWORD || "");
const SESSION_DAYS = Math.max(1, Number(process.env.SESSION_DAYS || 7));
const CORS_ORIGIN = cleanEnvText(process.env.CORS_ORIGIN || "");
const PUBLIC_WRITE_KEY = String(process.env.PUBLIC_WRITE_KEY || "").trim();
const NODE_ENV = String(process.env.NODE_ENV || "development").trim();
const IS_PRODUCTION = NODE_ENV === "production";
const MIN_PASSWORD_LENGTH = Math.max(8, Number(process.env.MIN_PASSWORD_LENGTH || 8));
const SESSION_COOKIE_NAME = String(process.env.SESSION_COOKIE_NAME || "mqg_session").trim();
const REQUESTED_SAMESITE = String(
  process.env.SESSION_COOKIE_SAMESITE || (IS_PRODUCTION ? "none" : "lax"),
)
  .trim()
  .toLowerCase();
const SESSION_COOKIE_SAMESITE = ["lax", "strict", "none"].includes(REQUESTED_SAMESITE)
  ? REQUESTED_SAMESITE
  : "lax";
const LOGIN_RATE_WINDOW_MS = Math.max(10000, Number(process.env.LOGIN_RATE_WINDOW_MS || 60000));
const LOGIN_RATE_MAX = Math.max(3, Number(process.env.LOGIN_RATE_MAX || 20));
const LOGIN_LOCK_THRESHOLD = Math.max(3, Number(process.env.LOGIN_LOCK_THRESHOLD || 6));
const LOGIN_LOCK_MS = Math.max(10000, Number(process.env.LOGIN_LOCK_MS || 15 * 60 * 1000));
const PUBLIC_RATE_WINDOW_MS = Math.max(10000, Number(process.env.PUBLIC_RATE_WINDOW_MS || 60000));
const PUBLIC_RATE_MAX = Math.max(5, Number(process.env.PUBLIC_RATE_MAX || 90));
const BACKUP_DIR = process.env.BACKUP_DIR
  ? path.resolve(process.cwd(), process.env.BACKUP_DIR)
  : path.resolve(__dirname, "backups");
const BACKUP_INTERVAL_MINUTES = Math.max(0, Number(process.env.BACKUP_INTERVAL_MINUTES || 60));
const BACKUP_KEEP_FILES = Math.max(3, Number(process.env.BACKUP_KEEP_FILES || 48));
const ENABLE_SELF_KEEPALIVE = String(process.env.ENABLE_SELF_KEEPALIVE || "false").trim().toLowerCase() === "true";
const SELF_KEEPALIVE_INTERVAL_MS = Math.max(60_000, Number(process.env.SELF_KEEPALIVE_INTERVAL_MS || 4 * 60_000));
const SELF_KEEPALIVE_URL = cleanEnvText(process.env.SELF_KEEPALIVE_URL || process.env.RENDER_EXTERNAL_URL || "");

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const allowedOrigins = CORS_ORIGIN
  .split(",")
  .map((item) => normalizeOrigin(item))
  .filter(Boolean);
if (IS_PRODUCTION && (!allowedOrigins.length || allowedOrigins.includes("*"))) {
  throw new Error("In production you must set a strict CORS_ORIGIN (no wildcard).");
}

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  username_norm TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS state_store (
  state_key TEXT PRIMARY KEY,
  state_value TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);
`);

function ensureAdminSchema() {
  const columns = db.prepare("PRAGMA table_info(admins)").all();
  const hasRole = columns.some((col) => String(col.name || "").toLowerCase() === "role");
  if (!hasRole) {
    db.exec("ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'admin';");
  }
}

ensureAdminSchema();

const app = express();
if (IS_PRODUCTION) {
  app.set("trust proxy", 1);
}
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  next();
});
app.use(cors({
  origin(origin, cb) {
    if (!origin) {
      return cb(null, true);
    }
    const normalizedRequestOrigin = normalizeOrigin(origin);
    if (!allowedOrigins.length && !IS_PRODUCTION) {
      return cb(null, true);
    }
    if (allowedOrigins.includes(normalizedRequestOrigin)) {
      return cb(null, true);
    }
    return cb(new Error("CORS_BLOCKED"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "6mb" }));

const rateWindow = new Map();
const loginFailures = new Map();
let backupInProgress = false;

function normalizeUsername(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizeAdminRole(value) {
  return String(value || "").trim().toLowerCase() === "owner" ? "owner" : "admin";
}

function nowIso() {
  return new Date().toISOString();
}

function sanitizePublicIssueReport(reportInput) {
  const report = reportInput && typeof reportInput === "object" ? reportInput : null;
  if (!report) {
    return null;
  }

  const text = String(report.text || "").trim();
  if (text.length < 5 || text.length > 2000) {
    return null;
  }

  const id = String(report.id || generateId("issue")).trim() || generateId("issue");
  return {
    id,
    type: "issue_report",
    text,
    submitterName: String(report.submitterName || "").trim().slice(0, 60),
    playerName: String(report.playerName || "").trim().slice(0, 60),
    screenId: String(report.screenId || "screenLanding").trim().slice(0, 60),
    screenLabel: String(report.screenLabel || "").trim().slice(0, 120),
    quickMode: String(report.quickMode || "").trim().slice(0, 40),
    entryDepartment: String(report.entryDepartment || "").trim().slice(0, 40),
    questionId: String(report.questionId || "").trim().slice(0, 80),
    submittedAt: String(report.submittedAt || nowIso()).trim() || nowIso(),
  };
}

function generateId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

function createSessionToken() {
  return crypto.randomBytes(36).toString("hex");
}

function serializeAdmin(row) {
  const role = normalizeAdminRole(row?.role);
  return {
    id: row.id,
    username: row.username,
    role,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

function listAdmins() {
  const rows = db.prepare(`
    SELECT id, username, role, created_at, created_by
    FROM admins
    ORDER BY created_at DESC
  `).all();
  return rows.map(serializeAdmin);
}

function parseCookies(req) {
  const raw = String(req.headers.cookie || "");
  const output = {};
  raw.split(";").forEach((pair) => {
    const [key, ...rest] = pair.split("=");
    const safeKey = String(key || "").trim();
    if (!safeKey) {
      return;
    }
    const rawValue = rest.join("=").trim();
    try {
      output[safeKey] = decodeURIComponent(rawValue);
    } catch (_err) {
      output[safeKey] = rawValue;
    }
  });
  return output;
}

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  if (forwarded) {
    return forwarded;
  }
  return String(req.ip || req.connection?.remoteAddress || "unknown").trim();
}

function makeRateKey(prefix, req, extra) {
  return `${prefix}:${getClientIp(req)}:${String(extra || "").trim()}`;
}

function incrementRateWindow(key, windowMs, limit) {
  const now = Date.now();
  const current = rateWindow.get(key);
  if (!current || current.expiresAt <= now) {
    rateWindow.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  current.count += 1;
  if (current.count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: Math.max(0, limit - current.count) };
}

function rateLimitMiddleware(prefix, windowMs, limit) {
  return (req, res, next) => {
    const key = makeRateKey(prefix, req, "");
    const verdict = incrementRateWindow(key, windowMs, limit);
    if (!verdict.allowed) {
      return res.status(429).json({ ok: false, error: "RATE_LIMITED" });
    }
    return next();
  };
}

function getLoginLockKey(req, usernameNorm) {
  return `login:${getClientIp(req)}:${usernameNorm}`;
}

function isLoginLocked(lockKey) {
  const current = loginFailures.get(lockKey);
  if (!current) {
    return false;
  }
  if (current.lockUntil > Date.now()) {
    return true;
  }
  if (current.lockUntil) {
    loginFailures.delete(lockKey);
  }
  return false;
}

function registerLoginFailure(lockKey) {
  const now = Date.now();
  const current = loginFailures.get(lockKey) || { fails: 0, lockUntil: 0 };
  current.fails += 1;
  if (current.fails >= LOGIN_LOCK_THRESHOLD) {
    current.lockUntil = now + LOGIN_LOCK_MS;
    current.fails = 0;
  }
  loginFailures.set(lockKey, current);
}

function clearLoginFailure(lockKey) {
  loginFailures.delete(lockKey);
}

function setSessionCookie(res, token, expiresAtMs) {
  const maxAge = Math.max(0, expiresAtMs - Date.now());
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    `SameSite=${SESSION_COOKIE_SAMESITE[0].toUpperCase()}${SESSION_COOKIE_SAMESITE.slice(1)}`,
    `Max-Age=${Math.floor(maxAge / 1000)}`,
  ];
  if (IS_PRODUCTION) {
    parts.push("Secure");
  }
  res.setHeader("Set-Cookie", parts.join("; "));
}

function clearSessionCookie(res) {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    `SameSite=${SESSION_COOKIE_SAMESITE[0].toUpperCase()}${SESSION_COOKIE_SAMESITE.slice(1)}`,
    "Max-Age=0",
  ];
  if (IS_PRODUCTION) {
    parts.push("Secure");
  }
  res.setHeader("Set-Cookie", parts.join("; "));
}

async function runBackup() {
  if (backupInProgress) {
    return;
  }
  backupInProgress = true;
  try {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = path.join(BACKUP_DIR, `mqg-backup-${stamp}.sqlite`);
    await db.backup(backupPath);

    const files = fs.readdirSync(BACKUP_DIR)
      .filter((name) => name.endsWith(".sqlite"))
      .map((name) => ({
        name,
        fullPath: path.join(BACKUP_DIR, name),
        mtime: fs.statSync(path.join(BACKUP_DIR, name)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    files.slice(BACKUP_KEEP_FILES).forEach((file) => {
      try {
        fs.unlinkSync(file.fullPath);
      } catch (_err) {
        // ignore cleanup errors
      }
    });
  } finally {
    backupInProgress = false;
  }
}

async function runSelfKeepaliveTick() {
  if (!ENABLE_SELF_KEEPALIVE || !SELF_KEEPALIVE_URL || typeof fetch !== "function") {
    return;
  }

  const target = `${SELF_KEEPALIVE_URL.replace(/\/+$/, "")}/api/health?selfKeepalive=1`;
  try {
    await fetch(target, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      keepalive: true,
    });
  } catch (_err) {
    // ignore transient keepalive errors
  }
}

function ensureDefaultAdmin() {
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM admins").get();
  if ((countRow?.count || 0) > 0) {
    return;
  }

  if (!DEFAULT_ADMIN_USERNAME || !DEFAULT_ADMIN_PASSWORD) {
    throw new Error(
      "No admins in DB. You must set DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD before first run.",
    );
  }
  if (DEFAULT_ADMIN_PASSWORD.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `DEFAULT_ADMIN_PASSWORD is too short. Minimum length is ${MIN_PASSWORD_LENGTH}.`,
    );
  }

  const id = generateId("admin");
  const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
  db.prepare(`
    INSERT INTO admins (id, username, username_norm, password_hash, role, created_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    DEFAULT_ADMIN_USERNAME,
    normalizeUsername(DEFAULT_ADMIN_USERNAME),
    passwordHash,
    "owner",
    nowIso(),
    "system",
  );
}

function ensureOwnerAdmin() {
  const owner = db.prepare("SELECT id FROM admins WHERE role = 'owner' LIMIT 1").get();
  if (owner?.id) {
    return;
  }

  const fallback = db.prepare(`
    SELECT id
    FROM admins
    ORDER BY created_at ASC, id ASC
    LIMIT 1
  `).get();
  if (!fallback?.id) {
    return;
  }

  db.prepare("UPDATE admins SET role = 'owner' WHERE id = ?").run(fallback.id);
}

function canUseEnvAdminCredentials(usernameNorm, password) {
  if (!DEFAULT_ADMIN_USERNAME || !DEFAULT_ADMIN_PASSWORD) {
    return false;
  }
  return (
    normalizeUsername(usernameNorm) === normalizeUsername(DEFAULT_ADMIN_USERNAME)
    && String(password || "") === DEFAULT_ADMIN_PASSWORD
  );
}

function recoverOwnerFromEnvCredentials() {
  if (!DEFAULT_ADMIN_USERNAME || !DEFAULT_ADMIN_PASSWORD) {
    return null;
  }
  if (DEFAULT_ADMIN_PASSWORD.length < MIN_PASSWORD_LENGTH) {
    return null;
  }

  const desiredUsername = DEFAULT_ADMIN_USERNAME;
  const desiredUsernameNorm = normalizeUsername(desiredUsername);
  const desiredPasswordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 10);
  const timestamp = nowIso();

  const matchingAdmin = db.prepare(`
    SELECT id
    FROM admins
    WHERE username_norm = ?
    LIMIT 1
  `).get(desiredUsernameNorm);

  let targetId = matchingAdmin?.id || "";
  if (!targetId) {
    const owner = db.prepare(`
      SELECT id
      FROM admins
      WHERE role = 'owner'
      ORDER BY created_at ASC, id ASC
      LIMIT 1
    `).get();
    if (owner?.id) {
      targetId = owner.id;
    }
  }
  if (!targetId) {
    const fallback = db.prepare(`
      SELECT id
      FROM admins
      ORDER BY created_at ASC, id ASC
      LIMIT 1
    `).get();
    if (fallback?.id) {
      targetId = fallback.id;
    }
  }

  if (targetId) {
    db.prepare("UPDATE admins SET role = 'admin' WHERE role = 'owner' AND id <> ?").run(targetId);
    db.prepare(`
      UPDATE admins
      SET username = ?, username_norm = ?, password_hash = ?, role = 'owner'
      WHERE id = ?
    `).run(desiredUsername, desiredUsernameNorm, desiredPasswordHash, targetId);
  } else {
    targetId = generateId("admin");
    db.prepare(`
      INSERT INTO admins (id, username, username_norm, password_hash, role, created_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      targetId,
      desiredUsername,
      desiredUsernameNorm,
      desiredPasswordHash,
      "owner",
      timestamp,
      "env_recovery",
    );
  }

  return db.prepare(`
    SELECT id, username, username_norm, password_hash, role, created_at, created_by
    FROM admins
    WHERE id = ?
  `).get(targetId);
}

ensureDefaultAdmin();
ensureOwnerAdmin();
recoverOwnerFromEnvCredentials();

function upsertState(key, value, updatedBy) {
  db.prepare(`
    INSERT INTO state_store (state_key, state_value, updated_at, updated_by)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(state_key) DO UPDATE SET
      state_value = excluded.state_value,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by
  `).run(key, JSON.stringify(value), nowIso(), updatedBy);
}

function parseAuthToken(req) {
  const cookies = parseCookies(req);
  const cookieToken = String(cookies[SESSION_COOKIE_NAME] || "").trim();
  if (cookieToken) {
    return cookieToken;
  }

  const auth = String(req.headers.authorization || "").trim();
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return "";
  }
  return auth.slice(7).trim();
}

function authMiddleware(req, res, next) {
  const token = parseAuthToken(req);
  if (!token) {
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }

  const row = db.prepare(`
    SELECT s.token, s.admin_id, s.expires_at, a.username, a.id, a.role
    FROM sessions s
    JOIN admins a ON a.id = s.admin_id
    WHERE s.token = ?
  `).get(token);

  if (!row) {
    return res.status(401).json({ ok: false, error: "INVALID_SESSION" });
  }

  if (Number(row.expires_at) <= Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return res.status(401).json({ ok: false, error: "SESSION_EXPIRED" });
  }

  req.session = {
    token,
    adminId: row.admin_id,
    username: row.username,
    role: normalizeAdminRole(row.role),
    isOwner: normalizeAdminRole(row.role) === "owner",
  };
  return next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "mqg-trivia-backend" });
});

app.post(
  "/api/public/attempt",
  rateLimitMiddleware("public_attempt", PUBLIC_RATE_WINDOW_MS, PUBLIC_RATE_MAX),
  (req, res) => {
  if (!PUBLIC_WRITE_KEY) {
    return res.status(403).json({ ok: false, error: "PUBLIC_WRITE_DISABLED" });
  }

  const incomingKey = String(req.headers["x-public-key"] || "").trim();
  if (!incomingKey || incomingKey !== PUBLIC_WRITE_KEY) {
    return res.status(401).json({ ok: false, error: "INVALID_PUBLIC_KEY" });
  }

  const attempt = req.body?.attempt;
  if (!attempt || typeof attempt !== "object") {
    return res.status(400).json({ ok: false, error: "INVALID_ATTEMPT" });
  }

  let attempts = [];
  const existing = db.prepare("SELECT state_value FROM state_store WHERE state_key = ?").get("mqg_trivia_attempts_v3");
  if (existing?.state_value) {
    try {
      const parsed = JSON.parse(existing.state_value);
      attempts = Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      attempts = [];
    }
  }

  const nextAttempts = [attempt, ...attempts].slice(0, 500);
  upsertState("mqg_trivia_attempts_v3", nextAttempts, "public");
  res.json({ ok: true });
});

app.post(
  "/api/public/issue-report",
  rateLimitMiddleware("public_issue_report", PUBLIC_RATE_WINDOW_MS, PUBLIC_RATE_MAX),
  (req, res) => {
  if (!PUBLIC_WRITE_KEY) {
    return res.status(403).json({ ok: false, error: "PUBLIC_WRITE_DISABLED" });
  }

  const incomingKey = String(req.headers["x-public-key"] || "").trim();
  if (!incomingKey || incomingKey !== PUBLIC_WRITE_KEY) {
    return res.status(401).json({ ok: false, error: "INVALID_PUBLIC_KEY" });
  }

  const report = sanitizePublicIssueReport(req.body?.report);
  if (!report) {
    return res.status(400).json({ ok: false, error: "INVALID_REPORT" });
  }

  let reports = [];
  const existing = db.prepare("SELECT state_value FROM state_store WHERE state_key = ?").get("mqg_issue_reports_v1");
  if (existing?.state_value) {
    try {
      const parsed = JSON.parse(existing.state_value);
      reports = Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      reports = [];
    }
  }

  const nextReports = [report, ...reports].slice(0, 500);
  upsertState("mqg_issue_reports_v1", nextReports, "public");
  res.json({ ok: true });
});

app.post(
  "/api/auth/login",
  rateLimitMiddleware("auth_login", LOGIN_RATE_WINDOW_MS, LOGIN_RATE_MAX),
  (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "").trim();
  const usernameNorm = normalizeUsername(username);
  const lockKey = getLoginLockKey(req, usernameNorm);

  if (isLoginLocked(lockKey)) {
    return res.status(429).json({ ok: false, error: "LOGIN_LOCKED" });
  }

  if (username.length < 2 || password.length < 2) {
    registerLoginFailure(lockKey);
    return res.status(400).json({ ok: false, error: "INVALID_CREDENTIALS" });
  }

  const admin = db.prepare(`
    SELECT id, username, username_norm, password_hash, role, created_at, created_by
    FROM admins
    WHERE username_norm = ?
  `).get(usernameNorm);

  let resolvedAdmin = admin || null;
  let isValidLogin = Boolean(resolvedAdmin && bcrypt.compareSync(password, resolvedAdmin.password_hash));

  if (!isValidLogin && canUseEnvAdminCredentials(usernameNorm, password)) {
    resolvedAdmin = recoverOwnerFromEnvCredentials();
    isValidLogin = Boolean(
      resolvedAdmin && bcrypt.compareSync(password, resolvedAdmin.password_hash),
    );
  }

  if (!isValidLogin) {
    registerLoginFailure(lockKey);
    return res.status(401).json({ ok: false, error: "INVALID_CREDENTIALS" });
  }

  clearLoginFailure(lockKey);

  db.prepare("DELETE FROM sessions WHERE admin_id = ? OR expires_at <= ?").run(
    resolvedAdmin.id,
    Date.now(),
  );
  const sessionToken = createSessionToken();
  const expiresAt = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;

  db.prepare(`
    INSERT INTO sessions (token, admin_id, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionToken, resolvedAdmin.id, expiresAt, nowIso());
  setSessionCookie(res, sessionToken, expiresAt);

  return res.json({
    ok: true,
    expiresAt,
    admin: {
      id: resolvedAdmin.id,
      username: resolvedAdmin.username,
      role: normalizeAdminRole(resolvedAdmin.role),
      createdAt: resolvedAdmin.created_at,
      createdBy: resolvedAdmin.created_by,
    },
  });
});

app.post("/api/auth/logout", authMiddleware, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(req.session.token);
  clearSessionCookie(res);
  res.json({ ok: true });
});

app.get("/api/auth/session", authMiddleware, (req, res) => {
  res.json({
    ok: true,
    admin: {
      id: req.session.adminId,
      username: req.session.username,
      role: req.session.role,
    },
  });
});

app.patch(
  "/api/auth/password",
  rateLimitMiddleware("auth_password", LOGIN_RATE_WINDOW_MS, LOGIN_RATE_MAX),
  authMiddleware,
  (req, res) => {
    const currentPassword = String(req.body?.currentPassword || "").trim();
    const newPassword = String(req.body?.newPassword || "").trim();

    if (!currentPassword) {
      return res.status(400).json({ ok: false, error: "INVALID_CURRENT_PASSWORD" });
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ ok: false, error: "INVALID_NEW_PASSWORD" });
    }

    const admin = db.prepare(`
      SELECT id, password_hash
      FROM admins
      WHERE id = ?
    `).get(req.session.adminId);

    if (!admin) {
      return res.status(404).json({ ok: false, error: "ADMIN_NOT_FOUND" });
    }
    if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
      return res.status(401).json({ ok: false, error: "INVALID_CURRENT_PASSWORD" });
    }
    if (bcrypt.compareSync(newPassword, admin.password_hash)) {
      return res.status(400).json({ ok: false, error: "PASSWORD_UNCHANGED" });
    }

    const nextHash = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(nextHash, req.session.adminId);
    db.prepare("DELETE FROM sessions WHERE admin_id = ? AND token <> ?").run(req.session.adminId, req.session.token);
    return res.json({ ok: true });
  },
);

app.get(
  "/api/admins",
  rateLimitMiddleware("admins_get", LOGIN_RATE_WINDOW_MS, LOGIN_RATE_MAX * 2),
  authMiddleware,
  (_req, res) => {
  const admins = listAdmins();
  res.json({ ok: true, admins });
});

app.post(
  "/api/admins",
  rateLimitMiddleware("admins_post", LOGIN_RATE_WINDOW_MS, LOGIN_RATE_MAX),
  authMiddleware,
  (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "").trim();

  if (username.length < 2 || password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ ok: false, error: "INVALID_INPUT" });
  }

  const usernameNorm = normalizeUsername(username);
  const exists = db.prepare("SELECT id FROM admins WHERE username_norm = ?").get(usernameNorm);
  if (exists) {
    return res.status(409).json({ ok: false, error: "USERNAME_EXISTS" });
  }

  const id = generateId("admin");
  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare(`
    INSERT INTO admins (id, username, username_norm, password_hash, role, created_at, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, username, usernameNorm, passwordHash, "admin", nowIso(), req.session.username);

  const admins = listAdmins();
  res.json({ ok: true, admins });
});

app.delete(
  "/api/admins/:id",
  rateLimitMiddleware("admins_delete", LOGIN_RATE_WINDOW_MS, LOGIN_RATE_MAX),
  authMiddleware,
  (req, res) => {
  const adminId = String(req.params.id || "").trim();
  const current = db.prepare("SELECT COUNT(*) AS count FROM admins").get();
  if ((current?.count || 0) <= 1) {
    return res.status(400).json({ ok: false, error: "LAST_ADMIN" });
  }

  const target = db.prepare("SELECT id, role FROM admins WHERE id = ?").get(adminId);
  if (!target) {
    return res.status(404).json({ ok: false, error: "ADMIN_NOT_FOUND" });
  }
  if (normalizeAdminRole(target.role) === "owner") {
    return res.status(403).json({ ok: false, error: "OWNER_PROTECTED" });
  }

  db.prepare("DELETE FROM sessions WHERE admin_id = ?").run(adminId);
  db.prepare("DELETE FROM admins WHERE id = ?").run(adminId);

  const admins = listAdmins();
  res.json({ ok: true, admins });
});

app.get(
  "/api/state",
  rateLimitMiddleware("state_get", LOGIN_RATE_WINDOW_MS, LOGIN_RATE_MAX * 4),
  authMiddleware,
  (_req, res) => {
  const rows = db.prepare("SELECT state_key, state_value FROM state_store").all();
  const state = {};
  rows.forEach((row) => {
    try {
      state[row.state_key] = JSON.parse(row.state_value);
    } catch (_err) {
      state[row.state_key] = null;
    }
  });
  res.json({ ok: true, state });
});

app.put(
  "/api/state/:key",
  rateLimitMiddleware("state_put", LOGIN_RATE_WINDOW_MS, LOGIN_RATE_MAX * 6),
  authMiddleware,
  (req, res) => {
  const key = String(req.params.key || "").trim();
  if (!key) {
    return res.status(400).json({ ok: false, error: "INVALID_KEY" });
  }

  const value = req.body?.value;
  upsertState(key, value, req.session.username);

  res.json({ ok: true });
});

app.post(
  "/api/state/bulk",
  rateLimitMiddleware("state_bulk", LOGIN_RATE_WINDOW_MS, LOGIN_RATE_MAX * 2),
  authMiddleware,
  (req, res) => {
  const state = req.body?.state;
  if (!state || typeof state !== "object" || Array.isArray(state)) {
    return res.status(400).json({ ok: false, error: "INVALID_STATE" });
  }

  const tx = db.transaction((entries) => {
    entries.forEach(([key, value]) => {
      upsertState(key, value, req.session.username);
    });
  });

  tx(Object.entries(state));
  res.json({ ok: true });
});

if (BACKUP_INTERVAL_MINUTES > 0) {
  const backupTimer = setInterval(() => {
    runBackup().catch(() => {});
  }, BACKUP_INTERVAL_MINUTES * 60 * 1000);
  if (typeof backupTimer.unref === "function") {
    backupTimer.unref();
  }
}

app.use((err, _req, res, _next) => {
  if (res.headersSent) {
    return _next(err);
  }

  if (err.message === "CORS_BLOCKED") {
    return res.status(403).json({ ok: false, error: "CORS_BLOCKED" });
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ ok: false, error: "INVALID_JSON" });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MQG backend listening on http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Using sqlite database at: ${DB_PATH}`);
  // eslint-disable-next-line no-console
  console.log(`Backups directory: ${BACKUP_DIR} (every ${BACKUP_INTERVAL_MINUTES} minutes)`);
  runBackup().catch(() => {});

  if (ENABLE_SELF_KEEPALIVE && SELF_KEEPALIVE_URL) {
    // eslint-disable-next-line no-console
    console.log(`Self keepalive enabled -> ${SELF_KEEPALIVE_URL}/api/health every ${Math.round(SELF_KEEPALIVE_INTERVAL_MS / 1000)}s`);
    runSelfKeepaliveTick().catch(() => {});
    const keepaliveTimer = setInterval(() => {
      runSelfKeepaliveTick().catch(() => {});
    }, SELF_KEEPALIVE_INTERVAL_MS);
    if (typeof keepaliveTimer.unref === "function") {
      keepaliveTimer.unref();
    }
  } else {
    // eslint-disable-next-line no-console
    console.log("Self keepalive disabled.");
  }
});
