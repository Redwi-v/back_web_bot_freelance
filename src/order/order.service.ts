import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { IOrder } from './order.types';



@Injectable()
export class OrderService {
  constructor (private prisma: PrismaService) {}

  async createOrder(order: IOrder) {
    const { description, categories, price, userTgId, specializations, title} = order;

    try {

      return this.prisma.order.create({
        data: {
          description: description,
          title: title,
          price: Number(price),
          author: {
            connect: {
              telegramId: String(userTgId),
            },
          },
          categories: {
            connect: categories
          },
          specializations: {
            connect: specializations
          }
  
      }});

    } catch (error) {
      console.log(error);

      throw new BadRequestException('Server err', {
        description: error.message,
      });
      
    }


  }

  async getOrderById(orderId: number) {
    
    try {
       const order = this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          categories: true,
          author: true,
          specializations: true,
        },
      });


      if ( !order ) throw new BadRequestException('failed to create order');

      return order

    } catch (error) {

      console.log(error);

      throw new BadRequestException('Server err', {
        description: error.message,
      });
      
    }


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
