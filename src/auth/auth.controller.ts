import { Controller, Get, Post, Body, HttpCode, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';
import { ICreateUserData, IFreelanceQueryParams } from './auth.types';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('register')
  register(@Body() userData: ICreateUserData) {
    
    return this.authService.register(userData);
  }

  @Get('user')
  getUserById(@Query() query: { id: string }) {
    return this.authService.getUserById(query.id);
  }



  @Get('tgUser')
  async getUserByTgId(@Query() query: { id: string }) {

    return this.authService.getUserByTgId(query.id);
    
  }


  @Get('freelancers')
  getFreelancers(@Query() {categories, maxPrice, minPrice, specializations, sorting, term , sortType}:IFreelanceQueryParams ) {

   
    const stringToArr = ( str: string | undefined ) : number[] | null => {

      if ( !str ) return null
      return str.split(',').map( num => +num )

    }

    const filtersParams = {
      minPrice: minPrice ? +minPrice : null,
      maxPrice: maxPrice ? +maxPrice : null,
      categories: stringToArr(categories),
      specializations: stringToArr(specializations),

      sorting: sorting,
      sortType: sortType === 'asc' || sortType === 'desc' ? sortType : null,
      term: term,
    }

    return this.authService.getFreelance(filtersParams);
  }

  @Get('categories')
  async getCategories() {
    return this.authService.getCategories();
  }


  @Get('ordersInWork')
  async getMyOrders(@Query() query : {useIdTg: string}) {
    return this.authService.getOrdersInWork(query.useIdTg)
  }

  @Get('specializations')
  async getSpecializations() {
    return this.authService.getSpecializations()
  }
}
