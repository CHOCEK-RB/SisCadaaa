import { Module, forwardRef } from "@nestjs/common";
import { TeacherController } from "./presentation/controllers/teacher.controller";
import { TeacherService } from "./application/services/teacher.service";
import { UserModule } from "src/users/users.module";

@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
