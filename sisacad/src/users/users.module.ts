import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './aggregates/user.entity';
import { Student } from './aggregates/student.entity';
import { Teacher } from './aggregates/teacher.entity';
import { Secretary } from './aggregates/secretary.entity';
import { Admin } from './aggregates/admin.entity';

import { UsersController } from './presentation/users.controller';
import { UsersApplicationService } from './application/users.application.service';

import { IUserRepository } from './infrastructure/iuser.repository';
import { IStudentRepository } from './infrastructure/istudent.repository';

import { UserPostgresRepository } from './infrastructure/user.postgres.repository';
import { StudentPostgresRepository } from './infrastructure/student.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Teacher, Secretary, Admin]),
  ],

  controllers: [UsersController],
  providers: [
    UsersApplicationService,
    {
      provide: IUserRepository,
      useClass: UserPostgresRepository,
    },
    {
      provide: IStudentRepository,
      useClass: StudentPostgresRepository,
    },
  ],
  exports: [IUserRepository, IStudentRepository],
})
export class UserModule {}
