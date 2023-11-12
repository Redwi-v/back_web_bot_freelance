import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { IOrder } from './order.types';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}


  @Post()
  createOrder(@Body() orderData: IOrder) {
    console.log(orderData);
    
    return this.orderService.createOrder(orderData)
  }

  @Get()
  getOrderById(@Query() query: {id: string}) {
    
    
    return this.orderService.getOrderById(+query.id)
  }
}
