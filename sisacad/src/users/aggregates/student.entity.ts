import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 70 })
  name: string;

  @Column('varchar', { length: 70 })
  lastName: string;

  @Column({ nullable: true })
  semester?: number;

  @OneToOne(() => User, (user) => user.studentProfile, { cascade: true })
  @JoinColumn()
  user: User;
}
