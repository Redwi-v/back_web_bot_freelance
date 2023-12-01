import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { IUpdateProfile } from './types';

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  async create (data : IUpdateProfile) {

    const updatedParams: Prisma.UserUpdateInput = {}


    if(data.file) {
      updatedParams.avatarUrl = data.file.path
    }

    if(data.name) {
      updatedParams.name = data.name
    }
    if(data.lastName) {
      updatedParams.lastName = data.lastName
    }

    if(data.email) {
      updatedParams.email = data.email
    }
    if(data.about) {
      updatedParams.about = data.about
    }

    const res = await this.prisma.user.update({
      data: {
        ...updatedParams
      },
      where: {
        telegramId: data.telegramId
      }
    })
    

    return res


  }

}

