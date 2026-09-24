/**
 * Run Next.js with VIPS/GLib image-warning noise filtered from stderr.
 * Usage: node scripts/quiet-next.mjs dev | start | build …
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/quiet-next.mjs <next-args…>");
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");

const NOISE =
  /GLib-GObject-CRITICAL|VipsInterpretation|invalid or out of range for property 'space'/i;

const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: root,
  env: {
    ...process.env,
    VIPS_WARNING: "0",
    // Reduce GLib chatter when supported
    G_MESSAGES_DEBUG: "",
  },
  stdio: ["inherit", "inherit", "pipe"],
});

let pending = "";
child.stderr.setEncoding("utf8");
child.stderr.on("data", (chunk) => {
  pending += chunk;
  const lines = pending.split(/\r?\n/);
  pending = lines.pop() ?? "";
  for (const line of lines) {
    if (NOISE.test(line)) continue;
    // Keep blank lines only when not sandwiched noise (drop empty noise gaps)
    if (line.trim() === "" && pending === "") continue;
    process.stderr.write(line + "\n");
  }
});
child.stderr.on("end", () => {
  if (pending && !NOISE.test(pending)) process.stderr.write(pending);
});

if (args[0] === "dev" && process.env.WARM_ROUTES !== "0") {
  warmRoutes().catch((err) => console.error("[warm] failed:", err?.message || err));
}

/**
 * `next dev` compiles each route on first visit (5–20 s). Once the server is
 * up, request every route pattern from the sitemap so clicks are instant.
 */
async function warmRoutes() {
  const portFlag = args.findIndex((a) => a === "-p" || a === "--port");
  const port = portFlag >= 0 ? args[portFlag + 1] : process.env.PORT || "3000";
  const origin = `http://localhost:${port}`;

  for (let i = 0; i < 120; i++) {
    try {
      await fetch(origin, { method: "HEAD" });
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  const xml = await (await fetch(`${origin}/sitemap.xml`)).text();
  const seenPatterns = new Set();
  const paths = [];
  for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = new URL(loc).pathname;
    // Detail pages share one compiled route; warming one per pattern is enough.
    const pattern = path.replace(/^\/(en|fr)(?=\/|$)/, "").replace(/^\/(news|events|committees)\/.+$/, "/$1/[slug]");
    const key = `${path.startsWith("/fr") ? "fr" : "en"}:${pattern}`;
    if (pattern.endsWith("[slug]") && seenPatterns.has(key)) continue;
    seenPatterns.add(key);
    paths.push(path);
  }
  paths.push("/search", "/admin");

  const started = Date.now();
  process.stdout.write(`[warm] compiling ${paths.length} routes in the background…\n`);
  const queue = [...paths];
  const worker = async () => {
    for (let path = queue.shift(); path; path = queue.shift()) {
      try {
        await fetch(origin + path);
      } catch {
        // Ignore individual failures; the route compiles on first visit instead.
      }
    }
  };
  await Promise.all([worker(), worker()]);
  process.stdout.write(`[warm] done in ${Math.round((Date.now() - started) / 1000)}s — pages now load instantly\n`);
}

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
