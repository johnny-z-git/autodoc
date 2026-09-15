import type { Response } from "express";
import { env, isProd } from "../env.js";
import { generateSessionToken, hashToken } from "./crypto.js";
import { prisma } from "./prisma.js";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    expires: expiresAt,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });
}

export async function createSession(userId: string, res: Response) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  setSessionCookie(res, token, expiresAt);
  return { token, expiresAt };
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await prisma.session.deleteMany({
    where: { tokenHash: hashToken(token) },
  });
}

export async function getSessionUser(token: string | undefined) {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  return session.user;
}
