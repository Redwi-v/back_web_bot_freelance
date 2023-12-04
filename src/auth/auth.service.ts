import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { ICreateUserData, IFreelanceFindParams, SortingValues } from './auth.types';
import { fileStorage } from 'src/files/storage';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(userData: ICreateUserData) {
    try {
      return this.prisma.user.create({
        data: {
          age: userData.age,
          email: userData.email,
          name: userData.name,
          telegramId: userData.telegramId,
          about: userData.about,
          telegramLink: userData.telegramLink,

          activeRole: {
            connect: {
              index: userData.activeRoleIndex || 'customer',
            },
          },

          avatarUrl: userData.avatarUrl,

          categories: {
            connect: userData.categoriesIdentifiers || [],
          },
          specializations: {
            connect: userData.specializationIdentifiers || [],
          },
        },
      });
    } catch (error) {
      console.error(error);

      throw new BadRequestException('failed to create user', {
        description: error.message,
      });
    }
  }

  async getUserById(id: number | string) {
    try {
      const data = await this.prisma.user.findUnique({
        where: { id: +id },
        include: {
          categories: true,
          activeRole: true,
          Orders: true,
          responses: true,
          reviewsList: {
            include: {
              Author: true
            }
          },
          specializations: true,
        },
      });

      if (!data) throw new NotFoundException('user not found');

      return data;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Server err', {
        description: error.message,
      });
    }
  }

  async getUserByTgId(TgId: string) {
    try {
      const data = await this.prisma.user.findUnique({
        where: {
          telegramId: String(TgId),
        },
        include: {
          activeRole: true,
          categories: true,
          responses: true,
          reviewsList: {
            include: {
              Author: true
            }
          },
          reviewsListAuthor: {
            include: {
              Author: true
            }
          },
          Connects: true,
        },
      });

      if (!data) throw new NotFoundException('user not found');

      return data;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Server err', {
        description: error.message,
      });
    }
  }

  async getFreelance(params: IFreelanceFindParams) {
    const { categories, maxPrice, minPrice, sorting, specializations, term , sortType } = params;
    try {


      let findParams: Prisma.UserFindManyArgs = {
        where: {
          activeRole: {
            index: 'freelancer',
          },
        },
      };

      if (categories) {
        findParams.where = {
          ...findParams.where,
          categories: {
            some: {
              id: {
                in: categories || [],
              },
            },
          },
        };
      }

      if (specializations) {
        findParams.where = {
          ...findParams.where,
          specializations: {
            some: {
              id: {
                in: specializations || [],
              },
            },
          },
        };
      }

      if (minPrice && maxPrice) {
        findParams.where = {
          ...findParams.where,
         
          rate: {
            gte: minPrice,
            lte: maxPrice
          }
        };
      }
   
      if (sorting === SortingValues.PRICE && sortType && (sortType === 'asc' || sortType === 'desc')) {
        findParams = {
          ...findParams,
          orderBy: {
            rate: sortType
          }
        }
      }

      if (sorting === SortingValues.RATING && sortType && (sortType === 'asc' || sortType === 'desc')) {
        findParams = {
          ...findParams,
          orderBy: {
            rating: sortType
          }
        }
      }

      if(term) {
        findParams.where = {
          ...findParams.where,
          OR: [
            {
              name: {
                contains: term,
                mode: 'insensitive'
              }
            },
            {
              about: {
                contains: term,
                mode: 'insensitive'
              }
            }
          ]
        }
      }

      
      
      return this.prisma.user.findMany({
        ...findParams,
    

        include: {
          categories: true,
          specializations: true
        },
      });

    } catch (error) {
      console.log(error);
      throw new BadRequestException('Server Err', {
        description: error.message,
      });
    }
  }

  async getCategories() {
    return this.prisma.categorie.findMany({});
  }

  async getOrdersInWork(useTgId: string) {
    return this.prisma.order.findMany({
      where: {
        status: 'inWork',
        executor: {
          telegramId: useTgId
        }
      },
      include: {
        author: true
      }
    })
  }

  async getCompletedOrders(useTgId: string) {
    return this.prisma.order.findMany({
      where: {
        status: 'completed',
        executor: {
          telegramId: useTgId
        }
      }
    })
  }

  async getSpecializations() {
    return this.prisma.specialization.findMany()
  }

  async getAuthorConnects (params: {telegramId: string}) {
    return this.prisma.order.findMany({
      where: {
        author: {
          telegramId: params.telegramId
        },
        status: 'inWork'
      },
      include: {
        executor: true
      }
    })
  }

  async updateProfile (telegramId: string, data: IProfileUpdateData) {
    try {
      
      const updatedParams: Prisma.UserUpdateInput = {}


      if(data.avatarUrl) {
        // fileStorage()

        updatedParams.avatarUrl = data.avatarUrl
      }

      console.log(updatedParams);
      
      const res = await this.prisma.user.update({
        where: {
          telegramId
        },
        data: {
          ...updatedParams,
        }
      })

    } catch (error) {
      console.log(error);
      
    }
  }
}

interface IProfileUpdateData {
  avatarUrl?: string
}