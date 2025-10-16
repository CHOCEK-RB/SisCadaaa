import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ISeederService } from './application/iseeder.service';
import { SeederService } from './application/seeder.service';
import { UserModule } from '../users/users.module';
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
  ],
  exports: [ISeederService],
})
export class SeedingModule {}
