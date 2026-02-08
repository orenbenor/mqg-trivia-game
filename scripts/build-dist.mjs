import { mkdir, rm, cp } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");

const filesToCopy = [
  "index.html",
  "styles.css",
  "config.js",
  "app.js",
  "manifest.webmanifest",
  "sw.js",
  ".nojekyll",
  "netlify.toml",
  "vercel.json",
];

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  for (const file of filesToCopy) {
    await cp(path.join(projectRoot, file), path.join(distDir, file), {
      recursive: false,
      force: true,
    });
  }

  await cp(path.join(projectRoot, "assets"), path.join(distDir, "assets"), {
    recursive: true,
    force: true,
  });

  console.log(`Built static bundle at: ${distDir}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
