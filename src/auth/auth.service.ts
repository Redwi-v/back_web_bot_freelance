import {  Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ICreateUserData } from './auth.types';



@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(userData: ICreateUserData) {
    try {
      return this.prisma.user.create({
        data: {
          age: userData.age,
          email: userData.email,
          name: userData.name,
          telegramId: userData.telegramId,
          about: userData.about,

          activeRole:  {
            connect: {
              index:   userData.activeRoleIndex || 'customer'
            }
          },

          avatarUrl: userData.avatarUrl,

          categories: {
            connect: userData.categoriesIdentifiers || []
          },
          specializations: {
            connect: userData.categoriesIdentifiers || []
          }
        }
      })

    } catch (error) {
      console.log(error);
    }
  }

  async getUserById(id: number | string) {
    const data = await this.prisma.user.findUnique({
      where: {
        id: +id,
      },
      include: {
        categories: true,
        activeRole: true,
        Orders: true,
        responses: true,
        reviewsList: true,
        specializations: true
      },
    });

    return data;
  }

  async registerMany(users: Prisma.UserCreateManyInput[]) {}



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


}
