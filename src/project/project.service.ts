import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    files: Prisma.FileCreateInput[],
    project: {
      data: Prisma.ProjectCreateInput;
      categoriesIdes: number[];
    },
    userTgId: string,
  ) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          telegramId: userTgId,
        },
      });

      if (!user) throw new BadRequestException('Пользователь не найдет');

      const projectIdes = project.categoriesIdes.map((id) => ({ id: id }));

      const createdProject = await this.prisma.project.create({
        data: {
          ...project.data,
          User: {
            connect: {
              id: user?.id,
            },
          },
          categories: {
            connect: projectIdes,
          },
        },

        include: {
          categories: true,
          images: true,
        },
      });

      const filesWidthProject = files.map((file) => {
        return {
          ...file,
          projectId: createdProject.id,
        } as Prisma.FileCreateInput;
      });

      await this.prisma.file.createMany({
        data: filesWidthProject,
      });

      return createdProject;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAll(userTgId: string) {
    try {
      return this.prisma.project.findMany({
        where: {
          User: {
            telegramId: userTgId,
          },
        },
        include: {
          categories: true,
          images: true,
          User: true,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async update(data: updateFiles) {
    if (!data.id) return;

    const activeCategories = await this.prisma.project.findUnique({
      where: {
        id: +data.id
      },
      include: {
        categories: true
      }
    })
 

    const project = await this.prisma.project.update({
      where: {
        id: +data.id,
      },
      data: {
        categories: {
          disconnect: activeCategories?.categories.map(cat => ({id: cat.id})),
          connect: data.categories?.map(id => ({id: id}))
        },
        description: data.description,
        title: data.title,
      }
    });

    if (data.files?.length) {
      await this.prisma.file.createMany({
        data: data.files.map((file) => ({
          fileName: file.fileName,
          originalname: file.originalname,
          projectId: project?.id,
          path: file.path,
        })),
      });
    }
    
    if (data.delete?.length) {

      await this.prisma.file.deleteMany({
        where: {
          fileName: {
            in: data.delete,
          },
        },
      });

      data.delete.forEach((fileName) => {
        fs.unlink(join(__dirname, '../../..', 'uploads', fileName), (err) => {
          if (err) {
            console.error(err);
            return err;
          }
        });
      });

    }

  }


  async delete (id: string) {
    try {

      const res = await this.getById(id)

      res?.images.forEach(({fileName}) => {
        fs.unlink(join(__dirname, '../../..', 'uploads', fileName), (err) => {
          if (err) {
            console.error(err);
            return err;
          } 
        });
      });
      
      return this.prisma.project.delete({
        where: {
          id: +id
        }
      })

    } catch (error) {
      console.log(error);
      
    }
  }

  async getById(id: string) {
    
    return this.prisma.project.findUnique({
      where: {
        id: +id
      },
      include: {
        categories: true,
        images: true,
        User: true
      }
    })
  }

}

interface updateFiles {
  title?: string;
  categories?: number[];
  description?: string;
  id?: string;
  delete?: string[];
  files?: Prisma.FileCreateInput[];
}
