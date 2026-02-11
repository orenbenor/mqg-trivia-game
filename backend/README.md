# MQG Trivia Backend

Cloud backend for admin auth + shared game state sync.

## What it handles

- Admin login with username/password (hashed with `bcrypt`)
- Self password change for logged-in admin (`/api/auth/password`)
- Multi-admin create/delete
- First admin is marked as `owner` (protected from deletion)
- Shared state across devices:
  - attempts
  - activities
  - drafts
  - custom questions
  - disabled ids
  - overrides
  - question cycles
- Public attempts ingestion (optional) with `PUBLIC_WRITE_KEY`
- Public issue reports ingestion (optional) with `PUBLIC_WRITE_KEY`
- Optional self-keepalive ping (free cold-start mitigation)
- Rate limiting + login lockout + sqlite backups

## Quick start

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Set initial admin credentials in `.env` (required on first run):

- `DEFAULT_ADMIN_USERNAME`
- `DEFAULT_ADMIN_PASSWORD`

4. Run:

```bash
npm start
```

Default URL: `http://localhost:8787`

## Important security behavior

- There is no hardcoded default admin in code.
- If DB has no admins and env creds are missing, server startup fails intentionally.
- Session auth uses `HttpOnly` cookie (`SESSION_COOKIE_NAME`).
- In production (`NODE_ENV=production`), wildcard CORS is blocked.

## Production checklist

- Use HTTPS.
- Set strict `CORS_ORIGIN` (comma-separated if needed), never `*`.
- Set strong values for:
  - `DEFAULT_ADMIN_USERNAME`
  - `DEFAULT_ADMIN_PASSWORD`
  - `MIN_PASSWORD_LENGTH`
  - `PUBLIC_WRITE_KEY` (if using public attempt + issue-report sync)
- Use durable storage for:
  - `DB_PATH`
  - `BACKUP_DIR`
- Keep `SESSION_COOKIE_SAMESITE=none` when frontend/backend are on different domains.

## Free cold-start mitigation

If you stay on a free hosting tier, you can enable internal keepalive:

- `ENABLE_SELF_KEEPALIVE=true`
- `SELF_KEEPALIVE_URL=https://mqg-trivia-backend.onrender.com`
- `SELF_KEEPALIVE_INTERVAL_MS=240000`

This schedules a lightweight self-ping to `/api/health` every 4 minutes.

## Frontend integration

In frontend `config.js`:

```js
window.MQG_BACKEND_CONFIG = {
  enabled: true,
  baseUrl: "https://mqg-trivia-backend.onrender.com",
  syncIntervalMs: 15000,
  publicWriteKey: "a80732e8237d1cdb0e35c0ed1c4e046e2381247a0e9eaadb",
  allowInsecureLocalFallback: false,
};
```
