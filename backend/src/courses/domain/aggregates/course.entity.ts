import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { AcademicCourse } from "./academic_course.entity";

@Entity()
export class Course {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  code: string;

  @Column("varchar", { length: 60 })
  name: string;

  @Column("int")
  credits: number;

  @Column("int")
  semester: number;

  @ManyToMany(() => Course)
  @JoinTable()
  preRrqs: Course[];

  @OneToMany(() => AcademicCourse, (academicCourse) => academicCourse.course)
  academicCourses: Promise<AcademicCourse[]>;
}
