import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ConnectsService } from './connects.service';
import { sendResponseParams } from './types';

@Controller('connects')
export class ConnectsController {
  constructor(private readonly connectsService: ConnectsService) {}

  @Delete('/')
  async delete (@Query() {telegramId, connectId}: {telegramId: string, connectId: string}) {
    return this.connectsService.delete(telegramId, connectId)
  }

  @Get('/all')  
  async getAll (@Query() {telegramId}: {telegramId: string}) {
    return this.connectsService.getAll(telegramId)
  }


  @Get('/')
  async getById (@Query() {connectId}: {connectId: string}) {
    return this.connectsService.getById(connectId)
  }

  @Post('/review')
  async sendReview (@Body() params: sendResponseParams) {
    console.log(params);
    
    return  this.connectsService.sendReview(params)
  }

}
