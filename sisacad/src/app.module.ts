import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ProfileModule } from './domain/profiles/profile.module';
import { CourseModule } from './domain/courses/course.module';
import { ClassroomModule } from './domain/classroom/classrom.module';
import { GroupsModule } from './domain/groups/groups.module';
import { AttendanceModule } from './domain/attendance/attendance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.db.env'] }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),

    ProfileModule,
    CourseModule,
    ClassroomModule,
    AttendanceModule,
    GroupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
