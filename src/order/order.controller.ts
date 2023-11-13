import { Controller, Post, Body, Get, Query, Put } from '@nestjs/common';
import { OrderService } from './order.service';
import { IOrder } from './order.types';
import { IFreelanceQueryParams } from 'src/auth/auth.types';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  createOrder(@Body() orderData: IOrder) {
    console.log(orderData);

    return this.orderService.createOrder(orderData);
  }

  @Get()
  getOrderById(@Query() query: { id: string }) {
    return this.orderService.getOrderById(+query.id);
  }

  @Get('inArchive')
  getAllInArchive(@Query() query: {userTgId: string}) {
    return this.orderService.getAllArchiveOrdersByTgId(query.userTgId)
  }

  @Get('userOrders')
  getUserOrders(@Query() query: {userTgId: string}) {
    return this.orderService.getAllOrdersByTgId(query.userTgId)
  }

  @Put('inArchive')
  InArchive(
    @Body() body: { authorTgId: string | number; orderId: string | number },
  ) {

    return this.orderService.archive(body.authorTgId, body.orderId);
  }
  @Put('unzip')
  unzip(
    @Body() body: { authorTgId: string | number; orderId: string | number },
  ) {

    return this.orderService.unzip(body.authorTgId, body.orderId);
  }

  @Get('all')
  getOrderAllOrders(
    @Query()
    {
      categories,
      maxPrice,
      minPrice,
      specializations,
      sorting,
      term,
      sortType,
    }: IFreelanceQueryParams,
  ) {
    const stringToArr = (str: string | undefined): number[] | null => {
      if (!str) return null;
      return str.split(',').map((num) => +num);
    };

    const filtersParams = {
      minPrice: minPrice ? +minPrice : null,
      maxPrice: maxPrice ? +maxPrice : null,
      categories: stringToArr(categories),
      specializations: stringToArr(specializations),

      sorting: sorting,
      sortType: sortType === 'asc' || sortType === 'desc' ? sortType : null,
      term: term,
    };

    return this.orderService.getAllOrders(filtersParams);
  }


  @Put('closeOrder')
  closeOrder (@Body() body : {userTgId: string, orderId: string}) {
    return this.orderService.closeOrder(body.userTgId, body.orderId)
  }
}
