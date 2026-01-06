import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from './user.entity';
import { AcademicGroup } from 'src/groups/domain/aggregates/academic_group.entity';
import { AcademicCourse } from 'src/courses/domain/aggregates/academic_course.entity';
import { Attendance } from 'src/attendance/domain/aggregates/attendance.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 70 })
  name: string;

  @Column('varchar', { length: 70 })
  firstLastName: string;

  @Column('varchar', { length: 70 })
  secondLastName: string;

  @OneToOne(() => User, (user) => user.teacherProfile, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @OneToMany(() => AcademicCourse, (course) => course.coordinator)
  coordinatedCourses: Promise<AcademicCourse[]>;

  @OneToMany(() => AcademicGroup, (groups) => groups.teacher)
  groups: Promise<AcademicGroup[]>;

  @OneToMany(() => Attendance, (attendances) => attendances.teacher)
  attendances: Promise<Attendance[]>;
}
