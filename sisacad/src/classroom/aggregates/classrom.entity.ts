import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum ClassroomType {
  NORMAL = 'normal',
  LABORATORY = 'laboratory',
}

@Entity()
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('varchar', { length: 50 })
  name: string;

  @Column('enum', { enum: ClassroomType, default: ClassroomType.NORMAL })
  type: ClassroomType;
}
