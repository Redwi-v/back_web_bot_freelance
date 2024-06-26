import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();




const categories = [
  {
    name: 'Одежда и обувь',
  },
  {
    name: 'Товары для дома',
  },
  {
    name: 'Техника и электроника',
  },
  {
    name: 'Красота и здоровье',
  },
  {
    name: 'Детские товары',
  },
  {
    name: 'Спорт и активный отдых',
  },
  {
    name: 'Автотовары',
  },
  {
    name: 'Товары для дачи и сада',
  },
  {
    name: 'Канцтовары и книги',
  },

  {
    name: 'Ювелирные изделия',
  },
  {
    name: 'Мебель и интерьер',
  },
    {
    name: 'Подарки и сувениры',
  },
    {
    name: 'Строительство и ремонт',
  },
    {
    name: 'Музыкальные инструменты',
  },
    {
    name: 'Часы',
  },
    {
    name: 'Товары для животных',
  },
    {
    name: 'Искусство',
  },
    {
    name: 'Продукты питания и напитки',
  },
    {
    name: 'Туризм и отдых',
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
