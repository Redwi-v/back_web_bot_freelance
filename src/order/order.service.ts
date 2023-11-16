import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { IOrder } from './order.types';
import { IFreelanceFindParams, SortingValues } from 'src/auth/auth.types';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(order: IOrder) {
    const { description, categories, price, userTgId, specializations, title } =
      order;

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
            connect: categories,
          },
          specializations: {
            connect: specializations,
          },
        },
      });
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
          executor: true,
          responses: {
            include: {
              User: true,
            },
          },
        },
      });

      if (!order) throw new BadRequestException('failed to create order');

      return order;
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Server err', {
        description: error.message,
      });
    }
  }

  async getAllOrders(params: IFreelanceFindParams) {
    const {
      categories,
      maxPrice,
      minPrice,
      sorting,
      specializations,
      term,
      sortType,
    } = params;
    try {
      let findParams: Prisma.OrderFindManyArgs = {
        where: {
          status: 'inSearch',
        },
      };

      if (categories) {
        findParams.where = {
          ...findParams.where,
          categories: {
            some: {
              id: {
                in: categories || [],
              },
            },
          },
        };
      }

      if (specializations) {
        findParams.where = {
          ...findParams.where,
          specializations: {
            some: {
              id: {
                in: specializations || [],
              },
            },
          },
        };
      }

      if (minPrice && maxPrice) {
        findParams.where = {
          ...findParams.where,

          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        };
      }

      if (
        sorting === SortingValues.PRICE &&
        sortType &&
        (sortType === 'asc' || sortType === 'desc')
      ) {
        findParams = {
          ...findParams,
          orderBy: {
            price: sortType,
          },
        };
      }

      if (
        sorting === SortingValues.RATING &&
        sortType &&
        (sortType === 'asc' || sortType === 'desc')
      ) {
        findParams = {
          ...findParams,
          orderBy: {
            author: {
              rating: sortType,
            },
          },
        };
      }

      if (term) {
        findParams.where = {
          ...findParams.where,
          OR: [
            {
              title: {
                contains: term,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: term,
                mode: 'insensitive',
              },
            },
          ],
        };
      }

      return this.prisma.order.findMany({
        ...findParams,
        include: {
          author: true,
          categories: true,
          executor: true,
          responses: true,
          specializations: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Server Err', {
        description: error.message,
      });
    }
  }

  async archive(authorTgId: string | number, orderId: string | number) {
    try {
      return this.prisma.order.update({
        where: {
          id: +orderId,
          author: {
            telegramId: String(authorTgId),
          },
        },
        data: {
          status: 'inArchive',
        },
      });
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Server err', {
        description: error.message,
      });
    }
  }
  async unzip(authorTgId: string | number, orderId: string | number) {
    try {
      return this.prisma.order.update({
        where: {
          id: +orderId,
          author: {
            telegramId: String(authorTgId),
          },
        },
        data: {
          status: 'inSearch',
        },
      });
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Server err', {
        description: error.message,
      });
    }
  }

  async getAllOrdersByTgId(userTgId: string) {
    try {
      return this.prisma.order.findMany({
        where: {
          author: {
            telegramId: userTgId,
          },
          status: {
            not: 'inArchive'
          }
        },
        include: {
          responses: {
            include: {
              User: true
            }
          }
        }
      });
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Server err', {
        description: error.message,
      });
    }
  }

  async getAllArchiveOrdersByTgId(userTgId: string) {
    try {
      return this.prisma.order.findMany({
        where: {
          author: {
            telegramId: userTgId,
          },
          status: 'inArchive',
        },
      });
    } catch (error) {
      console.log(error);

      throw new BadRequestException('Server err', {
        description: error.message,
      });
    }
  }
  
  async closeOrder (userTgId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: +orderId
      },
      include: {
        executor: true,
        author: true
      }
    })

    if(order?.executor?.telegramId === userTgId) {
      return this.prisma.order.update({
        where: {
          id: +orderId
        },
        data: {
          executorIsCloseOrder: true,
          status: order.authorIsCloseOrder ? 'completed' : 'inWork'
        }
      })
    }else {
      return this.prisma.order.update({
        where: {
          id: +orderId
        },
        data: {
          authorIsCloseOrder: true,
          status: order?.executorIsCloseOrder ? 'completed' : 'inWork'
        }
      })
    }

  }
}
