import { Controller, Get, Post, Body, HttpCode, Query } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrderService } from './order.service';

@Controller('auth')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}



}
