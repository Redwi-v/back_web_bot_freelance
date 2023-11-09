import { Body, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { response } from 'express';
import { PrismaService } from 'src/prisma.service';

interface IOrder {
  description: string;
  price: number;
  userTgId: string;
  categories: string[];
}

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(userData: Prisma.UserCreateInput, categories?: string[]) {

    try {
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

      await this.prisma.user.create({
        data: {
          ...userData,
          categories: {
            connect: categoriesData,
          },
          rate: 0,
        },
      });
    } catch (error) {
      console.log(error);
    }

    return;
  }

  async registerMany(users: Prisma.UserCreateManyInput[]) {}

  async getUserById(id: number | string) {
    const data = await this.prisma.user.findUnique({
      where: {
        id: +id,
      },
      include: {
        categories: true,
      },
    });

    return data;
  }

  async getUserByTgId(TgId: string) {
    const data = await this.prisma.user.findUnique({
      where: {
        telegramId: String(TgId),
      },
      include: {
        activeRole: true,
        categories: true,
        responses: true,
        reviewsList: true,
      },
    });

    return data;
  }

  async getFreelance(filters: { categories: string[] }) {
    let prismaParams: Prisma.UserFindManyArgs = {
      where: {
        roleIndex: 'freelancer',
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

    const data = await this.prisma.user.findMany(prismaParams);
    return data;
  }

  async getCategories() {
    return this.prisma.categorie.findMany({});
  }

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
