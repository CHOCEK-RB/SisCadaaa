import { Module, forwardRef } from "@nestjs/common";

import { AttendanceModule } from "../attendance/attendance.module";
import { EnrollmentModule } from "../enrollment/enrollment.module";
import { UserModule } from "../users/users.module";

import { StudentAttendanceController } from "./presentation/controllers/student-attendance.controller";
import { StudentEnrollmentController } from "./presentation/controllers/student-enrollment.controller";
import { StudentController } from "./presentation/controllers/student.controller";
import { StudentService } from "../student/application/services/student.service";

@Module({
  imports: [
    forwardRef(() => AttendanceModule),
    forwardRef(() => EnrollmentModule),
    forwardRef(() => UserModule),
  ],
  controllers: [
    StudentAttendanceController,
    StudentEnrollmentController,
    StudentController,
  ],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
