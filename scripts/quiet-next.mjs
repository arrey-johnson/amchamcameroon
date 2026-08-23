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

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
