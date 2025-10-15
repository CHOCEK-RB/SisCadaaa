import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 70 })
  name: string;

  @Column('varchar', { length: 70 })
  firstLastName: string;

  @Column('varchar', { length: 70 })
  secondLastName: string;

  @OneToOne(() => User, (user) => user.adminProfile, { cascade: true })
  @JoinColumn()
  user: User;
}
