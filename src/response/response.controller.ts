import { Body, Controller, Post } from '@nestjs/common';
import { ResponseService } from './response.service';

@Controller('response')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}


  @Post()
  async sendResponse (@Body() body: {text: string, orderId: string, authorTgId: string }) {

    console.log(body);
    
    return this.responseService.create(body)
  }

  @Post('chooseExecuter')
  async chooseExecuter (@Body() params: {responseId: string, orderId: string, }) {

  console.log(params);
  
    
    return this.responseService.chooseResponse(params)
  }
}
