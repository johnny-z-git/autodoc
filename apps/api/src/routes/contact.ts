import { Router } from "express";
import { z } from "zod";

export const contactRouter = Router();

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  phone: z.string().trim().min(5).max(40).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(2000),
});

contactRouter.post("/", async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }

    // Exam contact form: validate and acknowledge. Persist later if needed.
    console.log("[contact]", {
      ...parsed.data,
      at: new Date().toISOString(),
    });

    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});
