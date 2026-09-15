import { Router } from "express";
import { PendingAuthStatus } from "@prisma/client";
import { env } from "../env.js";
import { generateNonce } from "../lib/crypto.js";
import { prisma } from "../lib/prisma.js";
import { clearSessionCookie, createSession, destroySession } from "../lib/session.js";
import { telegramStartLimiter } from "../middleware/rateLimit.js";

const PENDING_TTL_MS = 5 * 60 * 1000;

export const authRouter = Router();

authRouter.post("/telegram/start", async (req, res, next) => {
  try {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const limit = telegramStartLimiter(ip);
    if (!limit.allowed) {
      res.setHeader("Retry-After", String(limit.retryAfterSec));
      res.status(429).json({ error: "Too many auth attempts. Try again later." });
      return;
    }

    const nonce = generateNonce(16);
    const expiresAt = new Date(Date.now() + PENDING_TTL_MS);
    const botUsername = env.TELEGRAM_BOT_USERNAME.replace(/^@/, "");

    await prisma.pendingAuth.create({
      data: {
        nonce,
        status: PendingAuthStatus.PENDING,
        expiresAt,
      },
    });

    res.json({
      nonce,
      expiresAt: expiresAt.toISOString(),
      deepLink: `https://t.me/${botUsername}?start=${nonce}`,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/telegram/poll", async (req, res, next) => {
  try {
    const nonce = typeof req.query.nonce === "string" ? req.query.nonce : "";
    if (!/^[a-f0-9]{32}$/i.test(nonce)) {
      res.status(400).json({ error: "Invalid nonce" });
      return;
    }

    const pending = await prisma.pendingAuth.findUnique({ where: { nonce } });
    if (!pending) {
      res.json({ status: "EXPIRED" });
      return;
    }

    if (pending.expiresAt.getTime() <= Date.now()) {
      if (pending.status === PendingAuthStatus.PENDING) {
        await prisma.pendingAuth.update({
          where: { id: pending.id },
          data: { status: PendingAuthStatus.EXPIRED },
        });
      }
      res.json({ status: "EXPIRED" });
      return;
    }

    if (pending.status === PendingAuthStatus.PENDING) {
      res.json({ status: "PENDING" });
      return;
    }

    if (pending.status === PendingAuthStatus.EXPIRED || pending.status === PendingAuthStatus.CANCELED) {
      res.json({ status: pending.status });
      return;
    }

    if (pending.status !== PendingAuthStatus.COMPLETED || !pending.userId) {
      res.json({ status: "PENDING" });
      return;
    }

    // Race-safe claim: only one poller can move COMPLETED → CANCELED
    const claimed = await prisma.pendingAuth.updateMany({
      where: {
        id: pending.id,
        status: PendingAuthStatus.COMPLETED,
      },
      data: { status: PendingAuthStatus.CANCELED },
    });

    if (claimed.count === 0) {
      res.json({ status: "CANCELED" });
      return;
    }

    await createSession(pending.userId, res);
    await prisma.pendingAuth.delete({ where: { id: pending.id } }).catch(() => undefined);

    res.json({ status: "SIGNED_IN" });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    await destroySession(token);
    clearSessionCookie(res);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});
