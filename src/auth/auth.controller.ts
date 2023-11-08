import { Controller, Get, Post, Body, HttpCode, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma, User } from '@prisma/client';

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
    console.log(query.id);

    const data = await this.authService.getUserByTgId(query.id);
    console.log(data);

    return data;
  }

  @Get('categories')
  async getCategories() {
    return this.authService.getCategories();
  }
}
