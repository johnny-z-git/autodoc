import { createHash, randomBytes } from "node:crypto";

export function generateNonce(bytes = 16): string {
  return randomBytes(bytes).toString("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
