import type { NextFunction, Request, Response } from "express";
import { env } from "../env.js";
import { getSessionUser } from "../lib/session.js";
import type { User } from "@prisma/client";

export type AuthedRequest = Request & { user?: User };

export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    req.user = (await getSessionUser(token)) ?? undefined;
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    const user = await getSessionUser(token);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
