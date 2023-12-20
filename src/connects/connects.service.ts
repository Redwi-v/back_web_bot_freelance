import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { sendResponseParams } from './types';

@Injectable()
export class ConnectsService {
  constructor(private prisma : PrismaService) {}

  async create (order :  Prisma.OrderGetPayload<{include: {author: true, executor: true}}>){
    try {

      const connect = await this.prisma.connect.findFirst({
        where: {
          order: {
            id: order.id
          }
        }
      })

      if(connect) return 

      const {executor, author} = order
      
      
      await this.prisma.connect.create({
        data: {
          User:{
            connect: {
              telegramId:  String(executor?.telegramId),
            }
          },
          user2: {
            connect: {
              telegramId:  String(author.telegramId)
            }
          },
          order: {
            connect: {
              id: order.id
            }
          },
        }
      })
            
      await this.prisma.connect.create({
        data: {
          User:{
            connect: {
              telegramId:  String(author.telegramId)
            }
          },
          user2: {
            connect: {
              telegramId:  String(executor?.telegramId)
            }
          },
          order: {
            connect: {
              id: order.id
            }
          },
        }
      })


    } catch (error) {

      console.log(error);
      throw new BadRequestException(error.message)

    }
  }

  async delete (userTgId: string, connectId: string) {
    
    try {
      
      if(!userTgId) throw new BadRequestException('Введите userId') 
      
      await this.prisma.connect.delete({
        where: {
          id: +connectId,
          User: {
            telegramId: userTgId
          }
        }
      })
            
    } catch (error) {

      console.log(error);
      throw new BadRequestException(error.message)

    }
  }

  async getAll (userTgId: string) {
    try {

      return this.prisma.connect.findMany({
        where: {
          User: {
            telegramId: userTgId
          }
        },
        include: {
          order: true,
          User: true,
          user2: true
        }
      })

      
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message)

    }
  }

  async getById (id: number | string) {
    try {

      const res = await this.prisma.connect.findUnique({
        where: {
          id: +id
        },
        include: {
          order: true,
          User: true,
          user2: true
        }
      })

     await this.prisma.connect.update({
        where: {
          id: +id
        },
        data: {
          isChecked: true
        }
      })

      

      return res
      
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message)
    }
  }

  async sendReview (params: sendResponseParams) {
    try {

      const {rating, text, authorTelegramId, userTelegramId, connectId} = params

      const review = await this.prisma.review.create({
        data: {
          rating:  rating,
          text: text,
          Author: {
            connect: {
              telegramId: String(authorTelegramId)
            }
          },
          User: {
            connect: {
              telegramId: String(userTelegramId)
            }
          },
          connect: {
            connect: {
              id: +connectId
            }
          }
          
        },
        include: {
          User: {
            include: {
              reviewsList: true
            }
          }
        }
      })

      let allRating = 0
      const reviewsCount = review.User?.reviewsList.length || 0

      review.User?.reviewsList.forEach(review => {
        allRating += review.rating
      })

      const updatedRating = allRating / reviewsCount
      
      await this.prisma.user.update({
        where: {
          telegramId: review.User?.telegramId
        },
        data: {
          rating: +updatedRating.toFixed(2)
        }
      })

      return review
      
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message)
    }
  }

}

