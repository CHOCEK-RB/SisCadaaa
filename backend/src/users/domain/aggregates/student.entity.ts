import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Enrollment } from 'src/enrollment/domain/aggregates/enrollment.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  cui: string;

  @Column('varchar', { length: 70 })
  name: string;

  @Column('varchar', { length: 70 })
  firstLastName: string;

  @Column('varchar', { length: 70 })
  secondLastName: string;

  @Column({ default: 1 })
  semester: number;

  @OneToOne(() => User, (user) => user.studentProfile, { cascade: true })
  @JoinColumn()
  user: User;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments: Enrollment[];
}
