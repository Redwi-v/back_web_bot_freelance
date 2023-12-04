import { Body, Controller, Delete, Get, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ProjectService } from './project.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { fileStorage } from 'src/files/storage';
import { Prisma } from '@prisma/client';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}


  @Post()
  @UseInterceptors(AnyFilesInterceptor({
    storage: fileStorage
  }))
  create (
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: {
      categories: string,
      description: string,
      userTgId: string,
      title: string,
    }
  ) {

    const mappedFiles: Prisma.FileCreateInput[] = files.map(file => {
      return {
        fileName: file.filename,
        originalname: file.originalname,
        path: file.path,
      }
    })

    const project =  {
      data: {
        title: body.title,
        description: body.description,
      },
      categoriesIdes: body.categories.split(',').map(id => +id)
    }

    console.log(project);
    
    return this.projectService.create(mappedFiles,project, body.userTgId )

  }

  @Get()
  async getAll (@Query() query: {userTgId: string}) {
    return this.projectService.getAll(query.userTgId)
  }

  @Put()
  @UseInterceptors(AnyFilesInterceptor({
    storage: fileStorage
  }))
  async update(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: {
      title?: string,
      categories?: string,
      description?: string,
      id: string,
      delete?: string
    }
  ) {

    this.projectService.update({

      files: files.map(file => ({fileName: file.filename, originalname: file.originalname, path: file.path})),
      categories: body.categories ? body.categories.split(',').map(strId => +strId) : [],
      delete: body.delete ? body.delete.split(',') : [],
      description: body.description,
      title: body.title,
      id: body.id,

    })

  }

  @Delete()
  async delete (@Query() body: {id: string}) {

    return this.projectService.delete(body.id)
    
  }

  @Get('id')
   async getProjectById(@Query() query: {id: string}) {
    return this.projectService.getById(query.id)
  }
}
