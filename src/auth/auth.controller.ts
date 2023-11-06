import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('register')
  register(@Body() userData: User) {
    return this.authService.register({ ...userData, about: 'about' });
  }

  @Get('freelancers')
  getFreelancers() {
    return this.authService.getFreelance();
  }
}
