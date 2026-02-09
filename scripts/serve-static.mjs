import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const ROOT = process.cwd();
const PORT = Number(process.argv[2] || process.env.PORT || 4173);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".txt": "text/plain; charset=utf-8",
};

function resolveFilePath(requestUrlPathname) {
  let pathname;
  try {
    pathname = decodeURIComponent(requestUrlPathname || "/");
  } catch {
    pathname = "/";
  }

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const normalized = path.normalize(pathname).replace(/^\.\.(?:[\\/]|$)+/, "");
  return path.join(ROOT, normalized);
}

function sendResponse(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    sendResponse(res, 400, "Bad Request");
    return;
  }

  const requestUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const filePath = resolveFilePath(requestUrl.pathname);

  if (!filePath.startsWith(ROOT)) {
    sendResponse(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      sendResponse(res, 404, "Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": mimeType,
      "Cache-Control": "no-store",
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Static test server listening on http://127.0.0.1:${PORT}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
