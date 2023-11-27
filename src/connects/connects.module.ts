import { Module } from '@nestjs/common';
import { ConnectsService } from './connects.service';
import { ConnectsController } from './connects.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ConnectsController],
  providers: [ConnectsService, PrismaService],
})
export class ConnectsModule {}
