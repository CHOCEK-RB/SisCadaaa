import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './domain/aggregates/user.entity';
import { Student } from './domain/aggregates/student.entity';
import { Teacher } from './domain/aggregates/teacher.entity';
import { Secretary } from './domain/aggregates/secretary.entity';
import { Admin } from './domain/aggregates/admin.entity';

import { UsersController } from './presentation/controllers/users.controller';
import { UserService } from './application/services/user.service';
import { UserMapper } from './application/mappers/user.mapper';

import { IUserRepository } from './domain/repositories/iuser.repository';
import { IStudentRepository } from './domain/repositories/istudent.repository';
import { ITeacherRepository } from './domain/repositories/iteacher.repository';
import { ISecretaryRepository } from './domain/repositories/isecretary.repository';
import { IAdminRepository } from './domain/repositories/iadmin.repository';

import { UserPostgresRepository } from './infrastructure/persistence/user.postgres.repository';
import { StudentPostgresRepository } from './infrastructure/persistence/student.postgres.repository';
import { TeacherPostgresRepository } from './infrastructure/persistence/teacher.postgres.repository';
import { SecretaryPostgresRepository } from './infrastructure/persistence/secretary.postgres.repository';
import { AdminPostgresRepository } from './infrastructure/persistence/admin.postgres.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Teacher, Secretary, Admin]),
  ],

  controllers: [UsersController],
  providers: [
    UserService,
    UserMapper,
    {
      provide: IUserRepository,
      useClass: UserPostgresRepository,
    },
    {
      provide: IStudentRepository,
      useClass: StudentPostgresRepository,
    },
    {
      provide: ITeacherRepository,
      useClass: TeacherPostgresRepository,
    },
    {
      provide: ISecretaryRepository,
      useClass: SecretaryPostgresRepository,
    },
    {
      provide: IAdminRepository,
      useClass: AdminPostgresRepository,
    },
  ],
  exports: [
    IUserRepository,
    IStudentRepository,
    ITeacherRepository,
    ISecretaryRepository,
    IAdminRepository,
  ],
})
export class UserModule {}
