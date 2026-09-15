import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  {
    slug: "diagnostics",
    title: "Выездная диагностика",
    description:
      "Приезжаем к вам, подключаем сканер и выясняем причину неисправности на месте.",
    basePriceFrom: 2500,
    durationHint: "40–60 мин",
    imageUrl: null,
  },
  {
    slug: "oil-change",
    title: "Замена масла и фильтров",
    description:
      "Забираем авто, меняем масло и фильтры на сервисе, возвращаем в удобное окно.",
    basePriceFrom: 4500,
    durationHint: "2–3 часа",
    imageUrl: null,
  },
  {
    slug: "brake-service",
    title: "Тормозная система",
    description:
      "Колодки, диски, жидкость. Временная машина — по запросу на время ремонта.",
    basePriceFrom: 8000,
    durationHint: "4–8 часов",
    imageUrl: null,
  },
  {
    slug: "battery",
    title: "АКБ и запуск",
    description:
      "Проверка и замена аккумулятора с выездом. При необходимости — доставка АКБ.",
    basePriceFrom: 1500,
    durationHint: "30–50 мин",
    imageUrl: null,
  },
  {
    slug: "suspension",
    title: "Ходовая часть",
    description:
      "Стойки, сайлентблоки, рычаги. Забираем авто, чиним, возвращаем с актом работ.",
    basePriceFrom: 12000,
    durationHint: "1–2 дня",
    imageUrl: null,
  },
  {
    slug: "ac-service",
    title: "Кондиционер",
    description:
      "Заправка фреоном, поиск утечек, замена компрессора при необходимости.",
    basePriceFrom: 5000,
    durationHint: "2–6 часов",
    imageUrl: null,
  },
  {
    slug: "body-glass",
    title: "Стёкла и кузовной мини-ремонт",
    description:
      "Замена лобового, мелкий кузовной ремонт. Подменный авто на время работ.",
    basePriceFrom: 9000,
    durationHint: "1 день",
    imageUrl: null,
  },
  {
    slug: "seasonal",
    title: "Сезонное ТО",
    description:
      "Комплекс перед зимой или летом: жидкости, резина, проверка узлов.",
    basePriceFrom: 7000,
    durationHint: "3–5 часов",
    imageUrl: null,
  },
];

async function main() {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  console.log(`Seeded ${services.length} services`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
