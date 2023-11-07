import { Controller, Get, Post, Body, HttpCode, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma, User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('register')
  register(@Body() userData: User) {
    return this.authService.register(userData);
  }

  @Post('reg_many')
  regMany(@Body() users: Prisma.UserCreateManyInput[]) {
    return this.authService.registerMany(users);
  }

  @Get('freelancers')
  getFreelancers(@Query() filters: { categories: string[] }) {
    return this.authService.getFreelance(filters);
  }

  @Get('user')
  getUserById(@Query() query: { id: string }) {
    return this.authService.getUserById(query.id);
  }
}
