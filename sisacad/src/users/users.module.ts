import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './aggregates/user.entity';
import { Student } from './aggregates/student.entity';
import { Teacher } from './aggregates/teacher.entity';
import { Secretary } from './aggregates/secretary.entity';
import { Admin } from './aggregates/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Teacher, Secretary, Admin]),
  ],
})
export class UserModule {}
