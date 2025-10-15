import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('varchar', { length: 60 })
  name: string;

  @Column('int')
  credits: number;

  @Column('int')
  semester: number;

  @ManyToMany(() => Course)
  @JoinTable()
  preRrqs: Course[];
}
