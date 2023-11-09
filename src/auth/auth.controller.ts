import { Controller, Get, Post, Body, HttpCode, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma, User } from '@prisma/client';
import { query } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('register')
  register(@Body() userData: Prisma.UserCreateInput) {
    return this.authService.register(userData);
  }

  @Post('reg_many')
  regMany(@Body() users: Prisma.UserCreateManyInput[]) {
    return this.authService.registerMany(users);
  }

  @Get('freelancers')
  getFreelancers(
    @Query()
    params: {
      categories: string[];
    },
  ) {
    return this.authService.getFreelance({
      categories: params.categories,
    });
  }

  @Get('user')
  getUserById(@Query() query: { id: string }) {
    return this.authService.getUserById(query.id);
  }

  @Get('tgUser')
  async getUserByTgId(@Query() query: { id: string }) {
    const data = await this.authService.getUserByTgId(query.id);

    return data;
  }

  @Get('categories')
  async getCategories() {
    return this.authService.getCategories();
  }

  @Post('order')
  async createOrder(
    @Body()
    orderData: {
      description: string;
      userTgId: string;
      categories: string[];
      price: number;
    },
  ) {
    return this.authService.createOrder(orderData);
  }

  @Get('getOrdersList')
  async getOrdersList(@Query() filters: { categories: string[] }) {
    return this.authService.getAllOrders(filters);
  }

  @Get('orderById')
  async getOrder(@Query() query: { id: string }) {
    return this.authService.getOrderById(+query.id);
  }
}
