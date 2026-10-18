import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");

export async function readJson(name) {
  const file = path.basename(String(name));
  if (file !== name || !file.endsWith(".json")) {
    throw new Error("Invalid data file");
  }
  const raw = await readFile(path.join(dataDir, file), "utf8");
  return JSON.parse(raw);
}

export async function writeJson(name, data) {
  const file = path.basename(String(name));
  if (file !== name || !file.endsWith(".json")) {
    throw new Error("Invalid data file");
  }
  await writeFile(path.join(dataDir, file), JSON.stringify(data, null, 2), "utf8");
}
