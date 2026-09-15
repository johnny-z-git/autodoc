import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const servicesRouter = Router();

servicesRouter.get("/", async (_req, res, next) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { title: "asc" },
    });
    res.json({ services });
  } catch (error) {
    next(error);
  }
});

servicesRouter.get("/:slug", async (req, res, next) => {
  try {
    const service = await prisma.service.findUnique({
      where: { slug: req.params.slug },
    });
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }
    res.json({ service });
  } catch (error) {
    next(error);
  }
});
