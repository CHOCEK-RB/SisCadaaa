import { ScheduleSlot } from 'src/groups/domain/aggregates/schedule.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

export enum ClassroomType {
  NORMAL = 'normal',
  LABORATORY = 'laboratory',
}

@Entity()
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50 })
  name: string;

  @Column()
  location: string;

  @Column('enum', { enum: ClassroomType, default: ClassroomType.NORMAL })
  type: ClassroomType;

  @OneToMany(() => ScheduleSlot, (schedule) => schedule.classroom)
  schedules: Promise<ScheduleSlot[]>;
}
