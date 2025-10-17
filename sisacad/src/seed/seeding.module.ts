import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ISeederService } from './application/iseeder.service';
import { ISeederServiceAcademic } from './application/iseeder_academic.service';

import { SeederService } from './application/seeder.service';
import { SeeederServiceAcademic } from './application/seeder_academic.service';

import { UserModule } from 'src/users/users.module';
import { CourseModule } from 'src/courses/course.module';

import { typeOrmConfig } from '../config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.db.env', '.env'] }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    UserModule,
    CourseModule,
  ],

  providers: [
    {
      provide: ISeederService,
      useClass: SeederService,
    },
    {
      provide: ISeederServiceAcademic,
      useClass: SeeederServiceAcademic,
    },
  ],
  exports: [ISeederService, ISeederServiceAcademic],
})
export class SeedingModule {}
