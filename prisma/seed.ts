import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const categories = [
  {
    name: 'Дизайн',
  },
  {
    name: 'Администрирование',
  },
  {
    name: 'Анимация и Флеш',
  },
  {
    name: 'Дизайн и Арт',
  },
  {
    name: 'Продвижение сайтов (SEO)',
  },
  {
    name: 'Разработка сайтов',
  },
  {
    name: 'Реклама и Маркетинг',
  },
  {
    name: 'Учеба и консультации',
  },
  {
    name: 'Фото / Видео / Аудио',
  },
  {
    name: 'Архитектура и инжиниринг',
  },
];

const specializations = [
  {
    label: 'Инфографика',
  },
  {
    label: 'SEO',
  },
  {
    label: 'Менеджеры',
  },
  {
    label: 'Реклама',
  },
  {
    label: 'Сертификации/декларации',
  },

  {
    label: 'Бухгалтерия',
  },
  {
    label: 'Фотографы',
  },
  {
    label: 'Обучение',
  },
];

const main = async () => {
  await prisma.categorie.createMany({
    data: categories,
  });

  await prisma.role.createMany({
    data: [
      {
        index: 'freelancer',
      },
      {
        index: 'customer',
      },
    ],
  });

  await prisma.specialization.createMany({  
    data: specializations,
  });

  

};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
