import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { randomUUID } from 'crypto';
import path from 'path';

const DEFAULT_SYLLABUS_DIR = path.join(process.cwd(), 'uploads', 'syllabus');

@Injectable()
export class StorageService {
  private readonly syllabusDir: string;

  constructor() {
    this.syllabusDir =
      process.env.SYLLABUS_UPLOAD_DIR?.trim() || DEFAULT_SYLLABUS_DIR;
  }

  async saveSyllabus(
    academicCourseId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const directory = path.join(this.syllabusDir, academicCourseId);
    await fs.mkdir(directory, { recursive: true });

    const filename = `${randomUUID()}.pdf`;
    const filePath = path.join(directory, filename);
    await fs.writeFile(filePath, file.buffer);

    return this.getSyllabusUrl(academicCourseId, filename);
  }

  getSyllabusPath(academicCourseId: string, filename: string): string {
    return path.join(this.syllabusDir, academicCourseId, filename);
  }

  getSyllabusUrl(academicCourseId: string, filename: string): string {
    return `/api/storage/syllabus/${academicCourseId}/${filename}`;
  }
}