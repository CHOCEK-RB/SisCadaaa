import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import path from 'path';
import { promises as fs } from 'fs';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('syllabus/:academicCourseId/:filename')
  async getSyllabus(
    @Param('academicCourseId', ParseUUIDPipe) academicCourseId: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const safeFilename = path.basename(filename);
    const filePath = this.storageService.getSyllabusPath(
      academicCourseId,
      safeFilename,
    );

    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundException('Syllabus not found');
    }

    return res.sendFile(filePath);
  }
}