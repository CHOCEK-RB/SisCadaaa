import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';

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

  @OneToOne(() => User, (user) => user.teacherProfile, { cascade: true })
  @JoinColumn()
  user: User;
}
