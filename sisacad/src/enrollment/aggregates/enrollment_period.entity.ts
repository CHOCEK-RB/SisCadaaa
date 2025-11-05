import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum PeriodType {
  LABORATORY = 'laboratory',
}

@Entity('enrollment_periods')
export class EnrollmentPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  name: string;

  @Column('enum', { enum: PeriodType })
  type: PeriodType;

  @Column('timestamptz')
  startDate: Date;

  @Column('timestamptz')
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;
}
