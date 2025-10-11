import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { ScheduleSlot } from './schedule.entity';

export enum GroupType {
  LABORATORY = 'laboratory',
  THEORY = 'theory',
  PRACTICE = 'practice',
}

@Entity()
export class AcademicGroup {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('int')
  capacity: number;

  @Column('enum', { enum: GroupType, default: GroupType.THEORY })
  type: GroupType;

  @OneToMany(() => ScheduleSlot, (slot) => slot.academicGroup, {
    cascade: true,
    eager: true,
  })
  schedule: ScheduleSlot[];
}
