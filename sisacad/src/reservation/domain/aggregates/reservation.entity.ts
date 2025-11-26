import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/domain/aggregates/user.entity';
import { Classroom } from 'src/classroom/domain/aggregates/classroom.entity';

export enum ReservationStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => Classroom, { eager: true })
  classroom: Classroom;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
