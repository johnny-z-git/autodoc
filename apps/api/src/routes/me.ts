import { Router } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

export const meRouter = Router();

const patchMeSchema = z.object({
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),
  phone: z.string().trim().min(5, "Phone is too short").optional().nullable().or(z.literal("")),
});

function publicUser(user: {
  id: string;
  telegramId: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    telegramId: user.telegramId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  };
}

meRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  res.json({ user: publicUser(req.user!) });
});

meRouter.patch("/", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const parsed = patchMeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }

    const email =
      parsed.data.email === undefined
        ? undefined
        : parsed.data.email === "" || parsed.data.email === null
          ? null
          : parsed.data.email;
    const phone =
      parsed.data.phone === undefined
        ? undefined
        : parsed.data.phone === "" || parsed.data.phone === null
          ? null
          : parsed.data.phone;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
    });

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});
