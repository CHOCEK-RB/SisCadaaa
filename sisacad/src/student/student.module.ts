import { Module, forwardRef } from '@nestjs/common';

import { AttendanceModule } from '../attendance/attendance.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { UserModule } from '../users/users.module';

import { StudentAttendanceController } from './presentation/controllers/student-attendance.controller';
import { StudentEnrollmentController } from './presentation/controllers/student-enrollment.controller';

@Module({
  imports: [
    forwardRef(() => AttendanceModule),
    forwardRef(() => EnrollmentModule),
    forwardRef(() => UserModule),
  ],
  controllers: [StudentAttendanceController, StudentEnrollmentController],
  providers: [],
  exports: [],
})
export class StudentModule {}

