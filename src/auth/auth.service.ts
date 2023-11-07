import { Body, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  register(userData: User) {
    return this.prisma.user.create({
      data: {
        ...userData,
        categories: {
          connect: [],
        },
      },
    });
  }

  registerMany(users: Prisma.UserCreateManyInput[]) {}

  getUserById(id: number | string) {
    return this.prisma.user.findUnique({
      where: {
        id: +id,
      },
      include: {
        categories: true,
      },
    });
  }

  getFreelance(filters: { categories: string[] }) {
    let prismaParams: Prisma.UserFindManyArgs = {
      where: {
        role: 'freelancer',
      },
    };

    if (filters.categories) {
      prismaParams.where = {
        ...prismaParams.where,

        categories: {},
      };
    }

    return this.prisma.user.findMany();
  }
}
