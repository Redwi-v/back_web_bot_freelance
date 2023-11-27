import { Module } from '@nestjs/common';
import { ResponseService } from './response.service';
import { ResponseController } from './response.controller';
import { PrismaService } from 'src/prisma.service';
import { ConnectsService } from 'src/connects/connects.service';
import { OrderService } from 'src/order/order.service';

@Module({
  controllers: [ResponseController],
  providers: [ResponseService, PrismaService, ConnectsService, OrderService],
})
export class ResponseModule {}
