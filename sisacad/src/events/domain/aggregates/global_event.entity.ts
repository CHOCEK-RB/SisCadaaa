import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum EventType {
  ACADEMIC = 'academic',
  GRADING = 'grading',
  LAB_ENROLLMENT = 'lab_enrollment',
}

@Entity('global_events')
export class GlobalEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, unique: true })
  name: string;

  @Column('enum', { enum: EventType })
  type: EventType;

  @Column('timestamptz')
  startDate: Date;

  @Column('timestamptz')
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;
}
