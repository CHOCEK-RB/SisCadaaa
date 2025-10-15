import { Entity, Column } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Student extends User {
  @Column('int')
  semestre: number;
}
