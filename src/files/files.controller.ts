import { Body, Controller, Delete, MaxFileSizeValidator, Param, ParseFilePipe, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesService } from './files.service';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express'
import { fileStorage } from './storage';

import * as fs from 'fs';
import {join} from 'path'
import { json } from 'stream/consumers';
import { response } from 'express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { IUpdateProfile } from './types';




@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }



  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: fileStorage,
    }),
  )
  create(
    @Body() body: IUpdateProfile,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })],
        fileIsRequired: false
      }),
    )
    file?: Express.Multer.File,
    // @UserId() userId: number,
  ) {

    if(file) {
      body.file = file
    }
  
    return this.filesService.create(body);
  }
  
  @Post('many')
  @UseInterceptors(AnyFilesInterceptor({
    storage: fileStorage
  }))
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>) {
    console.log(files);
  }
  


  @Delete()
  async deletePicture(@Query('fileName') fileName: string) {
    await fs.unlink(join(__dirname, '../../..','uploads', fileName), (err) => {
      if (err) {
        console.error(err);
        return err;
      }
    });
  }
}
