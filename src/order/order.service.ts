import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

interface IOrder {
  description: string;
  price: number;
  userTgId: string;
  categories: string[];
}

@Injectable()
export class OrderService {
  constructor (private prisma: PrismaService) {}

  async createOrder(order: IOrder) {
    const { description, categories, price, userTgId } = order;

    const categoriesData: Prisma.CategorieWhereUniqueInput[] = [];

    if (categories) {
      categories.forEach((catName) => {
        const HaveCat = this.prisma.categorie.findUnique({
          where: {
            name: catName,
          },
        });

        if (!HaveCat) return;

        categoriesData.push({
          name: catName,
        });
      });
    }

    return this.prisma.order.create({
      data: {
        description: description,
        price: Number(price),
        author: {
          connect: {
            telegramId: String(userTgId),
          },
        },

        categories: {
          connect: categoriesData,
        },
      },
    });
  }

  async getOrderById(orderId: number) {
    return this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        categories: true,
        author: true,
      },
    });
  }

  async getAllOrders(filters: { categories: string[] }) {
    let prismaParams: Prisma.OrderFindManyArgs = {
      where: {},
      include: {
        author: true,
      },
    };

    if (filters.categories) {
      const andParams: Prisma.CategorieWhereInput[] = [];

      filters.categories.forEach((filterName) => {
        andParams.push({
          name: filterName,
        });
      });

      prismaParams.where = {
        ...prismaParams.where,

        categories: {
          some: {
            OR: andParams,
          },
        },
      };
    }

    return this.prisma.order.findMany(prismaParams);
  }
}
