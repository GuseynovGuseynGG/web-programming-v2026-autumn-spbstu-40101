import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const secretFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".session-secret");

export async function loadSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  try {
    const saved = (await readFile(secretFile, "utf8")).trim();
    if (saved) return saved;
  } catch {
    /* generate below */
  }
  const secret = randomBytes(32).toString("hex");
  await writeFile(secretFile, secret, { encoding: "utf8", mode: 0o600 });
  return secret;
}
