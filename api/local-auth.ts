/**
 * Self-hosted local authentication (username + password).
 * Used when the app runs outside the Kimi platform (own server / own domain).
 * Passwords are hashed with Node's built-in scrypt — no external dependency.
 */
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/** Local users get a unionId of the form `local:<username>` so the existing
 * session/JWT/cookie infrastructure works unchanged. */
export function localUnionId(username: string): string {
  return `local:${username.toLowerCase()}`;
}

export const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,32}$/;
