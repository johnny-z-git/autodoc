import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { meRouter } from "./routes/me.js";
import { servicesRouter } from "./routes/services.js";
import { requestsRouter } from "./routes/requests.js";
import { contactRouter } from "./routes/contact.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: env.APP_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser(env.SESSION_SECRET));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "autodoc-api" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/me", meRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/requests", requestsRouter);
  app.use("/api/contact", contactRouter);

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    },
  );

  return app;
}
