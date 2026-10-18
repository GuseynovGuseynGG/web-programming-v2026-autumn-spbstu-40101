import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const KEY_LEN = 32;

export function isHashedPassword(value) {
  return typeof value === "string" && value.startsWith("scrypt:");
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LEN);
  return `scrypt:${salt.toString("hex")}:${Buffer.from(hash).toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  if (!isHashedPassword(stored)) {
    const left = Buffer.from(String(password));
    const right = Buffer.from(String(stored ?? ""));
    if (left.length !== right.length) {
      timingSafeEqual(left, Buffer.alloc(left.length));
      return false;
    }
    return timingSafeEqual(left, right);
  }
  const parts = stored.split(":");
  if (parts.length !== 3) return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  if (!salt.length || expected.length !== KEY_LEN) return false;
  const actual = await scryptAsync(password, salt, expected.length);
  return timingSafeEqual(Buffer.from(actual), expected);
}
