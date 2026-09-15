import { Router } from "express";
import { RequestStatus, Role } from "@prisma/client";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";

export const requestsRouter = Router();

const customerWritableStatuses: RequestStatus[] = [RequestStatus.NEW];

const createSchema = z.object({
  brand: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  licensePlate: z.string().trim().min(3).max(20),
  address: z.string().trim().min(5).max(300),
  preferredSlot: z.string().datetime({ offset: true }).or(z.string().datetime()),
  preferredSlotEnd: z
    .string()
    .datetime({ offset: true })
    .or(z.string().datetime())
    .optional()
    .nullable(),
  needLoaner: z.boolean().default(false),
  problemDescription: z.string().trim().min(5).max(2000),
  serviceTypes: z.array(z.string().trim().min(1)).default([]),
  contactPhone: z.string().trim().min(5).max(40),
  contactEmail: z.string().email().optional().nullable().or(z.literal("")),
  courierComment: z.string().trim().max(500).optional().nullable().or(z.literal("")),
});

const customerPatchSchema = createSchema.partial().extend({
  status: z.literal(RequestStatus.CANCELLED).optional(),
});

const staffPatchSchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
  vin: z.string().trim().max(32).optional().nullable(),
  estimatedPrice: z.coerce.number().int().min(0).optional().nullable(),
  finalPrice: z.coerce.number().int().min(0).optional().nullable(),
  loanerCarInfo: z.string().trim().max(300).optional().nullable(),
  staffNotes: z.string().trim().max(2000).optional().nullable(),
  brand: z.string().trim().min(1).max(80).optional(),
  model: z.string().trim().min(1).max(80).optional(),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1).optional(),
  licensePlate: z.string().trim().min(3).max(20).optional(),
  address: z.string().trim().min(5).max(300).optional(),
  preferredSlot: z.string().datetime({ offset: true }).or(z.string().datetime()).optional(),
  preferredSlotEnd: z
    .string()
    .datetime({ offset: true })
    .or(z.string().datetime())
    .optional()
    .nullable(),
  needLoaner: z.boolean().optional(),
  problemDescription: z.string().trim().min(5).max(2000).optional(),
  serviceTypes: z.array(z.string().trim().min(1)).optional(),
  contactPhone: z.string().trim().min(5).max(40).optional(),
  contactEmail: z.string().email().optional().nullable().or(z.literal("")),
  courierComment: z.string().trim().max(500).optional().nullable().or(z.literal("")),
});

function normalizeOptionalString(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return value;
}

requestsRouter.use(requireAuth);

requestsRouter.get("/", async (req: AuthedRequest, res, next) => {
  try {
    const user = req.user!;
    const requests = await prisma.repairRequest.findMany({
      where: user.role === Role.STAFF ? undefined : { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

requestsRouter.get("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const user = req.user!;
    const request = await prisma.repairRequest.findUnique({
      where: { id: req.params.id },
    });
    if (!request || (user.role !== Role.STAFF && request.userId !== user.id)) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    res.json({ request });
  } catch (error) {
    next(error);
  }
});

requestsRouter.post("/", async (req: AuthedRequest, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }

    const data = parsed.data;
    const request = await prisma.repairRequest.create({
      data: {
        userId: req.user!.id,
        brand: data.brand,
        model: data.model,
        year: data.year,
        licensePlate: data.licensePlate,
        address: data.address,
        preferredSlot: new Date(data.preferredSlot),
        preferredSlotEnd: data.preferredSlotEnd ? new Date(data.preferredSlotEnd) : null,
        needLoaner: data.needLoaner,
        problemDescription: data.problemDescription,
        serviceTypes: data.serviceTypes,
        contactPhone: data.contactPhone,
        contactEmail: normalizeOptionalString(data.contactEmail) ?? null,
        courierComment: normalizeOptionalString(data.courierComment) ?? null,
      },
    });

    res.status(201).json({ request });
  } catch (error) {
    next(error);
  }
});

requestsRouter.patch("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const user = req.user!;
    const existing = await prisma.repairRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existing || (user.role !== Role.STAFF && existing.userId !== user.id)) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (user.role === Role.STAFF) {
      const parsed = staffPatchSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
        return;
      }
      const data = parsed.data;
      const request = await prisma.repairRequest.update({
        where: { id: existing.id },
        data: {
          ...(data.status !== undefined ? { status: data.status } : {}),
          ...(data.vin !== undefined ? { vin: normalizeOptionalString(data.vin) } : {}),
          ...(data.estimatedPrice !== undefined ? { estimatedPrice: data.estimatedPrice } : {}),
          ...(data.finalPrice !== undefined ? { finalPrice: data.finalPrice } : {}),
          ...(data.loanerCarInfo !== undefined
            ? { loanerCarInfo: normalizeOptionalString(data.loanerCarInfo) }
            : {}),
          ...(data.staffNotes !== undefined
            ? { staffNotes: normalizeOptionalString(data.staffNotes) }
            : {}),
          ...(data.brand !== undefined ? { brand: data.brand } : {}),
          ...(data.model !== undefined ? { model: data.model } : {}),
          ...(data.year !== undefined ? { year: data.year } : {}),
          ...(data.licensePlate !== undefined ? { licensePlate: data.licensePlate } : {}),
          ...(data.address !== undefined ? { address: data.address } : {}),
          ...(data.preferredSlot !== undefined
            ? { preferredSlot: new Date(data.preferredSlot) }
            : {}),
          ...(data.preferredSlotEnd !== undefined
            ? {
                preferredSlotEnd: data.preferredSlotEnd
                  ? new Date(data.preferredSlotEnd)
                  : null,
              }
            : {}),
          ...(data.needLoaner !== undefined ? { needLoaner: data.needLoaner } : {}),
          ...(data.problemDescription !== undefined
            ? { problemDescription: data.problemDescription }
            : {}),
          ...(data.serviceTypes !== undefined ? { serviceTypes: data.serviceTypes } : {}),
          ...(data.contactPhone !== undefined ? { contactPhone: data.contactPhone } : {}),
          ...(data.contactEmail !== undefined
            ? { contactEmail: normalizeOptionalString(data.contactEmail) }
            : {}),
          ...(data.courierComment !== undefined
            ? { courierComment: normalizeOptionalString(data.courierComment) }
            : {}),
        },
      });
      res.json({ request });
      return;
    }

    if (!customerWritableStatuses.includes(existing.status) && req.body?.status !== RequestStatus.CANCELLED) {
      res.status(403).json({ error: "Only NEW requests can be edited" });
      return;
    }

    const parsed = customerPatchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
      return;
    }

    const data = parsed.data;
    if (existing.status !== RequestStatus.NEW && data.status !== RequestStatus.CANCELLED) {
      res.status(403).json({ error: "Only NEW requests can be edited" });
      return;
    }

    const request = await prisma.repairRequest.update({
      where: { id: existing.id },
      data: {
        ...(data.status === RequestStatus.CANCELLED ? { status: RequestStatus.CANCELLED } : {}),
        ...(data.brand !== undefined ? { brand: data.brand } : {}),
        ...(data.model !== undefined ? { model: data.model } : {}),
        ...(data.year !== undefined ? { year: data.year } : {}),
        ...(data.licensePlate !== undefined ? { licensePlate: data.licensePlate } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.preferredSlot !== undefined
          ? { preferredSlot: new Date(data.preferredSlot) }
          : {}),
        ...(data.preferredSlotEnd !== undefined
          ? {
              preferredSlotEnd: data.preferredSlotEnd ? new Date(data.preferredSlotEnd) : null,
            }
          : {}),
        ...(data.needLoaner !== undefined ? { needLoaner: data.needLoaner } : {}),
        ...(data.problemDescription !== undefined
          ? { problemDescription: data.problemDescription }
          : {}),
        ...(data.serviceTypes !== undefined ? { serviceTypes: data.serviceTypes } : {}),
        ...(data.contactPhone !== undefined ? { contactPhone: data.contactPhone } : {}),
        ...(data.contactEmail !== undefined
          ? { contactEmail: normalizeOptionalString(data.contactEmail) }
          : {}),
        ...(data.courierComment !== undefined
          ? { courierComment: normalizeOptionalString(data.courierComment) }
          : {}),
      },
    });

    res.json({ request });
  } catch (error) {
    next(error);
  }
});

requestsRouter.delete("/:id", async (req: AuthedRequest, res, next) => {
  try {
    const user = req.user!;
    const existing = await prisma.repairRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existing || (user.role !== Role.STAFF && existing.userId !== user.id)) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (existing.status === RequestStatus.NEW) {
      await prisma.repairRequest.delete({ where: { id: existing.id } });
      res.json({ ok: true, deleted: true });
      return;
    }

    const request = await prisma.repairRequest.update({
      where: { id: existing.id },
      data: { status: RequestStatus.CANCELLED },
    });
    res.json({ ok: true, deleted: false, request });
  } catch (error) {
    next(error);
  }
});
