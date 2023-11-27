import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ConnectsService } from 'src/connects/connects.service';
import { OrderService } from 'src/order/order.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ResponseService {
  constructor(
    private prisma: PrismaService,
    private connect : ConnectsService,
    private order : OrderService
  ) {}

  async create(params: { text: string; authorTgId: string; orderId: string }) {
    try {
      const userWidthResponse = await this.prisma.user.findUnique({
        where: {
          telegramId: params.authorTgId,
          responses: {
            some: {
              orderId: +params.orderId,
            },
          },
        },
      });

      if (userWidthResponse)
        throw new BadRequestException(
          'you have already responded to the order',
        );

      const response = await this.prisma.response.create({
        data: {
          text: params.text,
          Order: {
            connect: {
              id: +params.orderId,
            },
          },
          User: {
            connect: {
              telegramId: params.authorTgId,
            },
          },
        },
      });

      return response;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Server err', {
        description: error.message,
      });
    }
  }

  async chooseResponse(params: { responseId: string; orderId: string }) {
    const response = await this.prisma.response.findUnique({
      where: {
        id: +params.responseId,
      },
    });

    const order = await this.prisma.order.update({
      where: {
        id: response?.orderId,
      },
      data: {
        executor: {
          connect: {
            id: response?.userId,
          },
        },
        status: 'inWork',
      },
      include: {
        executor: true,
        author: true,
      },
    });
    
    
    if (!order || !order.executor) return;     

     await this.connect.create(order);
     await this.order.closeOrder(order.author.telegramId, String(order.id))
     await this.order.closeOrder(order.executor.telegramId, String(order.id))

    return order;
  }
}
