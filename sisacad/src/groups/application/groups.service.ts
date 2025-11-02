import { Injectable, Inject, NotFoundException } from '@nestjs/common';

import { IAcademicGroupRepository } from '../infrastructure/iacademic_group.repository';
import { IStudentRepository } from 'src/users/infrastructure/istudent.repository';
import { JwtPayload } from 'src/auth/interface/jwt-payload.interface';
import { AcademicGroupDTO } from './academic_group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(IAcademicGroupRepository)
    private readonly academicGroupRepository: IAcademicGroupRepository,
    @Inject(IStudentRepository)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async findScheduleForCAcademicCourse(id: string, user: JwtPayload) {}
}
