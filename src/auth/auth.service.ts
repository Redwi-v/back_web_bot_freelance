import { Body, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {} from 'prisma';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  register(userData: {
    about: string;
    email: string;
    name: string;
    role: string;
    age: number;
    specialization: string;
  }) {
    return this.prisma.user.create({
      data: {
        about: userData.about,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        age: userData.age,
        specialization: userData.specialization,
      },
    });
  }

  getFreelance(filters: { categories: string[] }) {
    return this.prisma.user.findMany({
      where: {
        role: 'freelancer',
        categories: {
          hasSome: filters.categories,
        },
      },
    });
  }
}
