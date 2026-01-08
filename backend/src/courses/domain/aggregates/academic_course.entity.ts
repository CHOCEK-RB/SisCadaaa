import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";

import { Course } from "./course.entity";
import { CourseTopic } from "./course_topic.entity";

import { Teacher } from "src/users/domain/aggregates/teacher.entity";
import { AcademicGroup } from "src/groups/domain/aggregates/academic_group.entity";
import { Enrollment } from "src/enrollment/domain/aggregates/enrollment.entity";
import { TopicProgress } from "./topic_progress.entity";
import { GlobalEvent } from "src/events/domain/aggregates/global_event.entity"; // Added

export class GradingScheme {
  firstContinue: number;
  secondContinue: number;
  thirdContinue: number;
  firstPartial: number;
  secondPartial: number;
  thirdPartial: number;
}

@Entity()
export class AcademicCourse {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.coordinatedCourses, {
    nullable: true,
    onDelete: "SET NULL",
  })
  coordinator: Teacher | null;

  @Column("timestamptz")
  creationDate: Date;

  @Column({ nullable: true })
  urlSyllabus?: string;

  @Column("jsonb", { nullable: true })
  grades?: GradingScheme;

  @ManyToOne(() => Course, (course) => course.academicCourses)
  course: Course;

  @ManyToOne(() => GlobalEvent, { eager: true }) // Added
  academicPeriod: GlobalEvent; // Added

  @OneToMany(() => AcademicGroup, (group) => group.academicCourse)
  groups: AcademicGroup[];

  @OneToMany(() => CourseTopic, (topics) => topics.course)
  topics: CourseTopic[];

  @OneToMany(() => Enrollment, (enrollments) => enrollments.course)
  enrollments: Enrollment[];

  @OneToMany(() => TopicProgress, (progress) => progress.academicCourse)
  progress: TopicProgress[];
}
