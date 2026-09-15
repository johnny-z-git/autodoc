import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { Bot } from "grammy";
import { PendingAuthStatus, PrismaClient, Role } from "@prisma/client";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
dotenv.config({ path: path.join(rootDir, ".env") });

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

const prisma = new PrismaClient();
const bot = new Bot(token);

const NONCE_RE = /^[a-f0-9]{32}$/i;

bot.command("start", async (ctx) => {
  const raw = ctx.match?.toString().trim() ?? "";
  const nonce = raw.split(/\s+/)[0] ?? "";

  if (!NONCE_RE.test(nonce)) {
    await ctx.reply(
      "Откройте вход на сайте AutoDoc и нажмите «Продолжить с Telegram» — ссылка придёт оттуда.",
    );
    return;
  }

  const pending = await prisma.pendingAuth.findUnique({ where: { nonce } });
  if (!pending) {
    await ctx.reply("Ссылка недействительна. Запросите вход на сайте ещё раз.");
    return;
  }

  if (pending.status !== PendingAuthStatus.PENDING) {
    await ctx.reply("Эта ссылка уже использована. Запросите вход на сайте ещё раз.");
    return;
  }

  if (pending.expiresAt.getTime() <= Date.now()) {
    await prisma.pendingAuth.update({
      where: { id: pending.id },
      data: { status: PendingAuthStatus.EXPIRED },
    });
    await ctx.reply("Ссылка истекла. Запросите вход на сайте ещё раз.");
    return;
  }

  const from = ctx.from;
  if (!from) {
    await ctx.reply("Не удалось получить профиль Telegram.");
    return;
  }

  const telegramId = String(from.id);
  const user = await prisma.user.upsert({
    where: { telegramId },
    create: {
      telegramId,
      username: from.username ?? null,
      firstName: from.first_name ?? null,
      lastName: from.last_name ?? null,
      role: Role.CUSTOMER,
    },
    update: {
      username: from.username ?? null,
      firstName: from.first_name ?? null,
      lastName: from.last_name ?? null,
    },
  });

  const updated = await prisma.pendingAuth.updateMany({
    where: {
      id: pending.id,
      status: PendingAuthStatus.PENDING,
    },
    data: {
      status: PendingAuthStatus.COMPLETED,
      userId: user.id,
    },
  });

  if (updated.count === 0) {
    await ctx.reply("Ссылка уже обработана. Вернитесь на сайт.");
    return;
  }

  await ctx.reply("Авторизация завершена. Вернитесь на сайт AutoDoc — вход подтвердится автоматически.");
});

bot.catch((err) => {
  console.error("Telegram bot error:", err);
});

async function main() {
  console.log("AutoDoc Telegram bot starting…");
  await bot.start({
    onStart: (info) => {
      console.log(`Bot @${info.username} is running`);
    },
  });
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
